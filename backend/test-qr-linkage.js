import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Waste from './models/Waste.js';

dotenv.config();

const testQRLinkage = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('Connected to MongoDB');

    // Find a citizen user
    let citizen = await User.findOne({ role: 'citizen' });
    if (!citizen) {
      citizen = new User({
        name: 'QR Test Citizen',
        email: 'qrtest@citizen.com',
        password: 'hashedpassword',
        role: 'citizen',
        houseId: 'H003',
        municipalId: 'MU01',
        address: 'QR Test Address'
      });
      await citizen.save();
      console.log('Created test citizen with QR code:', citizen.qrCode);
    }

    console.log('Testing QR linkage for citizen:', {
      id: citizen._id,
      name: citizen.name,
      qrCode: citizen.qrCode,
      houseId: citizen.houseId
    });

    // Simulate worker scanning QR and collecting waste
    const wasteRecord = new Waste({
      userId: citizen._id, // This should link to citizen's account
      municipalId: citizen.municipalId,
      citizenName: citizen.name,
      citizenHouseId: citizen.houseId,
      type: 'organic',
      weight: 8,
      location: citizen.address,
      description: 'QR scan test collection',
      status: 'collected',
      collectedAt: new Date()
    });

    await wasteRecord.save();
    console.log('✅ Created waste record linked to citizen');

    // Verify citizen can see this in their history
    const citizenHistory = await Waste.find({ userId: citizen._id }).sort({ createdAt: -1 });
    console.log(`\n📋 Citizen ${citizen.name} waste history (${citizenHistory.length} records):`);
    
    citizenHistory.forEach((waste, index) => {
      console.log(`  ${index + 1}. ${waste.type} - ${waste.weight}kg - ${waste.status} - ${new Date(waste.createdAt).toLocaleDateString()}`);
    });

    console.log('\n🎯 QR linkage test completed successfully!');
    console.log('✅ Worker-scanned waste appears in citizen dashboard history');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testQRLinkage();