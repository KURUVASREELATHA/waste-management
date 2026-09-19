import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Citizen from '../models/Citizen.js';
import Municipality from '../models/Municipality.js';
import RecyclingCenter from '../models/RecyclingCenter.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, municipalId, upiId, houseId, workerId, centerName, wasteTypesProcessed } = req.body;

    let Model, userData;
    
    switch(role) {
      case 'citizen':
        const existingCitizen = await Citizen.findOne({ email });
        if (existingCitizen) return res.status(400).json({ message: 'Citizen already exists' });
        Model = Citizen;
        userData = { name, email, password, phone, address, municipalId, upiId, houseId };
        break;
        
      case 'worker':
      case 'admin':
        const existingMunicipality = await Municipality.findOne({ email });
        if (existingMunicipality) return res.status(400).json({ message: 'Municipality user already exists' });
        Model = Municipality;
        userData = { name, email, password, phone, address, municipalId, workerId, role };
        break;
        
      case 'recycler':
        const existingCenter = await RecyclingCenter.findOne({ email });
        if (existingCenter) return res.status(400).json({ message: 'Recycling center already exists' });
        Model = RecyclingCenter;
        userData = { name, email, password, phone, address, centerName, wasteTypesProcessed };
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const user = new Model(userData);
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role || role,
        phone: user.phone,
        address: user.address,
        municipalId: user.municipalId,
        upiId: user.upiId,
        houseId: user.houseId,
        qrCode: user.qrCode,
        workerId: user.workerId,
        centerName: user.centerName,
        wasteTypesProcessed: user.wasteTypesProcessed
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let Model, user;
    
    switch(role) {
      case 'citizen':
        Model = Citizen;
        user = await Model.findOne({ email });
        break;
      case 'worker':
        Model = Municipality;
        user = await Model.findOne({ email, role: 'worker' });
        break;
      case 'admin':
        Model = Municipality;
        user = await Model.findOne({ email, role: 'admin' });
        break;
      case 'recycler':
        Model = RecyclingCenter;
        user = await Model.findOne({ email });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role || role,
        phone: user.phone,
        address: user.address,
        municipalId: user.municipalId,
        upiId: user.upiId,
        houseId: user.houseId,
        qrCode: user.qrCode,
        workerId: user.workerId,
        centerName: user.centerName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate QR code for existing users
router.post('/generate-qr', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await Citizen.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    if (!user.qrCode) {
      user.qrCode = `WW${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      await user.save();
    }

    res.json({ qrCode: user.qrCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get total user count
router.get('/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'citizen' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get counts for all user types
router.get('/users/counts', async (req, res) => {
  try {
    const [citizens, workers, recyclers] = await Promise.all([
      Citizen.countDocuments(),
      Municipality.countDocuments(),
      RecyclingCenter.countDocuments()
    ]);
    res.json({ citizens, workers, recyclers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all citizens
router.get('/citizens', async (req, res) => {
  try {
    const { municipalId } = req.query;
    let query = {};
    if (municipalId) {
      query.municipalId = municipalId;
    }
    
    const citizens = await Citizen.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get individual citizen details
router.get('/citizens/:id', async (req, res) => {
  try {
    const citizen = await User.findById(req.params.id)
      .select('-password');
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }
    res.json(citizen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by role
router.get('/users/role/:role', async (req, res) => {
  try {
    let Model;
    switch(req.params.role) {
      case 'citizen': Model = Citizen; break;
      case 'worker': 
      case 'admin': Model = Municipality; break;
      case 'recycler': Model = RecyclingCenter; break;
      default: return res.status(400).json({ message: 'Invalid role' });
    }
    
    const users = await Model.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get individual user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get linked users by municipalId
router.get('/municipal/:municipalId/users', async (req, res) => {
  try {
    const { municipalId } = req.params;
    const users = await User.find({ municipalId })
      .select('-password')
      .sort({ role: 1, createdAt: -1 });
    
    const linkedUsers = {
      citizens: users.filter(u => u.role === 'citizen'),
      workers: users.filter(u => u.role === 'worker'),
      municipalId
    };
    
    res.json(linkedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get citizens for a specific worker's municipal area
router.get('/worker/:workerId/citizens', async (req, res) => {
  try {
    const worker = await User.findOne({ workerId: req.params.workerId, role: 'worker' });
    if (!worker || !worker.municipalId) {
      return res.status(404).json({ message: 'Worker not found or no municipal area assigned' });
    }
    
    const citizens = await User.find({ 
      municipalId: worker.municipalId, 
      role: 'citizen' 
    }).select('-password');
    
    res.json({ citizens, municipalId: worker.municipalId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get citizens by municipal ID
router.get('/municipal/:municipalId/citizens', async (req, res) => {
  try {
    const { municipalId } = req.params;
    const citizens = await Citizen.find({ municipalId })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get worker for a specific citizen's municipal area
router.get('/citizen/:citizenId/worker', async (req, res) => {
  try {
    const citizen = await User.findById(req.params.citizenId);
    if (!citizen || !citizen.municipalId) {
      return res.status(404).json({ message: 'Citizen not found or no municipal area assigned' });
    }
    
    const workers = await User.find({ 
      municipalId: citizen.municipalId, 
      role: 'worker' 
    }).select('-password');
    
    res.json({ workers, municipalId: citizen.municipalId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      municipalId: user.municipalId,
      upiId: user.upiId,
      houseId: user.houseId,
      qrCode: user.qrCode,
      workerId: user.workerId,
      centerName: user.centerName,
      wasteTypesProcessed: user.wasteTypesProcessed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;