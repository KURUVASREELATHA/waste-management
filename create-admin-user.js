import mongoose from 'mongoose';
import Municipality from './backend/models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Municipality.findOne({ email: 'admin@wastewise.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new Municipality({
      name: 'System Administrator',
      email: 'admin@wastewise.com',
      password: 'admin123',
      role: 'admin',
      municipalId: 'MU01',
      workerId: 'ADMIN001',
      phone: '9999999999',
      address: 'Municipal Office'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@wastewise.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    // Also create a worker user for testing
    const workerUser = new Municipality({
      name: 'Municipal Worker',
      email: 'worker@wastewise.com',
      password: 'worker123',
      role: 'worker',
      municipalId: 'MU01',
      workerId: 'WORKER001',
      phone: '8888888888',
      address: 'Municipal Office'
    });

    await workerUser.save();
    console.log('✅ Worker user created successfully');
    console.log('Email: worker@wastewise.com');
    console.log('Password: worker123');
    console.log('Role: worker');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdminUser();