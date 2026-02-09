import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all bikes for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bikes = await prisma.bike.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bikes);
  } catch (error) {
    console.error('Get bikes error:', error);
    res.status(500).json({ error: 'Failed to fetch bikes' });
  }
});

// Get single bike by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bike = await prisma.bike.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    // Ensure user owns this bike
    if (bike.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(bike);
  } catch (error) {
    console.error('Get bike error:', error);
    res.status(500).json({ error: 'Failed to fetch bike' });
  }
});

// Add new bike (with optional image upload)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { brand, model, numberPlate } = req.body;

    // Validation
    if (!brand || !model || !numberPlate) {
      return res.status(400).json({ error: 'Brand, model, and number plate are required' });
    }

    // Check if number plate already exists
    const existingBike = await prisma.bike.findUnique({
      where: { numberPlate }
    });

    if (existingBike) {
      return res.status(400).json({ error: 'A bike with this number plate already exists' });
    }

    // Create bike data
    const bikeData = {
      userId: req.user.id,
      brand,
      model,
      numberPlate,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };

    const bike = await prisma.bike.create({
      data: bikeData
    });

    res.status(201).json({
      message: 'Bike added successfully',
      bike
    });
  } catch (error) {
    console.error('Add bike error:', error);
    res.status(500).json({ error: 'Failed to add bike' });
  }
});

// Update bike
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const bikeId = parseInt(req.params.id);
    const { brand, model, numberPlate } = req.body;

    // Check if bike exists and belongs to user
    const existingBike = await prisma.bike.findUnique({
      where: { id: bikeId }
    });

    if (!existingBike) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    if (existingBike.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if new number plate conflicts with another bike
    if (numberPlate && numberPlate !== existingBike.numberPlate) {
      const duplicatePlate = await prisma.bike.findFirst({
        where: {
          numberPlate,
          id: { not: bikeId }
        }
      });

      if (duplicatePlate) {
        return res.status(400).json({ error: 'A bike with this number plate already exists' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (brand) updateData.brand = brand;
    if (model) updateData.model = model;
    if (numberPlate) updateData.numberPlate = numberPlate;
    if (req.file) {
      // Delete old image if exists
      if (existingBike.image) {
        const oldImagePath = path.join(__dirname, '..', existingBike.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const bike = await prisma.bike.update({
      where: { id: bikeId },
      data: updateData
    });

    res.json({
      message: 'Bike updated successfully',
      bike
    });
  } catch (error) {
    console.error('Update bike error:', error);
    res.status(500).json({ error: 'Failed to update bike' });
  }
});

// Delete bike
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bikeId = parseInt(req.params.id);

    // Check if bike exists and belongs to user
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId }
    });

    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    if (bike.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete image file if exists
    if (bike.image) {
      const imagePath = path.join(__dirname, '..', bike.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete bike
    await prisma.bike.delete({
      where: { id: bikeId }
    });

    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    console.error('Delete bike error:', error);
    res.status(500).json({ error: 'Failed to delete bike' });
  }
});

export default router;
