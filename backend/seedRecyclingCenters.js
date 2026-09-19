import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecyclingCenter from './models/RecyclingCenter.js';

dotenv.config();

const seedCenters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing centers
    await RecyclingCenter.deleteMany({});
    
    // Insert sample centers
    const centers = [
      {
        name: "EcoRecycle Center Madanapalli",
        address: "Industrial Area, Madanapalli, AP 517325",
        phone: "+91 9876543210",
        email: "contact@ecorecycle.com",
        status: "active",
        wasteReceived: 2500,
        wasteProcessed: 2300,
        efficiency: 92,
        rates: {
          plastic: 15,
          paper: 8,
          metal: 25,
          organic: 5
        }
      },
      {
        name: "Green Earth Recycling",
        address: "Bypass Road, Chittoor, AP 517001",
        phone: "+91 9876543211",
        email: "info@greenearth.com",
        status: "active",
        wasteReceived: 1800,
        wasteProcessed: 1700,
        efficiency: 94,
        rates: {
          plastic: 14,
          paper: 7,
          metal: 24,
          organic: 4
        }
      }
    ];
    
    await RecyclingCenter.insertMany(centers);
    console.log('Recycling centers seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedCenters();