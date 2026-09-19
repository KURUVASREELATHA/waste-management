import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

import 'dotenv/config';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

async function debugAuth() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check what's in localStorage (simulate)
    console.log('\n=== Checking Users Collection ===');
    const users = await User.find({ role: 'worker' });
    console.log('Workers in Users collection:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    console.log('\n=== Checking Municipalities Collection ===');
    const municipalities = await Municipality.find({ role: 'worker' });
    console.log('Workers in Municipalities collection:', municipalities.length);
    municipalities.forEach(worker => {
      console.log(`- ${worker.name} (${worker.email}) - ID: ${worker._id}`);
    });

    // Create worker in municipalities if exists in users
    if (users.length > 0 && municipalities.length === 1) {
      const user = users[0];
      console.log('\n=== Creating matching worker in municipalities ===');
      
      const newWorker = new Municipality({
        name: user.name,
        email: user.email,
        password: user.password,
        role: 'worker',
        workerId: user.workerId,
        municipalId: user.municipalId,
        vehicleId: user.vehicleId,
        route: user.route,
        currentLocation: {
          lat: 0,
          lng: 0,
          lastUpdated: new Date()
        },
        isLocationActive: false,
        status: 'offline'
      });

      await newWorker.save();
      console.log('✅ Created worker in municipalities:', newWorker.email);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugAuth();