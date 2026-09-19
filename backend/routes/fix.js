import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Waste from '../models/Waste.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Fix citizen data endpoint
router.post('/fix-citizen-data', async (req, res) => {
  try {
    // Create/find the citizen for Venkata Sivamma Vayalpeta
    let citizen = await User.findOne({ 
      $or: [
        { houseId: '1' },
        { name: { $regex: 'Venkata', $options: 'i' } },
        { qrCode: 'WW001' }
      ]
    });
    
    if (!citizen) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      citizen = new User({
        name: 'Venkata Sivamma Vayalpeta',
        email: 'venkata.sivamma@example.com',
        password: hashedPassword,
        role: 'citizen',
        houseId: '1',
        municipalId: 'MU01',
        address: 'Kambalapalli,Beerangi post, B.kothakota',
        phone: '1',
        qrCode: 'WW001'
      });
      await citizen.save();
      console.log('Created citizen:', citizen._id);
    } else {
      // Update existing citizen with correct details
      await User.findByIdAndUpdate(citizen._id, {
        name: 'Venkata Sivamma Vayalpeta',
        houseId: '1',
        municipalId: 'MU01',
        address: 'Kambalapalli,Beerangi post, B.kothakota',
        phone: '1',
        qrCode: 'WW001',
        role: 'citizen'
      });
      console.log('Updated existing citizen:', citizen._id);
    }
    
    // Update any existing waste records that match this citizen
    const updateResult = await Waste.updateMany(
      {
        $or: [
          { citizenHouseId: '1' },
          { citizenName: { $regex: 'Venkata', $options: 'i' } },
          { citizenName: { $regex: 'Sivamma', $options: 'i' } }
        ]
      },
      {
        $set: {
          userId: citizen._id,
          citizenName: 'Venkata Sivamma Vayalpeta',
          citizenHouseId: '1',
          municipalId: 'MU01'
        }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} existing waste records`);
    
    // Create a test waste record if none exist for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWaste = await Waste.findOne({ 
      userId: citizen._id,
      createdAt: { $gte: today }
    });
    
    if (!todayWaste) {
      const testWaste = new Waste({
        userId: citizen._id,
        type: 'plastic',
        weight: 3,
        status: 'collected',
        citizenName: 'Venkata Sivamma Vayalpeta',
        citizenHouseId: '1',
        municipalId: 'MU01',
        location: 'Kambalapalli,Beerangi post, B.kothakota',
        description: 'Collected from Venkata Sivamma Vayalpeta - House ID: 1',
        collectedAt: new Date(),
        createdAt: new Date()
      });
      
      await testWaste.save();
      console.log('Created test waste record:', testWaste._id);
    }
    
    // Get updated stats
    const wasteRecords = await Waste.find({ userId: citizen._id });
    const todayWasteTotal = await Waste.aggregate([
      { 
        $match: { 
          userId: citizen._id,
          status: 'collected',
          $or: [
            { collectedAt: { $gte: today } },
            { createdAt: { $gte: today } }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    
    const totalWasteSum = await Waste.aggregate([
      { $match: { userId: citizen._id, status: 'collected' } },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    
    res.json({
      success: true,
      message: 'Citizen data fixed successfully',
      citizenId: citizen._id,
      wasteRecordsCount: wasteRecords.length,
      updatedRecords: updateResult.modifiedCount,
      todayWaste: todayWasteTotal[0]?.total || 0,
      totalWaste: totalWasteSum[0]?.total || 0,
      loginCredentials: {
        email: 'venkata.sivamma@example.com',
        password: 'password123'
      }
    });
  } catch (error) {
    console.error('Fix citizen data error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fix citizen data',
      error: error.message 
    });
  }
});

export default router;