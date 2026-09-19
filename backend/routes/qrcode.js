import express from 'express';
import QRCode from '../models/QRCode.js';
import Citizen from '../models/Citizen.js';
import User from '../models/User.js';
import Waste from '../models/Waste.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Generate QR code for citizen
router.post('/generate', auth, async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.user.id);
    if (!citizen) {
      return res.status(404).json({ message: 'Citizen not found' });
    }

    // Check if QR code already exists
    let qrCodeDoc = await QRCode.findOne({ citizenId: citizen._id });
    
    if (!qrCodeDoc) {
      // Generate new QR code
      const qrCodeValue = citizen.qrCode || `WW${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Calculate total waste collected
      const wasteData = await Waste.aggregate([
        { $match: { userId: citizen._id, status: 'collected' } },
        { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
      ]);
      
      const totalWaste = wasteData.length > 0 ? wasteData[0].totalWeight : 0;
      
      qrCodeDoc = new QRCode({
        citizenId: citizen._id,
        qrCode: qrCodeValue,
        houseId: citizen.houseId || `HOUSE_${citizen._id.toString().slice(-6)}`,
        citizenName: citizen.name,
        citizenEmail: citizen.email,
        citizenPhone: citizen.phone,
        citizenAddress: citizen.address,
        totalWasteCollected: totalWaste,
        iotData: {
          sensorId: `IOT_${citizen._id.toString().slice(-8)}`,
          currentWeight: Math.floor(Math.random() * 50) + 10, // Mock IoT data
          lastReading: new Date(),
          batteryLevel: Math.floor(Math.random() * 30) + 70,
          status: 'active'
        }
      });
      
      await qrCodeDoc.save();
      
      // Update citizen with QR code if not exists
      if (!citizen.qrCode) {
        citizen.qrCode = qrCodeValue;
        await citizen.save();
      }
    }

    res.json(qrCodeDoc);
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get QR code details by scanning
router.get('/scan/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    
    // First try to find in QRCode collection
    let qrCodeDoc = await QRCode.findOne({ qrCode })
      .populate('citizenId', 'name email phone address profileImage houseId');
    
    // If not found in QRCode, try to find user directly by qrCode
    if (!qrCodeDoc) {
      const user = await User.findOne({ qrCode, role: 'citizen' });
      if (user) {
        // Create response directly from user data
        const response = {
          citizen: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            municipalId: user.municipalId || 'MU01',
            profileImage: user.profileImage
          },
          houseId: user.houseId,
          qrCode: user.qrCode,
          wasteData: {
            totalCollected: 0,
            lastCollection: null,
            recentWaste: []
          }
        };
        return res.json(response);
      }
      return res.status(404).json({ message: 'QR code not found or inactive' });
    }
    
    // Ensure we have citizen data
    if (!qrCodeDoc.citizenId) {
      console.log(`QR Code ${qrCode} found but no citizen reference`);
      return res.status(404).json({ message: 'House not found in database - citizen reference missing' });
    }

    // Get latest waste collection data
    const wasteData = await Waste.aggregate([
      { $match: { userId: qrCodeDoc.citizenId._id, status: 'collected' } },
      { $group: { 
          _id: null, 
          totalWeight: { $sum: '$weight' },
          lastCollection: { $max: '$collectedAt' }
        } 
      }
    ]);

    const recentWaste = await Waste.find({ 
      userId: qrCodeDoc.citizenId._id 
    }).sort({ createdAt: -1 }).limit(5);

    // Update total waste collected
    if (wasteData.length > 0) {
      qrCodeDoc.totalWasteCollected = wasteData[0].totalWeight;
      qrCodeDoc.lastCollectionDate = wasteData[0].lastCollection;
      await qrCodeDoc.save();
    }

    // Mock IoT sensor update
    qrCodeDoc.iotData.currentWeight = Math.floor(Math.random() * 50) + 10;
    qrCodeDoc.iotData.lastReading = new Date();
    qrCodeDoc.iotData.batteryLevel = Math.max(20, qrCodeDoc.iotData.batteryLevel - Math.floor(Math.random() * 5));
    await qrCodeDoc.save();

    // Also check if citizen exists in User model
    let actualCitizen = null;
    if (qrCodeDoc.citizenId) {
      actualCitizen = await User.findOne({ 
        $or: [
          { _id: qrCodeDoc.citizenId._id },
          { email: qrCodeDoc.citizenEmail },
          { qrCode: qrCode },
          { houseId: qrCodeDoc.houseId },
          { name: qrCodeDoc.citizenName }
        ],
        role: 'citizen'
      });
      
      // If no User record found, create one from the Citizen data
      if (!actualCitizen && qrCodeDoc.citizenId) {
        try {
          const bcrypt = require('bcryptjs');
          const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
          
          actualCitizen = new User({
            name: qrCodeDoc.citizenName || qrCodeDoc.citizenId.name,
            email: qrCodeDoc.citizenEmail || qrCodeDoc.citizenId.email || `citizen_${qrCodeDoc.houseId}@placeholder.com`,
            password: hashedPassword,
            role: 'citizen',
            houseId: qrCodeDoc.houseId || qrCodeDoc.citizenId.houseId,
            municipalId: qrCodeDoc.citizenId.municipalId || 'MU01',
            address: qrCodeDoc.citizenAddress || qrCodeDoc.citizenId.address,
            phone: qrCodeDoc.citizenPhone || qrCodeDoc.citizenId.phone,
            qrCode: qrCode
          });
          
          await actualCitizen.save();
          console.log('Created User record for QR scan citizen:', actualCitizen._id);
        } catch (error) {
          console.error('Error creating User record:', error);
        }
      }
    }

    const response = {
      citizen: {
        _id: actualCitizen?._id || qrCodeDoc.citizenId._id,
        id: actualCitizen?._id || qrCodeDoc.citizenId._id,
        name: actualCitizen?.name || qrCodeDoc.citizenName || qrCodeDoc.citizenId.name,
        email: actualCitizen?.email || qrCodeDoc.citizenEmail || qrCodeDoc.citizenId.email,
        phone: actualCitizen?.phone || qrCodeDoc.citizenPhone || qrCodeDoc.citizenId.phone,
        address: actualCitizen?.address || qrCodeDoc.citizenAddress || qrCodeDoc.citizenId.address,
        municipalId: actualCitizen?.municipalId || qrCodeDoc.citizenId.municipalId || 'MU01',
        profileImage: actualCitizen?.profileImage || qrCodeDoc.citizenId.profileImage
      },
      houseId: qrCodeDoc.houseId || qrCodeDoc.citizenId.houseId,
      qrCode: qrCodeDoc.qrCode,
      wasteData: {
        totalCollected: qrCodeDoc.totalWasteCollected || 0,
        lastCollection: qrCodeDoc.lastCollectionDate,
        recentWaste: recentWaste || []
      },
      iotSensor: qrCodeDoc.iotData || {
        sensorId: `IOT_${qrCodeDoc.citizenId._id.toString().slice(-8)}`,
        currentWeight: 0,
        lastReading: new Date(),
        batteryLevel: 85,
        status: 'active'
      },
      lastUpdated: qrCodeDoc.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error('Scan QR code error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get citizen's QR code
router.get('/my-qr', auth, async (req, res) => {
  try {
    const qrCodeDoc = await QRCode.findOne({ citizenId: req.user.id });
    
    if (!qrCodeDoc) {
      return res.status(404).json({ message: 'QR code not found. Please generate one first.' });
    }

    res.json(qrCodeDoc);
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update IoT sensor data (for IoT devices)
router.patch('/iot-update/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { currentWeight, batteryLevel, status } = req.body;
    
    const qrCodeDoc = await QRCode.findOne({ qrCode });
    
    if (!qrCodeDoc) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    qrCodeDoc.iotData.currentWeight = currentWeight || qrCodeDoc.iotData.currentWeight;
    qrCodeDoc.iotData.batteryLevel = batteryLevel || qrCodeDoc.iotData.batteryLevel;
    qrCodeDoc.iotData.status = status || qrCodeDoc.iotData.status;
    qrCodeDoc.iotData.lastReading = new Date();
    
    await qrCodeDoc.save();

    res.json({ message: 'IoT data updated successfully', iotData: qrCodeDoc.iotData });
  } catch (error) {
    console.error('IoT update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;