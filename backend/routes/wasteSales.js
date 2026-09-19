import express from 'express';
import mongoose from 'mongoose';
import WasteSale from '../models/WasteSale.js';
import RecyclingCenter from '../models/RecyclingCenter.js';

const router = express.Router();

// Get all waste sales
router.get('/', async (req, res) => {
  try {
    const sales = await WasteSale.find()
      .populate('workerId', 'name')
      .populate('recyclingCenterId', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending waste sales for a recycling center
router.get('/center/:centerId/pending', async (req, res) => {
  try {
    const sales = await WasteSale.find({ 
      recyclerId: req.params.centerId,
      status: 'pending'
    }).populate('sellerId', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get accepted orders for payment processing
router.get('/center/:centerId/accepted', async (req, res) => {
  try {
    const sales = await WasteSale.find({ 
      recyclerId: req.params.centerId,
      status: 'accepted',
      paymentStatus: 'pending'
    }).populate('sellerId', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new waste sale
router.post('/', async (req, res) => {
  try {
    const sale = new WasteSale(req.body);
    await sale.save();
    await sale.populate('recyclingCenterId', 'name');
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update waste sale status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updateData = { status };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    
    // Generate verification code when accepted
    if (status === 'accepted') {
      updateData.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    const sale = await WasteSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('sellerId', 'name').populate('recyclerId', 'name');
    
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get sold history for municipality
router.get('/municipality/:municipalityId/history', async (req, res) => {
  try {
    const sales = await WasteSale.find({ 
      sellerId: req.params.municipalityId,
      status: { $in: ['accepted', 'completed'] }
    })
    .populate('recyclerId', 'name centerName')
    .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process payment with verification code
router.patch('/:id/payment', async (req, res) => {
  try {
    const { verificationCode, transactionId, paymentProof, paymentNotes } = req.body;
    
    const sale = await WasteSale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    if (sale.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    sale.paymentStatus = 'paid';
    sale.status = 'completed';
    sale.transactionId = transactionId;
    sale.paymentProof = paymentProof;
    sale.paymentNotes = paymentNotes;
    sale.paidAt = new Date();
    
    await sale.save();
    await sale.populate('sellerId', 'name');
    await sale.populate('recyclerId', 'name');
    
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete waste sale (only completed ones)
router.delete('/:id', async (req, res) => {
  try {
    const saleId = req.params.id;
    console.log('Delete waste sale request:', saleId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      return res.status(400).json({ message: 'Invalid sale ID format' });
    }
    
    const sale = await WasteSale.findById(saleId);
    console.log('Found sale:', sale ? 'Yes' : 'No');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    console.log('Sale status:', sale.status, 'Payment status:', sale.paymentStatus);
    
    // Allow deletion of any sale for now (remove restriction temporarily)
    await WasteSale.findByIdAndDelete(saleId);
    console.log('Sale deleted successfully');
    res.json({ message: 'Sale record deleted successfully' });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;