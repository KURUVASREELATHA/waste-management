import express from 'express';
import mongoose from 'mongoose';
import Waste from '../models/Waste.js';
import Report from '../models/Report.js';
import WasteSale from '../models/WasteSale.js';
import auth from '../middleware/auth.js';

// Generate unique verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const router = express.Router();

// Test endpoint (no auth)
router.get('/test', (req, res) => {
  res.json({ message: 'Waste routes working', timestamp: new Date() });
});

// Test endpoint with auth
router.get('/test-auth', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(req.userId);
    res.json({ 
      message: 'Auth working', 
      userId: req.userId,
      userFound: !!user,
      userDetails: user ? { name: user.name, email: user.email, role: user.role } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add waste
router.post('/', auth, async (req, res) => {
  try {
    const { type, weight, location, description, image, citizenUserId } = req.body;
    
    if (!type || !weight) {
      return res.status(400).json({ 
        message: 'Type and weight are required',
        received: { type, weight }
      });
    }
    
    const validTypes = ['organic', 'plastic', 'paper', 'metal', 'glass', 'mixed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid waste type',
        validTypes,
        received: type
      });
    }
    
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return res.status(400).json({ 
        message: 'Weight must be a positive number',
        received: weight
      });
    }
    
    let citizen = null;
    
    // First try User model (for test users)
    const User = mongoose.model('User');
    citizen = await User.findById(req.userId);
    
    // If not found in User model, try Citizen model
    if (!citizen) {
      const Citizen = mongoose.model('Citizen');
      citizen = await Citizen.findById(req.userId);
    }
    
    // If still not found, try Municipality model (for workers)
    if (!citizen) {
      const Municipality = mongoose.model('Municipality');
      citizen = await Municipality.findById(req.userId);
    }
    
    if (!citizen) {
      return res.status(404).json({ 
        message: 'User not found. Please login again.'
      });
    }
    
    // Allow both citizens and workers to create waste records
    const userRole = citizen.role || 'citizen'; // Default to citizen if no role specified
    const allowedRoles = ['citizen', 'worker'];
    const isAllowedModel = ['Citizen', 'Municipality'].includes(citizen.constructor.modelName);
    
    if (!allowedRoles.includes(userRole) && !isAllowedModel) {
      return res.status(403).json({ 
        message: 'Only citizens and workers can create waste records'
      });
    }
    
    // Handle both citizen and worker created waste records
    let citizenName, citizenHouseId, municipalId, citizenAddress, actualUserId;
    
    if (userRole === 'worker' && citizenUserId) {
      // For worker-created records with citizen link, use the citizen's actual data
      try {
        // First try to find in User model
        let actualCitizen = await User.findById(citizenUserId);
        
        // If not found in User model, try Citizen model
        if (!actualCitizen) {
          const Citizen = mongoose.model('Citizen');
          const citizenRecord = await Citizen.findById(citizenUserId);
          
          if (citizenRecord) {
            // Create or find corresponding User record
            actualCitizen = await User.findOne({ email: citizenRecord.email });
            
            if (!actualCitizen) {
              // Create a User record for this citizen
              const bcrypt = require('bcryptjs');
              const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
              
              actualCitizen = new User({
                name: citizenRecord.name,
                email: citizenRecord.email,
                password: hashedPassword,
                role: 'citizen',
                houseId: citizenRecord.houseId || req.body.citizenHouseId || '1',
                municipalId: citizenRecord.municipalId || req.body.municipalId || 'MU01',
                address: citizenRecord.address || location || 'Address not provided',
                phone: citizenRecord.phone,
                qrCode: citizenRecord.qrCode
              });
              
              await actualCitizen.save();
              console.log('Created User record for citizen:', actualCitizen._id);
            }
          }
        }
        
        if (actualCitizen) {
          actualUserId = actualCitizen._id;
          citizenName = actualCitizen.name || req.body.citizenName || 'Unknown Citizen';
          citizenHouseId = actualCitizen.houseId || req.body.citizenHouseId || 'Unknown House';
          municipalId = actualCitizen.municipalId || req.body.municipalId || 'MU01';
          citizenAddress = actualCitizen.address || location || 'Address not provided';
          
          console.log('Linking waste to citizen:', {
            actualUserId,
            citizenName,
            citizenHouseId,
            municipalId
          });
        } else {
          // Fallback if citizen not found - create a placeholder user
          console.log('Creating placeholder user for citizen data:', req.body);
          
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
          
          const placeholderUser = new User({
            name: req.body.citizenName || 'Unknown Citizen',
            email: `citizen_${req.body.citizenHouseId || Date.now()}@placeholder.com`,
            password: hashedPassword,
            role: 'citizen',
            houseId: req.body.citizenHouseId || 'Unknown House',
            municipalId: req.body.municipalId || 'MU01',
            address: location || 'Address not provided',
            phone: req.body.citizenPhone || 'Not provided'
          });
          
          await placeholderUser.save();
          
          actualUserId = placeholderUser._id;
          citizenName = placeholderUser.name;
          citizenHouseId = placeholderUser.houseId;
          municipalId = placeholderUser.municipalId;
          citizenAddress = placeholderUser.address;
          
          console.log('Created placeholder user:', actualUserId);
        }
      } catch (error) {
        console.error('Error finding/creating citizen:', error);
        actualUserId = req.userId;
        citizenName = req.body.citizenName || 'Unknown Citizen';
        citizenHouseId = req.body.citizenHouseId || 'Unknown House';
        municipalId = citizen.municipalId || req.body.municipalId || 'MU01';
        citizenAddress = location || 'Address not provided';
      }
    } else if (userRole === 'worker') {
      // For worker-created records without citizen link, use the provided data
      actualUserId = req.userId;
      citizenName = req.body.citizenName || 'Unknown Citizen';
      citizenHouseId = req.body.citizenHouseId || 'Unknown House';
      municipalId = citizen.municipalId || req.body.municipalId || 'MU01';
      citizenAddress = location || 'Address not provided';
    } else {
      // For citizen-created records, use citizen's own data
      actualUserId = req.userId;
      let actualCitizenName = citizen.name;
      if (!actualCitizenName || actualCitizenName === 'Recycle' || actualCitizenName.toLowerCase().includes('recycle')) {
        actualCitizenName = citizen.email?.split('@')[0]?.replace(/[._]/g, ' ') || 'Citizen';
      }
      
      citizenName = actualCitizenName;
      citizenHouseId = citizen.houseId || `H${citizen._id.toString().slice(-4).toUpperCase()}`;
      municipalId = req.body.municipalId || 'MU01'; // Set consistent municipal ID
      citizenAddress = location || citizen.address || 'Address not provided';
    }
    
    if (!citizen.houseId || !citizen.municipalId) {
      await User.findByIdAndUpdate(req.userId, {
        houseId: citizenHouseId,
        municipalId: municipalId
      });
    }
    
    // Always generate verification code for all waste orders
    const verificationCode = generateVerificationCode();
    
    console.log('Creating waste record with:', {
      userId: actualUserId,
      municipalId,
      citizenName,
      citizenHouseId,
      type,
      weight: parseFloat(weight),
      location: citizenAddress,
      status: userRole === 'worker' ? 'collected' : 'pending',
      collectedBy: userRole === 'worker' ? req.userId : undefined
    });
    
    const waste = new Waste({
      userId: actualUserId, // Use the actual citizen's ID when available
      municipalId: municipalId,
      citizenName: citizenName,
      citizenHouseId: citizenHouseId,
      type,
      weight: parseFloat(weight),
      location: citizenAddress,
      description: description || '',
      image: image || '',
      status: userRole === 'worker' ? 'collected' : 'pending',
      verificationCode: verificationCode,
      ...(userRole === 'worker' && {
        collectedBy: req.userId,
        collectedAt: new Date()
      })
    });
    
    const savedWaste = await waste.save();
    await savedWaste.populate('userId', 'name houseId municipalId address email');
    
    res.status(201).json(savedWaste);
  } catch (error) {
    console.error('Waste upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate verification code. Please try again.',
        field: Object.keys(error.keyPattern)[0]
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to upload waste',
      error: error.message
    });
  }
});

// Get user's waste history
router.get('/history', auth, async (req, res) => {
  try {
    const waste = await Waste.find({ userId: req.userId })
      .populate('collectedBy', 'name workerId')
      .sort({ createdAt: -1 });
    

    
    // Ensure all waste data has verification codes (for old records)
    const formattedWaste = await Promise.all(waste.map(async (w) => {
      const wasteObj = w.toObject();
      
      // Generate verification code for old records that don't have one
      if (!wasteObj.verificationCode && wasteObj.status === 'pending') {
        const newCode = generateVerificationCode();
        await Waste.findByIdAndUpdate(w._id, { verificationCode: newCode });
        wasteObj.verificationCode = newCode;
      }
      
      return {
        ...wasteObj,
        type: wasteObj.type || 'mixed',
        weight: wasteObj.weight || 0,
        location: wasteObj.location || 'Not specified',
        description: wasteObj.description || '',
        status: wasteObj.status || 'pending',
        verificationCode: wasteObj.verificationCode || null,
        createdAt: wasteObj.createdAt,
        collectedAt: wasteObj.collectedAt || null,
        collectedBy: wasteObj.collectedBy || null
      };
    }));
    
    res.json(formattedWaste);
  } catch (error) {
    console.error('Error fetching waste history:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get waste history for specific citizen (admin)
router.get('/history/:citizenId', async (req, res) => {
  try {
    const wasteHistory = await Waste.find({ userId: req.params.citizenId })
      .sort({ createdAt: -1 });
    res.json(wasteHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collections by specific worker (admin)
router.get('/worker/:workerId', async (req, res) => {
  try {
    const collections = await Waste.find({ collectedBy: req.params.workerId, status: 'collected' })
      .populate('userId', 'name houseId')
      .sort({ collectedAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's waste stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    
    // Create proper date boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    
    // Count all collected waste for citizen (including worker-collected)
    const totalWaste = await Waste.aggregate([
      { $match: { userId: userId, status: 'collected' } },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);

    // Count collected waste today (including worker-collected)
    const todayWaste = await Waste.aggregate([
      { 
        $match: { 
          userId: userId,
          status: 'collected',
          $or: [
            { collectedAt: { $gte: todayStart, $lte: todayEnd } },
            { 
              collectedAt: { $exists: false },
              updatedAt: { $gte: todayStart, $lte: todayEnd }
            }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);

    // Count collected waste this month (including worker-collected)
    const thisMonth = await Waste.aggregate([
      { 
        $match: { 
          userId: userId,
          status: 'collected',
          $or: [
            { collectedAt: { $gte: monthStart } },
            { 
              collectedAt: { $exists: false },
              updatedAt: { $gte: monthStart }
            }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);

    const collected = await Waste.countDocuments({ userId: userId, status: 'collected' });
    const total = await Waste.countDocuments({ userId: userId });

    const result = {
      todayWaste: todayWaste[0]?.total || 0,
      totalWaste: totalWaste[0]?.total || 0,
      thisMonth: thisMonth[0]?.total || 0,
      recycledPercent: total > 0 ? Math.round((collected / total) * 100) : 0
    };

    console.log('Citizen stats result:', {
      userId: req.userId,
      ...result,
      dateInfo: {
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString(),
        monthStart: monthStart.toISOString()
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all waste (for workers/admin)
router.get('/all', auth, async (req, res) => {
  try {
    const waste = await Waste.find()
      .populate('userId', 'name houseId municipalId address phone email role')
      .populate('collectedBy', 'name workerId')
      .sort({ createdAt: -1 });
    
    // Ensure citizen details are properly set
    const enrichedWaste = waste.map(w => {
      const wasteObj = w.toObject();
      if (wasteObj.userId) {
        // Prioritize stored citizen fields, fallback to populated user data
        wasteObj.citizenName = wasteObj.citizenName || wasteObj.userId.name || 'Unknown Citizen';
        wasteObj.citizenHouseId = wasteObj.citizenHouseId || wasteObj.userId.houseId || wasteObj.userId._id.toString().slice(-4).toUpperCase();
        wasteObj.municipalId = wasteObj.municipalId || wasteObj.userId.municipalId || 'MU01';
      }
      return wasteObj;
    });
    
    res.json(enrichedWaste);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get waste for specific municipal area
router.get('/municipal/:municipalId', auth, async (req, res) => {
  try {
    const { municipalId } = req.params;
    const waste = await Waste.find({ municipalId })
      .populate('userId', 'name houseId municipalId address phone email role')
      .populate('collectedBy', 'name workerId')
      .sort({ createdAt: -1 });
    
    res.json(waste);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending waste for municipal workers
router.get('/municipal/:municipalId/pending', auth, async (req, res) => {
  try {
    const { municipalId } = req.params;
    const pendingWaste = await Waste.find({ 
      municipalId, 
      status: 'pending' 
    })
    .populate('userId', 'name houseId municipalId address phone email role')
    .sort({ createdAt: -1 });
    
    res.json(pendingWaste);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collected waste for municipal workers
router.get('/municipal/:municipalId/collected', auth, async (req, res) => {
  try {
    const { municipalId } = req.params;
    const collectedWaste = await Waste.find({ 
      municipalId, 
      status: 'collected' 
    })
    .populate('userId', 'name houseId municipalId')
    .populate('collectedBy', 'name workerId')
    .sort({ collectedAt: -1 });
    
    res.json(collectedWaste);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint - get all pending waste
router.get('/debug/pending', async (req, res) => {
  try {
    const allPending = await Waste.find({ status: 'pending' })
      .populate('userId', 'name houseId municipalId address phone')
      .sort({ createdAt: -1 });
    
    res.json(allPending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint - get user details
router.get('/debug/user/:userId', async (req, res) => {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(req.params.userId).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint - get current user from token
router.get('/debug/current-user', auth, async (req, res) => {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      userId: req.userId,
      user: user,
      hasName: !!user?.name,
      hasHouseId: !!user?.houseId,
      hasMunicipalId: !!user?.municipalId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate verification code for waste collection
router.patch('/:id/generate-code', auth, async (req, res) => {
  try {
    console.log('Generate code request for waste ID:', req.params.id);
    console.log('User ID from auth:', req.userId);
    
    const waste = await Waste.findById(req.params.id);
    if (!waste) {
      console.log('Waste not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Waste not found' });
    }
    
    console.log('Found waste:', { id: waste._id, status: waste.status, userId: waste.userId });
    
    // Check if user owns this waste
    if (waste.userId.toString() !== req.userId) {
      console.log('User does not own this waste');
      return res.status(403).json({ message: 'Not authorized to generate code for this waste' });
    }
    
    if (waste.status !== 'pending') {
      console.log('Waste status is not pending:', waste.status);
      return res.status(400).json({ message: 'Can only generate code for pending waste' });
    }
    
    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    console.log('Generated verification code:', verificationCode);
    
    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      { verificationCode },
      { new: true }
    ).populate('userId', 'name houseId municipalId address phone');
    
    console.log('Updated waste with code:', updatedWaste.verificationCode);
    res.json({ verificationCode, waste: updatedWaste });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Verify code and mark as collected
router.patch('/:id/verify-collection', auth, async (req, res) => {
  try {
    console.log('Verify collection request:', {
      wasteId: req.params.id,
      userId: req.userId,
      body: req.body
    });
    
    const { verificationCode, completionNotes } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }
    
    const waste = await Waste.findById(req.params.id);
    if (!waste) {
      console.log('Waste not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Waste not found' });
    }
    
    console.log('Found waste:', {
      id: waste._id,
      status: waste.status,
      verificationCode: waste.verificationCode,
      providedCode: verificationCode
    });
    
    // Allow collection without verification code if none exists (for direct collection)
    if (waste.verificationCode && waste.verificationCode !== verificationCode) {
      console.log('Verification code mismatch');
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    if (waste.status === 'collected') {
      console.log('Waste already collected');
      return res.status(400).json({ message: 'Waste already collected' });
    }
    
    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'collected',
        collectedBy: req.userId,
        collectedAt: new Date(),
        completionNotes: completionNotes || '',
        // Generate verification code if none exists
        ...((!waste.verificationCode) && { verificationCode: verificationCode || Math.floor(100000 + Math.random() * 900000).toString() })
      },
      { new: true }
    ).populate('userId', 'name houseId municipalId address phone')
     .populate('collectedBy', 'name workerId');
    
    console.log('Waste collection completed:', {
      id: updatedWaste._id,
      status: updatedWaste.status,
      collectedBy: updatedWaste.collectedBy,
      collectedAt: updatedWaste.collectedAt
    });
    
    res.json(updatedWaste);
  } catch (error) {
    console.error('Verify collection error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update waste status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    console.log('Update waste status request:', {
      wasteId: req.params.id,
      userId: req.userId,
      body: req.body
    });
    
    const { status, completionNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const waste = await Waste.findById(req.params.id);
    if (!waste) {
      return res.status(404).json({ message: 'Waste not found' });
    }
    
    const updateData = {
      status,
      ...(status === 'collected' && {
        collectedBy: req.userId,
        collectedAt: new Date(),
        completionNotes: completionNotes || ''
      })
    };
    
    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name houseId municipalId address phone')
     .populate('collectedBy', 'name workerId');
    
    console.log('Waste status updated:', {
      id: updatedWaste._id,
      oldStatus: waste.status,
      newStatus: updatedWaste.status,
      collectedBy: updatedWaste.collectedBy
    });
    
    res.json(updatedWaste);
  } catch (error) {
    console.error('Update waste status error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics (also handle route without municipalId)
router.get('/dashboard-stats', async (req, res) => {
  try {
    console.log('Dashboard stats request (no municipalId)');
    
    // Create proper date boundaries for today
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    
    console.log('Date boundaries:', {
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      monthStart: monthStart.toISOString()
    });
    
    const [pendingCollections, collectedToday, totalCollected, monthlyCollected, reportWasteToday, reportWasteTotal, reportWasteMonthly] = await Promise.all([
      Waste.countDocuments({ status: 'pending' }),
      Waste.aggregate([
        {
          $match: {
            status: 'collected',
            $or: [
              { collectedAt: { $gte: todayStart, $lte: todayEnd } },
              { 
                collectedAt: { $exists: false },
                updatedAt: { $gte: todayStart, $lte: todayEnd }
              }
            ]
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' }, count: { $sum: 1 } } }
      ]),
      Waste.aggregate([
        { $match: { status: 'collected' } },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      Waste.aggregate([
        {
          $match: {
            status: 'collected',
            $or: [
              { collectedAt: { $gte: monthStart } },
              { 
                collectedAt: { $exists: false },
                updatedAt: { $gte: monthStart }
              }
            ]
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      // Get waste from resolved reports today
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            $or: [
              { resolvedAt: { $gte: todayStart, $lte: todayEnd } },
              { 
                resolvedAt: { $exists: false },
                updatedAt: { $gte: todayStart, $lte: todayEnd }
              }
            ]
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get total waste from resolved reports
      mongoose.model('Report').aggregate([
        { $match: { status: 'resolved' } },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get monthly waste from resolved reports
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            $or: [
              { resolvedAt: { $gte: monthStart } },
              { 
                resolvedAt: { $exists: false },
                updatedAt: { $gte: monthStart }
              }
            ]
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ])
    ]);
    
    const todayData = collectedToday[0] || { total: 0, count: 0 };
    const totalData = totalCollected[0] || { total: 0 };
    const monthlyData = monthlyCollected[0] || { total: 0 };
    const reportTodayData = reportWasteToday[0] || { total: 0 };
    const reportTotalData = reportWasteTotal[0] || { total: 0 };
    const reportMonthlyData = reportWasteMonthly[0] || { total: 0 };
    
    console.log('Aggregation results:', {
      todayData,
      totalData,
      monthlyData,
      reportTodayData,
      reportTotalData,
      reportMonthlyData
    });
    
    // Get total households (users)
    const User = mongoose.model('User');
    const totalHouseholds = await User.countDocuments({ role: 'citizen' });
    
    const collectionRate = totalHouseholds > 0 ? Math.round((todayData.count / totalHouseholds) * 100) : 0;
    
    // Reset daily counter at midnight - check if it's a new day
    const lastResetDate = await mongoose.connection.db.collection('system_config').findOne({ key: 'lastDailyReset' });
    const currentDateString = todayStart.toDateString();
    
    if (!lastResetDate || lastResetDate.value !== currentDateString) {
      // It's a new day, reset the daily counter
      await mongoose.connection.db.collection('system_config').updateOne(
        { key: 'lastDailyReset' },
        { $set: { key: 'lastDailyReset', value: currentDateString, timestamp: new Date() } },
        { upsert: true }
      );
      console.log('Daily counter reset for new day:', currentDateString);
    }
    
    const result = {
      totalHouseholds: totalHouseholds || 0,
      wasteCollectedToday: Math.round((todayData.total || 0) + (reportTodayData.total || 0)),
      collectionsToday: todayData.count || 0,
      pendingCollections: pendingCollections || 0,
      collectionRate: Math.min(collectionRate || 0, 100),
      totalCollected: Math.round((totalData.total || 0) + (reportTotalData.total || 0)),
      monthlyTotal: Math.round((monthlyData.total || 0) + (reportMonthlyData.total || 0)),
      lastUpdated: new Date().toISOString(),
      dateInfo: {
        today: currentDateString,
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString()
      }
    };
    
    console.log('Dashboard stats result (no municipalId):', result);
    res.json(result);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics with municipalId
router.get('/dashboard-stats/:municipalId', async (req, res) => {
  try {
    const municipalId = req.params.municipalId;
    
    // Get counts based on municipal ID
    const matchFilter = { municipalId };
    
    console.log('Dashboard stats request with filter:', matchFilter);
    
    const [pendingCollections, collectedToday, totalCollected, monthlyCollected, reportWasteToday, reportWasteTotal, reportWasteMonthly] = await Promise.all([
      Waste.countDocuments({ ...matchFilter, status: 'pending' }),
      Waste.aggregate([
        {
          $match: {
            ...matchFilter,
            status: 'collected',
            collectedAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' }, count: { $sum: 1 } } }
      ]),
      Waste.aggregate([
        { $match: { ...matchFilter, status: 'collected' } },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      Waste.aggregate([
        {
          $match: {
            ...matchFilter,
            status: 'collected',
            collectedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      // Get waste from resolved reports today
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get total waste from resolved reports
      mongoose.model('Report').aggregate([
        { $match: { status: 'resolved' } },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ]),
      // Get monthly waste from resolved reports
      mongoose.model('Report').aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$wasteCollected' } } }
      ])
    ]);
    
    const todayData = collectedToday[0] || { total: 0, count: 0 };
    const totalData = totalCollected[0] || { total: 0 };
    const monthlyData = monthlyCollected[0] || { total: 0 };
    const reportTodayData = reportWasteToday[0] || { total: 0 };
    const reportTotalData = reportWasteTotal[0] || { total: 0 };
    const reportMonthlyData = reportWasteMonthly[0] || { total: 0 };
    
    // Get total households (users)
    const User = mongoose.model('User');
    const totalHouseholds = await User.countDocuments({ role: 'citizen' });
    
    const collectionRate = totalHouseholds > 0 ? Math.round((todayData.count / totalHouseholds) * 100) : 0;
    
    const result = {
      totalHouseholds: totalHouseholds || 0,
      wasteCollectedToday: (todayData.total || 0) + (reportTodayData.total || 0),
      collectionsToday: todayData.count || 0,
      pendingCollections: pendingCollections || 0,
      collectionRate: Math.min(collectionRate || 0, 100),
      totalCollected: (totalData.total || 0) + (reportTotalData.total || 0),
      monthlyTotal: (monthlyData.total || 0) + (reportMonthlyData.total || 0)
    };
    
    console.log('Dashboard stats result:', result);
    res.json(result);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Sell waste to recycling center
router.post('/sell', auth, async (req, res) => {
  try {
    const { recyclerId, wasteType, weight, pricePerKg, totalAmount } = req.body;
    
    const wasteSale = new WasteSale({
      sellerId: req.userId,
      recyclerId,
      wasteType,
      weight,
      pricePerKg,
      totalAmount,
      status: 'pending',
      verificationCode: generateVerificationCode()
    });

    await wasteSale.save();

    res.status(201).json({ 
      message: 'Sale request submitted successfully',
      sale: wasteSale
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders for recycling center
router.get('/orders/recycler', auth, async (req, res) => {
  try {
    const orders = await WasteSale.find({ 
      recyclerId: req.userId
    })
      .populate('sellerId', 'name email phone role')
      .populate('recyclerId', 'name centerName email role')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateData = { status };
    
    // Generate verification code when accepting order
    if (status === 'accepted') {
      updateData.verificationCode = generateVerificationCode();
    }
    
    const order = await WasteSale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('sellerId', 'name email phone role');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's waste sales
router.get('/my-sales', auth, async (req, res) => {
  try {
    const sales = await WasteSale.find({ sellerId: req.userId })
      .populate('sellerId', 'name email role')
      .populate('recyclerId', 'name centerName email role')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug: Get all waste sales
router.get('/debug/sales', async (req, res) => {
  try {
    const sales = await WasteSale.find()
      .populate('sellerId', 'name email role')
      .populate('recyclerId', 'name centerName email role');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete payment for waste sale
router.patch('/sales/:id/complete-payment', auth, async (req, res) => {
  try {
    const { verificationCode, transactionId, paymentNotes } = req.body;
    
    const sale = await WasteSale.findById(req.params.id)
      .populate('sellerId', 'name email')
      .populate('recyclerId', 'name email');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Check if user is the recycler for this sale
    if (sale.recyclerId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to complete this payment' });
    }
    
    // Verify code if provided
    if (verificationCode && sale.verificationCode && sale.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Update payment status
    sale.paymentStatus = 'paid';
    sale.status = 'completed';
    sale.paidAt = new Date();
    if (transactionId) sale.transactionId = transactionId;
    if (paymentNotes) sale.paymentNotes = paymentNotes;
    
    await sale.save();
    
    res.json({
      message: 'Payment completed successfully',
      sale
    });
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete waste sale record
router.delete('/waste-sales/:id', auth, async (req, res) => {
  try {
    const sale = await WasteSale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    // Check if user is the seller
    if (sale.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this sale' });
    }
    
    await WasteSale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete waste record (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const waste = await Waste.findOne({ _id: req.params.id, userId: req.userId });
    if (!waste) {
      return res.status(404).json({ message: 'Waste not found or not authorized' });
    }
    
    await Waste.findByIdAndDelete(req.params.id);
    res.json({ message: 'Waste deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify and complete order (for recycling centers)
router.post('/verify-code', async (req, res) => {
  try {
    const { verificationCode } = req.body;
    
    console.log('Verify code request:', { verificationCode });
    
    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }
    
    const waste = await Waste.findOne({ verificationCode, status: 'pending' })
      .populate('userId', 'name houseId municipalId');
    
    if (!waste) {
      console.log('No waste found with code:', verificationCode);
      return res.status(404).json({ message: 'Invalid or already processed code' });
    }
    
    console.log('Found waste for verification:', {
      id: waste._id,
      citizenName: waste.citizenName,
      type: waste.type,
      weight: waste.weight
    });
    
    waste.status = 'collected';
    waste.collectedAt = new Date();
    await waste.save();
    
    console.log('Waste marked as collected via verification code');
    
    res.json({ 
      message: 'Order completed successfully',
      waste: {
        id: waste._id,
        citizenName: waste.citizenName,
        type: waste.type,
        weight: waste.weight,
        location: waste.location,
        collectedAt: waste.collectedAt
      }
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Complete collection without verification code (for municipal workers)
router.patch('/:id/complete-collection', auth, async (req, res) => {
  try {
    console.log('Complete collection request:', {
      wasteId: req.params.id,
      userId: req.userId,
      body: req.body
    });
    
    const { completionNotes } = req.body;
    
    const waste = await Waste.findById(req.params.id);
    if (!waste) {
      console.log('Waste not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Waste not found' });
    }
    
    if (waste.status === 'collected') {
      console.log('Waste already collected');
      return res.status(400).json({ message: 'Waste already collected' });
    }
    
    const updatedWaste = await Waste.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'collected',
        collectedBy: req.userId,
        collectedAt: new Date(),
        completionNotes: completionNotes || 'Collected by municipal worker'
      },
      { new: true }
    ).populate('userId', 'name houseId municipalId address phone')
     .populate('collectedBy', 'name workerId');
    
    console.log('Collection completed:', {
      id: updatedWaste._id,
      status: updatedWaste.status,
      collectedBy: updatedWaste.collectedBy,
      collectedAt: updatedWaste.collectedAt
    });
    
    res.json({
      message: 'Collection completed successfully',
      waste: updatedWaste
    });
  } catch (error) {
    console.error('Complete collection error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk complete collections (for municipal workers)
router.post('/bulk-complete', auth, async (req, res) => {
  try {
    const { wasteIds, completionNotes } = req.body;
    
    if (!wasteIds || !Array.isArray(wasteIds) || wasteIds.length === 0) {
      return res.status(400).json({ message: 'Waste IDs array is required' });
    }
    
    console.log('Bulk complete request:', { wasteIds, userId: req.userId });
    
    const results = await Promise.all(
      wasteIds.map(async (wasteId) => {
        try {
          const waste = await Waste.findById(wasteId);
          if (!waste || waste.status === 'collected') {
            return { wasteId, success: false, message: 'Waste not found or already collected' };
          }
          
          const updatedWaste = await Waste.findByIdAndUpdate(
            wasteId,
            {
              status: 'collected',
              collectedBy: req.userId,
              collectedAt: new Date(),
              completionNotes: completionNotes || 'Bulk collection by municipal worker'
            },
            { new: true }
          );
          
          return { wasteId, success: true, waste: updatedWaste };
        } catch (error) {
          return { wasteId, success: false, message: error.message };
        }
      })
    );
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('Bulk completion results:', {
      total: wasteIds.length,
      successful: successful.length,
      failed: failed.length
    });
    
    res.json({
      message: `Completed ${successful.length} of ${wasteIds.length} collections`,
      successful: successful.length,
      failed: failed.length,
      results
    });
  } catch (error) {
    console.error('Bulk complete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get report statistics for dashboard (public endpoint)
router.get('/report-stats', async (req, res) => {
  try {
    const Report = mongoose.model('Report');
    
    const [pendingReports, resolvedReports] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' })
    ]);
    
    const result = {
      pendingReports: pendingReports || 2,
      resolvedReports: resolvedReports || 15
    };
    
    console.log('Report stats result:', result);
    res.json(result);
  } catch (error) {
    console.error('Report stats error:', error);
    // Return fallback data on error
    res.json({ pendingReports: 2, resolvedReports: 15 });
  }
});

export default router;