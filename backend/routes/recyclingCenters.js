import express from 'express';
import RecyclingCenter from '../models/RecyclingCenter.js';

const router = express.Router();

// Get all recycling centers from Users
router.get('/', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const centers = await User.find({ role: 'recycler' })
      .select('name email phone address centerName wasteTypesProcessed paymentStatus createdAt')
      .sort({ createdAt: -1 });
    
    // Set default paymentStatus if not present
    const centersWithStatus = centers.map(center => ({
      ...center.toObject(),
      paymentStatus: center.paymentStatus || 'active'
    }));
    
    console.log('Found recycling centers:', centersWithStatus.length);
    res.json(centersWithStatus);
  } catch (error) {
    console.error('Error fetching recycling centers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get active recycling centers only
router.get('/active', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const centers = await User.find({ 
      role: 'recycler', 
      paymentStatus: 'active' 
    }).select('name email phone address centerName wasteTypesProcessed');
    res.json(centers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new recycling center
router.post('/', async (req, res) => {
  try {
    const center = new RecyclingCenter(req.body);
    await center.save();
    res.status(201).json(center);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update recycling center status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const center = await RecyclingCenter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(center);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;