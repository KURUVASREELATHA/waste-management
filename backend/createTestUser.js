import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@citizen.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }

    // Create test citizen user
    const testUser = new User({
      name: 'Test Citizen',
      email: 'test@citizen.com',
      password: 'password123',
      role: 'citizen',
      phone: '1234567890',
      address: '123 Test Street, Test City',
      municipalId: 'MU01',
      houseId: 'H001'
    });

    await testUser.save();
    console.log('✅ Test user created successfully:', {
      id: testUser._id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      houseId: testUser.houseId,
      municipalId: testUser.municipalId
    });

    // Also create a test worker
    const testWorker = new User({
      name: 'Test Worker',
      email: 'worker@test.com',
      password: 'password123',
      role: 'worker',
      phone: '9876543210',
      municipalId: 'MU01',
      workerId: 'W001'
    });

    await testWorker.save();
    console.log('✅ Test worker created successfully');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser();