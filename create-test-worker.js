import mongoose from 'mongoose';
import Municipality from './backend/models/Municipality.js';
import bcrypt from 'bcryptjs';

import fs from 'fs';

// Load MONGODB_URI from backend/.env (keeps credentials out of source code)
if (fs.existsSync('backend/.env')) {
  for (const line of fs.readFileSync('backend/.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function createTestWorker() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

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