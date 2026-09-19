import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Citizen from './models/Citizen.js';
import Municipality from './models/Municipality.js';
import RecyclingCenter from './models/RecyclingCenter.js';

dotenv.config();

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test citizen
    const existingCitizen = await Citizen.findOne({ email: 'test@citizen.com' });
    if (!existingCitizen) {
      const testCitizen = new Citizen({
        name: 'Test Citizen',
        email: 'test@citizen.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test Street, Test City',
        municipalId: 'MU01',
        houseId: 'H001',
        upiId: 'test@upi'
      });
      await testCitizen.save();
      console.log('✅ Test citizen created:', testCitizen.email);
    } else {
      console.log('Test citizen already exists');
    }

    // Create test worker
    const existingWorker = await Municipality.findOne({ email: 'worker@test.com' });
    if (!existingWorker) {
      const testWorker = new Municipality({
        name: 'Test Worker',
        email: 'worker@test.com',
        password: 'password123',
        phone: '9876543210',
        address: '456 Worker Street',
        municipalId: 'MU01',
        workerId: 'W001',
        role: 'worker'
      });
      await testWorker.save();
      console.log('✅ Test worker created:', testWorker.email);
    } else {
      console.log('Test worker already exists');
    }

    // Create test admin
    const existingAdmin = await Municipality.findOne({ email: 'admin@test.com' });
    if (!existingAdmin) {
      const testAdmin = new Municipality({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        phone: '5555555555',
        address: '789 Admin Street',
        municipalId: 'MU01',
        workerId: 'A001',
        role: 'admin'
      });
      await testAdmin.save();
      console.log('✅ Test admin created:', testAdmin.email);
    } else {
      console.log('Test admin already exists');
    }

    console.log('\n📋 Test credentials:');
    console.log('Citizen: test@citizen.com / password123');
    console.log('Worker: worker@test.com / password123');
    console.log('Admin: admin@test.com / password123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUsers();