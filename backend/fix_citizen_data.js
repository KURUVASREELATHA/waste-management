import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Waste from './models/Waste.js';

async function fixCitizenData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/waste-wise');
    console.log('Connected to MongoDB');
    
    // Create/find the citizen
    let citizen = await User.findOne({ houseId: '1' });
    
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
      console.log('Found existing citizen:', citizen._id);
    }
    
    // Update any existing waste records that match this citizen
    const updateResult = await Waste.updateMany(
      {
        $or: [
          { citizenHouseId: '1' },
          { citizenName: { $regex: 'Venkata', $options: 'i' } }
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
    
    // Create a test waste record if none exist
    const existingWaste = await Waste.findOne({ userId: citizen._id });
    if (!existingWaste) {
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
        collectedAt: new Date()
      });
      
      await testWaste.save();
      console.log('Created test waste record:', testWaste._id);
    }
    
    // Verify the waste is linked correctly
    const wasteRecords = await Waste.find({ userId: citizen._id });
    console.log(`Found ${wasteRecords.length} waste records for citizen`);
    
    console.log('Citizen login credentials:');
    console.log('Email: venkata.sivamma@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCitizenData();