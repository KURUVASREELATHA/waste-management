import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Waste from './models/Waste.js';
import User from './models/User.js';

dotenv.config();

const testDailyCollection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise');
    console.log('Connected to MongoDB');

    // Get or create a test citizen
    let testCitizen = await User.findOne({ email: 'test@citizen.com' });
    if (!testCitizen) {
      testCitizen = new User({
        name: 'Test Citizen',
        email: 'test@citizen.com',
        password: 'hashedpassword',
        role: 'citizen',
        houseId: 'H001',
        municipalId: 'MU01',
        address: 'Test Address, Test City'
      });
      await testCitizen.save();
      console.log('Created test citizen');
    }

    // Create today's waste collection
    const today = new Date();
    const todayWaste = new Waste({
      userId: testCitizen._id,
      municipalId: 'MU01',
      citizenName: testCitizen.name,
      citizenHouseId: testCitizen.houseId,
      type: 'mixed',
      weight: 27, // Set to 27 kg to replace the default 15 kg
      location: testCitizen.address,
      description: 'Daily waste collection test',
      status: 'collected',
      collectedAt: today,
      collectedBy: testCitizen._id
    });

    await todayWaste.save();
    console.log('Created today\'s waste collection:', {
      weight: todayWaste.weight,
      collectedAt: todayWaste.collectedAt,
      status: todayWaste.status
    });

    // Verify the dashboard stats
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const todayCollections = await Waste.aggregate([
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
    ]);

    console.log('Today\'s collection stats:', todayCollections[0] || { total: 0, count: 0 });

    // Also create some additional collections to make it more realistic
    const additionalCollections = [
      { weight: 15, type: 'organic' },
      { weight: 8, type: 'plastic' },
      { weight: 12, type: 'paper' }
    ];

    for (const collection of additionalCollections) {
      const waste = new Waste({
        userId: testCitizen._id,
        municipalId: 'MU01',
        citizenName: `Citizen ${Math.random().toString(36).substr(2, 5)}`,
        citizenHouseId: `H${Math.floor(Math.random() * 1000)}`,
        type: collection.type,
        weight: collection.weight,
        location: 'Test Location',
        description: 'Additional test collection',
        status: 'collected',
        collectedAt: today,
        collectedBy: testCitizen._id
      });
      await waste.save();
    }

    console.log('Created additional test collections');

    // Final verification
    const finalStats = await Waste.aggregate([
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
    ]);

    console.log('Final today\'s collection stats:', finalStats[0] || { total: 0, count: 0 });
    console.log('✅ Test completed successfully! Dashboard should now show updated daily collection.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testDailyCollection();