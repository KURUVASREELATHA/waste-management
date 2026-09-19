import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get all products (for citizens)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by seller (for recycling centers)
router.get('/my', auth, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.userId })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, stock, materials, imageUrl } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      materials,
      imageUrl,
      sellerId: req.userId
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.patch('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.userId },
      req.body,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete(
      { _id: req.params.id, sellerId: req.userId }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get purchase history for recycling center
router.get('/purchases/sales', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ sellerId: req.userId })
      .populate('productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    // Manually populate buyer details from different models
    const enrichedPurchases = await Promise.all(purchases.map(async (purchase) => {
      let buyer = null;
      try {
        const Citizen = mongoose.model('Citizen');
        buyer = await Citizen.findById(purchase.buyerId).select('name houseId');
        if (!buyer) {
          const User = mongoose.model('User');
          buyer = await User.findById(purchase.buyerId).select('name houseId');
        }
      } catch (error) {
        console.error('Error finding buyer:', error);
      }
      
      return {
        ...purchase.toObject(),
        buyerId: buyer || { name: 'Unknown', houseId: 'N/A' }
      };
    }));
    
    res.json(enrichedPurchases || []);
  } catch (error) {
    console.error('Sales history error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get purchase history for citizens
router.get('/purchases/my', auth, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.userId })
      .populate('sellerId', 'name')
      .populate('productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    
    // Ensure QR codes and verification codes exist for old purchases
    const updatedPurchases = await Promise.all(purchases.map(async (purchase) => {
      const updates = {};
      if (!purchase.qrCode) {
        updates.qrCode = 'PUR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
      }
      if (!purchase.verificationCode) {
        updates.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      }
      
      if (Object.keys(updates).length > 0) {
        await Purchase.findByIdAndUpdate(purchase._id, updates);
        return { ...purchase.toObject(), ...updates };
      }
      return purchase;
    }));
    
    res.json(updatedPurchases || []);
  } catch (error) {
    console.error('Purchase history error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get purchase history for specific citizen (admin)
router.get('/purchases/citizen/:citizenId', async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.params.citizenId })
      .populate('sellerId', 'name')
      .populate('productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(purchases || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by specific recycler (admin)
router.get('/recycler/:recyclerId', async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.recyclerId })
      .sort({ createdAt: -1 });
    res.json(products || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales by specific recycler (admin)
router.get('/purchases/recycler/:recyclerId', async (req, res) => {
  try {
    const sales = await Purchase.find({ sellerId: req.params.recyclerId })
      .populate('buyerId', 'name houseId')
      .populate('productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(sales || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update purchase status
router.patch('/purchases/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.userId },
      { status },
      { new: true }
    );
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel purchase (for citizens)
router.patch('/purchases/:id/cancel', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id, buyerId: req.userId });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    if (purchase.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending purchases' });
    }
    
    // Update purchase status to cancelled
    purchase.status = 'cancelled';
    await purchase.save();
    
    // Restore product stock
    const product = await Product.findById(purchase.productId);
    if (product) {
      product.stock += purchase.quantity;
      product.sold -= purchase.quantity;
      await product.save();
    }
    
    res.json({ message: 'Purchase cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify and complete purchase order
router.patch('/purchases/:id/verify-complete', auth, async (req, res) => {
  try {
    const { verificationCode } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }
    
    const purchase = await Purchase.findOne({ _id: req.params.id, sellerId: req.userId });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    if (purchase.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    
    res.json({ message: 'Order completed successfully', purchase: updatedPurchase });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate verification code for existing purchase
router.patch('/purchases/:id/generate-code', auth, async (req, res) => {
  try {
    console.log('Generate code request for purchase ID:', req.params.id);
    console.log('User ID from auth:', req.userId);
    
    const purchase = await Purchase.findOne({ _id: req.params.id, buyerId: req.userId });
    
    if (!purchase) {
      console.log('Purchase not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    const verificationCode = generateVerificationCode();
    console.log('Generated verification code:', verificationCode);
    
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { verificationCode },
      { new: true }
    );
    
    console.log('Updated purchase with code:', updatedPurchase.verificationCode);
    res.json({ verificationCode, purchase: updatedPurchase });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel purchase (for sellers/recycling centers)
router.patch('/purchases/:id/cancel-by-seller', auth, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ _id: req.params.id, sellerId: req.userId });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    if (purchase.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed orders' });
    }
    
    // Update purchase status to cancelled
    purchase.status = 'cancelled';
    await purchase.save();
    
    // Restore product stock
    const product = await Product.findById(purchase.productId);
    if (product) {
      product.stock += purchase.quantity;
      product.sold -= purchase.quantity;
      await product.save();
    }
    
    res.json({ message: 'Order cancelled by seller successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate unique QR code for purchase
const generatePurchaseQRCode = () => {
  return 'PUR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Purchase product (for citizens)
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const { quantity = 1, deliveryAddress, phoneNumber, notes } = req.body;
    
    if (!deliveryAddress || !phoneNumber) {
      return res.status(400).json({ message: 'Delivery address and phone number are required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    const totalAmount = product.price * quantity;
    const qrCode = generatePurchaseQRCode();
    const verificationCode = generateVerificationCode();
    
    // Create purchase record
    const purchase = new Purchase({
      productId: product._id,
      buyerId: req.userId,
      sellerId: product.sellerId,
      quantity,
      totalAmount,
      productName: product.name,
      productPrice: product.price,
      deliveryAddress,
      phoneNumber,
      notes: notes || '',
      qrCode,
      verificationCode
    });
    
    await purchase.save();
    
    // Update product stock
    product.stock -= quantity;
    product.sold += quantity;
    await product.save();
    
    res.json({ 
      message: 'Purchase successful',
      totalAmount,
      product: product.name,
      qrCode
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;