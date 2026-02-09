import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create payment for a booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookingId, method, amount } = req.body;

    if (!bookingId || !method || !amount) {
      return res.status(400).json({ error: 'Booking ID, method, and amount are required' });
    }

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { payment: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.payment) {
      return res.status(400).json({ error: 'Payment already exists for this booking' });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount,
        method,
        status: method === 'cod' ? 'pending' : 'completed'
      }
    });

    // Update booking status if payment completed
    if (method !== 'cod') {
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { status: 'confirmed' }
      });
    }

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payment by booking ID
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.bookingId) },
      include: { payment: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check access
    if (booking.userId !== req.user.id && !['admin', 'mechanic'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking.payment || null);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Update payment status (admin only)
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });

    // Auto-confirm booking if payment completed
    if (status === 'completed') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' }
      });
    }

    res.json({
      message: 'Payment status updated',
      payment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;
