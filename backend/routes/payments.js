import express from 'express';
import Payment from '../models/Payment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const MONTHLY_FEE = 5000; // Fixed monthly fee for recycling centers

// Generate monthly payment for recycling center
router.post('/generate-monthly', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      recyclingCenterId: req.userId,
      month,
      year
    });
    
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment for this month already exists' });
    }
    
    const dueDate = new Date(year, month, 5); // Due on 5th of each month
    
    const payment = new Payment({
      recyclingCenterId: req.userId,
      month,
      year,
      amount: MONTHLY_FEE,
      dueDate
    });
    
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payments for recycling center
router.get('/my-payments', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ recyclingCenterId: req.userId })
      .sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark payment as paid
router.patch('/:id/pay', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment || payment.recyclingCenterId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments (admin)
router.get('/all', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('recyclingCenterId', 'name centerName')
      .sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;