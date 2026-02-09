import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

// Get available time slots for a date
router.get('/slots', authenticateToken, async (req, res) => {
  try {
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ error: 'Date and serviceId are required' });
    }

    // Get service duration to check slot overlaps
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get all bookings for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'cancelled'
        }
      },
      include: {
        service: true
      }
    });

    // Generate all possible time slots
    const allSlots = generateTimeSlots();

    // Filter out booked slots (considering service duration)
    const bookedSlots = new Set();
    bookings.forEach(booking => {
      const bookingTime = booking.timeSlot;
      const [hours, minutes] = bookingTime.split(':').map(Number);
      const bookingMinutes = hours * 60 + minutes;
      const serviceDuration = booking.service.duration;

      // Mark slots as unavailable based on duration
      for (let i = 0; i < serviceDuration; i += 60) {
        const slotMinutes = bookingMinutes + i;
        const slotHours = Math.floor(slotMinutes / 60);
        const slotMins = slotMinutes % 60;
        const slotTime = `${slotHours.toString().padStart(2, '0')}:${slotMins.toString().padStart(2, '0')}`;
        bookedSlots.add(slotTime);
      }
    });

    const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bikeId, serviceId, date, timeSlot, serviceType, address } = req.body;

    // Validation
    if (!bikeId || !serviceId || !date || !timeSlot || !serviceType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if ((serviceType === 'pickup' || serviceType === 'home') && !address) {
      return res.status(400).json({ error: 'Address is required for pickup and home services' });
    }

    // Verify bike belongs to user
    const bike = await prisma.bike.findUnique({
      where: { id: parseInt(bikeId) }
    });

    if (!bike || bike.userId !== req.user.id) {
      return res.status(403).json({ error: 'Invalid bike selection' });
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service || !service.isActive) {
      return res.status(404).json({ error: 'Service not found or inactive' });
    }

    // Check slot availability
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate,
        timeSlot,
        status: {
          not: 'cancelled'
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        bikeId: parseInt(bikeId),
        serviceId: parseInt(serviceId),
        date: bookingDate,
        timeSlot,
        serviceType,
        address: address || null,
        totalAmount: service.price,
        status: 'pending'
      },
      include: {
        bike: true,
        service: true
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        bike: true,
        service: true,
        payment: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        bike: true,
        service: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Allow user to see their booking, or admin/mechanic to see any
    if (booking.userId !== req.user.id && !['admin', 'mechanic'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status (admin/mechanic only)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'mechanic'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: {
        bike: true,
        service: true
      }
    });

    res.json({
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking (user can cancel their own)
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'cancelled' },
      include: {
        bike: true,
        service: true
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;
