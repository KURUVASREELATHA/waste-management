import express from 'express';
import Earning from '../models/Earning.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's earnings
router.get('/my-earnings', auth, async (req, res) => {
  try {
    const earnings = await Earning.find({ userId: req.userId }).populate('wasteId').sort({ createdAt: -1 });
    
    const totalEarnings = await Earning.aggregate([
      { $match: { userId: req.userId, status: 'credited' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonth = await Earning.aggregate([
      { 
        $match: { 
          userId: req.userId,
          status: 'credited',
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      earnings,
      totalEarnings: totalEarnings[0]?.total || 0,
      thisMonth: thisMonth[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Credit earnings (admin only)
router.post('/credit', auth, async (req, res) => {
  try {
    const { userId, wasteId, amount, description } = req.body;
    
    const earning = new Earning({
      userId,
      wasteId,
      amount,
      creditedBy: req.userId,
      description
    });
    
    await earning.save();
    res.status(201).json(earning);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;