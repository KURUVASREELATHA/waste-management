import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedWorkerData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create sample worker
    const workerData = {
      name: 'Municipal Worker',
      email: 'worker@wastewise.com',
      password: 'worker123',
      role: 'worker',
      phone: '+1234567899',
      address: 'Municipal Office, City Center',
      municipalId: 'MUN001',
      workerId: 'WORKER001'
    };

    let worker = await User.findOne({ email: workerData.email });
    if (!worker) {
      worker = new User(workerData);
      await worker.save();
      console.log(`Created worker: ${worker.name} (${worker.email})`);
    } else {
      console.log(`Worker already exists: ${worker.name}`);
    }

    // Create sample admin
    const adminData = {
      name: 'System Admin',
      email: 'admin@wastewise.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567898',
      address: 'Admin Office, City Center'
    };

    let admin = await User.findOne({ email: adminData.email });
    if (!admin) {
      admin = new User(adminData);
      await admin.save();
      console.log(`Created admin: ${admin.name} (${admin.email})`);
    } else {
      console.log(`Admin already exists: ${admin.name}`);
    }

    console.log('\\n=== LOGIN CREDENTIALS ===');
    console.log('Worker Login:');
    console.log('Email: worker@wastewise.com');
    console.log('Password: worker123');
    console.log('Role: worker');
    console.log('\\nAdmin Login:');
    console.log('Email: admin@wastewise.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('\\nCitizen Login (John Doe):');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');
    console.log('Role: citizen');
    
  } catch (error) {
    console.error('Error seeding worker data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\\nDisconnected from MongoDB');
  }
};

seedWorkerData();