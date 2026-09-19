import express from 'express';
import Penalty from '../models/Penalty.js';
import User from '../models/User.js';
import Citizen from '../models/Citizen.js';
import Municipality from '../models/Municipality.js';
import Waste from '../models/Waste.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



// Issue penalty (Municipal workers only)
router.post('/issue', auth, upload.single('evidenceImage'), async (req, res) => {
  try {
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only municipal staff can issue penalties' });
    }

    const { citizenId, violationType, description, amount, location } = req.body;

    if (!citizenId || !violationType || !description || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get citizen details
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    // Create penalty
    const penalty = new Penalty({
      citizenId,
      issuedBy: req.user.id,
      violationType,
      description,
      amount: parseFloat(amount),
      location: location || '',
      evidenceImage: req.file ? req.file.filename : undefined,
      citizenName: citizen.name,
      citizenHouseId: citizen.houseId,
      municipalId: req.user.municipalId || 'MU01'
    });

    await penalty.save();
    await penalty.populate(['citizenId', 'issuedBy']);

    res.status(201).json({ 
      success: true, 
      penalty
    });
  } catch (error) {
    console.error('Issue penalty error:', error);
    res.status(500).json({ message: 'Failed to issue penalty', error: error.message });
  }
});

// Get citizen's penalties
router.get('/citizen/:citizenId', auth, async (req, res) => {
  try {
    const { citizenId } = req.params;
    
    if (req.user.role === 'citizen' && req.user.id !== citizenId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const penalties = await Penalty.find({ citizenId })
      .populate('issuedBy', 'name workerId')
      .populate('wasteId', 'type weight')
      .sort({ createdAt: -1 });

    res.json(penalties);
  } catch (error) {
    console.error('Get citizen penalties error:', error);
    res.status(500).json({ message: 'Failed to fetch penalties', error: error.message });
  }
});

// Get my penalties (for logged-in citizen)
router.get('/my-penalties', auth, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Only citizens can access this endpoint' });
    }

    const penalties = await Penalty.find({ citizenId: req.user.id })
      .populate('issuedBy', 'name workerId')
      .populate('wasteId', 'type weight')
      .sort({ createdAt: -1 });

    res.json(penalties);
  } catch (error) {
    console.error('Get my penalties error:', error);
    res.status(500).json({ message: 'Failed to fetch penalties', error: error.message });
  }
});

// Get all penalties (Municipal dashboard)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const penalties = await Penalty.find()
      .sort({ createdAt: -1 });

    res.json(penalties);
  } catch (error) {
    console.error('Get all penalties error:', error);
    res.status(500).json({ message: 'Failed to fetch penalties', error: error.message });
  }
});

// Pay penalty
router.patch('/:penaltyId/pay', auth, async (req, res) => {
  try {
    const { penaltyId } = req.params;
    const { paymentMethod, paymentReference } = req.body;

    const penalty = await Penalty.findById(penaltyId);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty not found' });
    }

    if (req.user.role === 'citizen' && penalty.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    penalty.status = 'paid';
    penalty.paymentMethod = paymentMethod;
    penalty.paymentReference = paymentReference;
    penalty.paymentDate = new Date();

    await penalty.save();
    await penalty.populate(['citizenId', 'issuedBy']);

    res.json(penalty);
  } catch (error) {
    console.error('Pay penalty error:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
});

// Dispute penalty
router.patch('/:penaltyId/dispute', auth, async (req, res) => {
  try {
    const { penaltyId } = req.params;
    const { disputeReason } = req.body;

    const penalty = await Penalty.findById(penaltyId);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty not found' });
    }

    if (req.user.role === 'citizen' && penalty.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    penalty.status = 'disputed';
    penalty.disputeReason = disputeReason;
    penalty.disputeDate = new Date();

    await penalty.save();
    await penalty.populate(['citizenId', 'issuedBy']);

    res.json(penalty);
  } catch (error) {
    console.error('Dispute penalty error:', error);
    res.status(500).json({ message: 'Failed to dispute penalty', error: error.message });
  }
});

// Resolve dispute (Admin/Worker only)
router.patch('/:penaltyId/resolve-dispute', auth, async (req, res) => {
  try {
    const { penaltyId } = req.params;
    const { resolution, newStatus } = req.body;

    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only municipal staff can resolve disputes' });
    }

    const penalty = await Penalty.findById(penaltyId);
    if (!penalty) {
      return res.status(404).json({ message: 'Penalty not found' });
    }

    penalty.status = newStatus; // 'waived' or 'pending'
    penalty.disputeResolution = resolution;
    penalty.resolvedBy = req.user.id;

    await penalty.save();
    await penalty.populate(['citizenId', 'issuedBy', 'resolvedBy']);

    res.json(penalty);
  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ message: 'Failed to resolve dispute', error: error.message });
  }
});

// Get penalty statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Penalty.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPenalties = await Penalty.countDocuments();
    const totalRevenue = await Penalty.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalPenalties,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get penalty stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

export default router;