import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

const createCustomAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Municipality.findOne({ email: 'a@g' });
    if (existingAdmin) {
      console.log('Admin user with email a@g already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new Municipality({
      name: 'Admin',
      email: 'a@g',
      password: '123',
      role: 'admin',
      municipalId: 'MU01',
      workerId: 'ADMIN001',
      phone: '1234567890',
      address: 'Admin Office'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: a@g');
    console.log('Password: 123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createCustomAdmin();