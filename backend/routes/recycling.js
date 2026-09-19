import express from 'express';
import RecyclingOrder from '../models/RecyclingOrder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

let WASTE_PRICES = {
  plastic: 15,
  paper: 8,
  metal: 25,
  glass: 5,
  organic: 2,
  mixed: 5
};

// Create recycling order (from municipal)
router.post('/orders', auth, async (req, res) => {
  try {
    const { wasteType, weight } = req.body;
    const pricePerKg = WASTE_PRICES[wasteType] || 0;
    
    const order = new RecyclingOrder({
      municipalId: req.userId,
      wasteType,
      weight,
      pricePerKg,
      totalAmount: weight * pricePerKg
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (for recycling center)
router.get('/orders', async (req, res) => {
  try {
    const orders = await RecyclingOrder.find()
      .populate('municipalId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by municipal user
router.get('/orders/my', auth, async (req, res) => {
  try {
    const orders = await RecyclingOrder.find({ municipalId: req.userId })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process order (from recycling center)
router.patch('/orders/:id/process', async (req, res) => {
  try {
    const { acceptedWeight, notes } = req.body;
    const order = await RecyclingOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.acceptedWeight = acceptedWeight;
    order.totalAmount = acceptedWeight * order.pricePerKg;
    order.status = 'processed';
    order.processedAt = new Date();
    order.notes = notes;
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete payment (from recycling center)
router.patch('/orders/:id/payment', async (req, res) => {
  try {
    const { verificationCode, transactionId, paymentProof, paymentNotes } = req.body;
    const order = await RecyclingOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    order.paymentStatus = 'paid';
    order.transactionId = transactionId;
    order.paymentProof = paymentProof;
    order.paymentNotes = paymentNotes;
    order.paidAt = new Date();
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current prices
router.get('/prices', async (req, res) => {
  try {
    // In a real app, this would come from a database
    // For now, return the default prices
    res.json(WASTE_PRICES);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update prices
router.patch('/prices', async (req, res) => {
  try {
    // In a real app, this would update the database
    // For now, just update the in-memory prices
    Object.assign(WASTE_PRICES, req.body);
    res.json(WASTE_PRICES);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get municipal connections
router.get('/connections', async (req, res) => {
  try {
    const connections = await RecyclingOrder.aggregate([
      {
        $group: {
          _id: '$municipalId',
          totalOrders: { $sum: 1 },
          totalPaid: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'processed'] }, '$totalAmount', 0] 
            }
          },
          lastOrder: { $max: '$createdAt' },
          wasteTypes: { $addToSet: '$wasteType' },
          processedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'municipal'
        }
      },
      {
        $project: {
          municipalId: '$_id',
          municipalName: { $ifNull: [{ $arrayElemAt: ['$municipal.name', 0] }, 'Municipal Worker'] },
          location: { $ifNull: [{ $arrayElemAt: ['$municipal.location', 0] }, 'Unknown Location'] },
          totalOrders: 1,
          totalPaid: 1,
          lastOrder: 1,
          wasteTypes: 1,
          status: { $cond: [{ $gte: ['$processedOrders', 1] }, 'active', 'inactive'] }
        }
      },
      { $sort: { totalPaid: -1 } }
    ]);
    
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recycling stats
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await RecyclingOrder.countDocuments();
    const processedOrders = await RecyclingOrder.countDocuments({ status: 'processed' });
    const pendingOrders = await RecyclingOrder.countDocuments({ status: 'pending' });
    
    const totalRevenue = await RecyclingOrder.aggregate([
      { $match: { status: 'processed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = await RecyclingOrder.aggregate([
      { 
        $match: { 
          status: 'processed',
          processedAt: { $gte: today }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalOrders,
      processedOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;