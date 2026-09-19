import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import bcrypt from 'bcryptjs';

import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function createTestWorker() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test worker already exists
    const existing = await Municipality.findOne({ email: 'worker@test.com' });
    if (existing) {
      console.log('Test worker already exists, updating location...');
      existing.currentLocation = {
        lat: 13.630434,
        lng: 78.479515,
        lastUpdated: new Date()
      };
      existing.isLocationActive = true;
      existing.status = 'available';
      await existing.save();
      console.log('✅ Test worker location updated');
      return;
    }

    // Create a test worker
    const hashedPassword = await bcrypt.hash('123', 12);
    
    const testWorker = new Municipality({
      name: 'Test Worker',
      email: 'worker@test.com',
      password: hashedPassword,
      role: 'worker',
      workerId: 'TW001',
      municipalId: 'MU01',
      vehicleId: 'VH001',
      route: 'Test Route',
      currentLocation: {
        lat: 13.630434,
        lng: 78.479515,
        lastUpdated: new Date()
      },
      isLocationActive: true,
      status: 'available'
    });

    await testWorker.save();
    console.log('✅ Test worker created successfully');
    console.log('Worker details:', {
      name: testWorker.name,
      email: testWorker.email,
      workerId: testWorker.workerId,
      location: testWorker.currentLocation,
      isLocationActive: testWorker.isLocationActive
    });

  } catch (error) {
    console.error('❌ Error creating test worker:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestWorker();