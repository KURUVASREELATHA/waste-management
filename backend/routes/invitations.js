import express from 'express';
import Invitation from '../models/Invitation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Invitations routes working' });
});

// Get available recycling centers
router.get('/available-centers', auth, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const centers = await User.find({ role: 'recycler' })
      .select('name email phone address centerName wasteTypesProcessed createdAt')
      .sort({ createdAt: -1 });
    
    res.json(centers);
  } catch (error) {
    console.error('Error fetching available centers:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send invitation
router.post('/send', auth, async (req, res) => {
  try {
    const { recyclingCenterId, message } = req.body;
    
    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      municipalityId: req.userId,
      recyclingCenterId,
      status: 'pending'
    });
    
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this recycling center' });
    }
    
    // Get recycling center details
    const User = (await import('../models/User.js')).default;
    const recyclingCenter = await User.findById(recyclingCenterId)
      .select('name centerName email phone address wasteTypesProcessed');
    
    if (!recyclingCenter) {
      return res.status(404).json({ message: 'Recycling center not found' });
    }
    
    const invitation = new Invitation({
      municipalityId: req.userId,
      recyclingCenterId,
      recyclingCenterDetails: {
        name: recyclingCenter.name,
        centerName: recyclingCenter.centerName,
        email: recyclingCenter.email,
        phone: recyclingCenter.phone,
        address: recyclingCenter.address,
        wasteTypesProcessed: recyclingCenter.wasteTypesProcessed || []
      },
      message: message || 'Partnership invitation for waste recycling'
    });
    
    await invitation.save();
    await invitation.populate('recyclingCenterId', 'name centerName email phone address wasteTypesProcessed createdAt');
    
    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Legacy endpoint for backward compatibility
router.post('/', auth, async (req, res) => {
  try {
    const { recyclingCenterId, message } = req.body;
    
    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      municipalityId: req.userId,
      recyclingCenterId,
      status: 'pending'
    });
    
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this recycling center' });
    }
    
    // Get recycling center details
    const User = (await import('../models/User.js')).default;
    const recyclingCenter = await User.findById(recyclingCenterId)
      .select('name centerName email phone address wasteTypesProcessed');
    
    if (!recyclingCenter) {
      return res.status(404).json({ message: 'Recycling center not found' });
    }
    
    const invitation = new Invitation({
      municipalityId: req.userId,
      recyclingCenterId,
      recyclingCenterDetails: {
        name: recyclingCenter.name,
        centerName: recyclingCenter.centerName,
        email: recyclingCenter.email,
        phone: recyclingCenter.phone,
        address: recyclingCenter.address,
        wasteTypesProcessed: recyclingCenter.wasteTypesProcessed || []
      },
      message: message || 'Partnership invitation for waste recycling'
    });
    
    await invitation.save();
    await invitation.populate('recyclingCenterId', 'name centerName email phone address wasteTypesProcessed createdAt');
    
    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sent invitations with full recycling center details
router.get('/sent', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({ municipalityId: req.userId })
      .populate('recyclingCenterId', 'name centerName email phone address wasteTypesProcessed createdAt')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel invitation
router.delete('/:id', auth, async (req, res) => {
  try {
    const invitation = await Invitation.findOneAndDelete({
      _id: req.params.id,
      municipalityId: req.userId,
      status: 'pending'
    });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or cannot be cancelled' });
    }
    
    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;