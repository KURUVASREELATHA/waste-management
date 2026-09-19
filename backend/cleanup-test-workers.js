import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';

import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function cleanupTestWorkers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove any GPS Tracker workers (duplicates)
    const cleanupResult = await Municipality.deleteMany({
      role: 'worker',
      name: { $regex: /^GPS Tracker/ },
      email: { $ne: 'test-gps-worker@wastewise.com' }
    });
    console.log(`Cleaned up ${cleanupResult.deletedCount} duplicate GPS Tracker workers`);

    // Check if test worker exists
    const testWorker = await Municipality.findOne({
      email: 'test-gps-worker@wastewise.com',
      role: 'worker'
    });

    if (testWorker) {
      console.log('Test GPS worker exists:', {
        name: testWorker.name,
        email: testWorker.email,
        workerId: testWorker.workerId,
        status: testWorker.status,
        isLocationActive: testWorker.isLocationActive
      });
    } else {
      console.log('No test GPS worker found - will be created on first location update');
    }

    // Show all workers
    const allWorkers = await Municipality.find({ role: 'worker' });
    console.log(`\nTotal workers in database: ${allWorkers.length}`);
    allWorkers.forEach((worker, index) => {
      console.log(`Worker ${index + 1}: ${worker.name} (${worker.email})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupTestWorkers();