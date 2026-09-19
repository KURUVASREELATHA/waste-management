import mongoose from 'mongoose';
import Municipality from './models/Municipality.js';
import dotenv from 'dotenv';

dotenv.config();

const createMunicipalWorker = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if worker already exists
    const existingWorker = await Municipality.findOne({ email: 'cm@gmail.com' });
    if (existingWorker) {
      console.log('Municipal worker already exists:', existingWorker.email);
      return;
    }

    // Create municipal worker
    const worker = new Municipality({
      name: 'Municipal Worker',
      email: 'cm@gmail.com',
      password: '123456',
      phone: '1234567890',
      address: 'Municipal Office',
      municipalId: 'MU01',
      workerId: 'W001',
      role: 'worker'
    });

    await worker.save();
    console.log('Municipal worker created successfully:', {
      email: worker.email,
      role: worker.role,
      municipalId: worker.municipalId
    });

  } catch (error) {
    console.error('Error creating municipal worker:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createMunicipalWorker();