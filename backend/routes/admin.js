import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookings (admin/mechanic only)
router.get('/bookings', authenticateToken, authorizeRoles('admin', 'mechanic'), async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
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
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue,
      totalUsers,
      totalServices
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true }
      }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.service.count({ where: { isActive: true } })
    ]);

    res.json({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalUsers,
      totalServices
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            bikes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
