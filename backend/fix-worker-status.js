import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixWorkerStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all workers
    const workers = await Municipality.find({ role: 'worker' });
    console.log(`Found ${workers.length} workers`);

    // Check each worker's last update time
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    for (const worker of workers) {
      const lastUpdated = worker.currentLocation?.lastUpdated || new Date(0);
      const isStale = lastUpdated < fiveMinutesAgo;
      
      console.log(`Worker: ${worker.name}`);
      console.log(`  Current status: ${worker.status}`);
      console.log(`  Last updated: ${lastUpdated}`);
      console.log(`  Is stale (>5min): ${isStale}`);
      
      if (isStale && worker.status !== 'offline') {
        await Municipality.findByIdAndUpdate(worker._id, {
          status: 'offline',
          isLocationActive: false
        });
        console.log(`  ✅ Set to offline`);
      } else {
        console.log(`  ⏸️  No change needed`);
      }
      console.log('---');
    }

    console.log('Worker status fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixWorkerStatus();