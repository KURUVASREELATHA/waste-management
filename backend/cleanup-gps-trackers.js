import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';

import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function cleanupGPSTrackers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all GPS Tracker workers
    const result = await Municipality.deleteMany({
      role: 'worker',
      name: { $regex: /^GPS Tracker/ }
    });

    console.log(`Deleted ${result.deletedCount} GPS Tracker workers`);
    
    // Also clean up any workers with GPS-related emails
    const result2 = await Municipality.deleteMany({
      role: 'worker',
      email: { $regex: /^gps-.*@tracking\.com$/ }
    });

    console.log(`Deleted ${result2.deletedCount} GPS tracking email workers`);

    await mongoose.disconnect();
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

cleanupGPSTrackers();