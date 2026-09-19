import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Waste from './models/Waste.js';

dotenv.config();

const clearWasteData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all waste data
    const result = await Waste.deleteMany({});
    console.log(`Deleted ${result.deletedCount} waste records`);

    console.log('All waste data cleared successfully!');
    
  } catch (error) {
    console.error('Error clearing waste data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

clearWasteData();