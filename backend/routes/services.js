import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active services (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = { isActive: true };
    if (category) {
      where.category = category;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { price: 'asc' }
    });

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create new service (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;

    if (!name || !description || !price || !duration || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const service = await prisma.service.create({
      data: { name, description, price, duration, category }
    });

    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service (admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, description, price, duration, category, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, price, duration, category, isActive }
    });

    res.json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await prisma.service.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
