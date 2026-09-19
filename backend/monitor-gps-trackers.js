import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

async function monitorGPSTrackers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB - Starting GPS Tracker Monitor');

    // Monitor for GPS Tracker creation every 5 seconds
    setInterval(async () => {
      try {
        const gpsTrackers = await Municipality.find({
          role: 'worker',
          name: { $regex: /^GPS Tracker/ }
        });

        if (gpsTrackers.length > 0) {
          console.log(`⚠️  Found ${gpsTrackers.length} GPS Tracker workers - Cleaning up...`);
          
          const deleteResult = await Municipality.deleteMany({
            role: 'worker',
            name: { $regex: /^GPS Tracker/ }
          });
          
          console.log(`✅ Deleted ${deleteResult.deletedCount} GPS Tracker workers`);
        }
      } catch (error) {
        console.error('Monitor error:', error);
      }
    }, 5000); // Check every 5 seconds

    console.log('GPS Tracker monitor is running...');
    
  } catch (error) {
    console.error('Monitor setup error:', error);
    process.exit(1);
  }
}

monitorGPSTrackers();