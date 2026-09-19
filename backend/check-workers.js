import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';

import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function checkWorkers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all municipalities with role worker
    const allWorkers = await Municipality.find({ role: 'worker' });
    console.log('All workers in municipalities collection:', allWorkers.length);
    
    allWorkers.forEach((worker, index) => {
      console.log(`Worker ${index + 1}:`, {
        name: worker.name,
        email: worker.email,
        role: worker.role,
        isLocationActive: worker.isLocationActive,
        currentLocation: worker.currentLocation,
        status: worker.status
      });
    });

    // Check the specific query used by the API
    const activeWorkers = await Municipality.find({
      role: 'worker',
      isLocationActive: true,
      'currentLocation.lat': { $exists: true },
      'currentLocation.lng': { $exists: true }
    });
    
    console.log('\nActive workers matching API query:', activeWorkers.length);
    activeWorkers.forEach((worker, index) => {
      console.log(`Active Worker ${index + 1}:`, {
        name: worker.name,
        email: worker.email,
        isLocationActive: worker.isLocationActive,
        currentLocation: worker.currentLocation
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkWorkers();