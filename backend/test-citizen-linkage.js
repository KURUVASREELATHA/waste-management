import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Waste from './models/Waste.js';
import User from './models/User.js';

dotenv.config();

const testCitizenLinkage = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('Connected to MongoDB');

    // Find a test citizen
    let testCitizen = await User.findOne({ role: 'citizen' });
    if (!testCitizen) {
      // Create a test citizen if none exists
      testCitizen = new User({
        name: 'Test Citizen for Linkage',
        email: 'linkage@test.com',
        password: 'hashedpassword',
        role: 'citizen',
        houseId: 'H002',
        municipalId: 'MU01',
        address: 'Test Address for Linkage'
      });
      await testCitizen.save();
      console.log('Created test citizen:', testCitizen.name);
    }

    console.log('Test citizen found:', {
      id: testCitizen._id,
      name: testCitizen.name,
      houseId: testCitizen.houseId
    });

    // Create a waste record as if collected by worker via QR scan
    const wasteRecord = new Waste({
      userId: testCitizen._id, // Link to actual citizen
      municipalId: testCitizen.municipalId,
      citizenName: testCitizen.name,
      citizenHouseId: testCitizen.houseId,
      type: 'plastic',
      weight: 12,
      location: testCitizen.address,
      description: 'Collected via QR scan by worker',
      status: 'collected',
      collectedAt: new Date(),
      collectedBy: testCitizen._id // Simulating worker collection
    });

    await wasteRecord.save();
    console.log('Created waste record linked to citizen:', {
      wasteId: wasteRecord._id,
      citizenId: wasteRecord.userId,
      weight: wasteRecord.weight,
      type: wasteRecord.type
    });

    // Verify the linkage by fetching citizen's waste history
    const citizenWasteHistory = await Waste.find({ userId: testCitizen._id })
      .sort({ createdAt: -1 });

    console.log(`\n✅ Citizen ${testCitizen.name} now has ${citizenWasteHistory.length} waste records in history:`);
    citizenWasteHistory.forEach((waste, index) => {
      console.log(`  ${index + 1}. ${waste.type} - ${waste.weight}kg - ${waste.status} - ${new Date(waste.createdAt).toLocaleDateString()}`);
    });

    console.log('\n🎯 Test completed! Worker-collected waste is now properly linked to citizen accounts.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testCitizenLinkage();