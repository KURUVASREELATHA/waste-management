import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

async function ensureProperWorkers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // First, clean up any GPS Tracker workers
    const cleanupResult = await Municipality.deleteMany({
      role: 'worker',
      name: { $regex: /^GPS Tracker/ }
    });
    console.log(`Cleaned up ${cleanupResult.deletedCount} GPS Tracker workers`);

    // Check existing workers
    const existingWorkers = await Municipality.find({ role: 'worker' });
    console.log(`Found ${existingWorkers.length} existing workers:`);
    
    existingWorkers.forEach(worker => {
      console.log(`- ${worker.name} (${worker.workerId || 'no workerId'}) - Status: ${worker.status}`);
    });

    // If we have fewer than 2 proper workers, ensure we have the basic ones
    const properWorkers = existingWorkers.filter(w => !w.name.startsWith('GPS Tracker'));
    
    if (properWorkers.length < 2) {
      console.log('Ensuring we have proper workers...');
      
      // Check if Madanapalli municipal exists
      let madanapalliWorker = await Municipality.findOne({ name: 'Madanapalli municipal' });
      if (!madanapalliWorker) {
        madanapalliWorker = new Municipality({
          name: 'Madanapalli municipal',
          email: 'madanapalli@municipal.com',
          password: 'password123',
          role: 'worker',
          workerId: 'MADANAPALLI001',
          status: 'offline',
          isLocationActive: false
        });
        await madanapalliWorker.save();
        console.log('Created Madanapalli municipal worker');
      }

      // Check if vamsi exists
      let vamsiWorker = await Municipality.findOne({ name: 'vamsi' });
      if (!vamsiWorker) {
        vamsiWorker = new Municipality({
          name: 'vamsi',
          email: 'vamsi@municipal.com',
          password: 'password123',
          role: 'worker',
          workerId: 'VAMSI001',
          status: 'offline',
          isLocationActive: false
        });
        await vamsiWorker.save();
        console.log('Created vamsi worker');
      }
    }

    // Final check
    const finalWorkers = await Municipality.find({ role: 'worker' });
    console.log(`\nFinal worker count: ${finalWorkers.length}`);
    finalWorkers.forEach(worker => {
      console.log(`- ${worker.name} (${worker.workerId || 'no workerId'}) - Status: ${worker.status}`);
    });

    console.log('\nWorker setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

ensureProperWorkers();