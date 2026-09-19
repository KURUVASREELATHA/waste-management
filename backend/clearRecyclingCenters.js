import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecyclingCenter from './models/RecyclingCenter.js';

dotenv.config();

const clearCenters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await RecyclingCenter.deleteMany({});
    console.log('All recycling centers cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Clearing failed:', error);
    process.exit(1);
  }
};

clearCenters();