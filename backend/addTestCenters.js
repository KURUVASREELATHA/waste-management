import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecyclingCenter from './models/RecyclingCenter.js';

dotenv.config();

const addTestCenters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const realCenters = [
      {
        name: "Saahas Zero Waste",
        address: "#45, 2nd Cross, Indiranagar, Bangalore - 560038",
        phone: "080-41731173",
        email: "info@saahaszerowaste.com",
        status: "active",
        rates: {
          plastic: 20,
          paper: 12,
          metal: 35,
          glass: 8
        }
      },
      {
        name: "Hasiru Dala Innovations",
        address: "#204, 2nd Floor, SLV Arcade, Bannerghatta Road, Bangalore - 560076",
        phone: "080-26699512",
        email: "contact@hasirudala.in",
        status: "active",
        rates: {
          plastic: 18,
          paper: 10,
          organic: 6,
          metal: 32
        }
      },
      {
        name: "Recykal Solutions",
        address: "#12, 1st Floor, Koramangala Industrial Layout, Bangalore - 560095",
        phone: "080-49652300",
        email: "support@recykal.com",
        status: "active",
        rates: {
          plastic: 22,
          paper: 14,
          metal: 40,
          glass: 10
        }
      },
      {
        name: "Banyan Nation",
        address: "#23, Hosur Road, Electronic City, Bangalore - 560100",
        phone: "080-67834500",
        email: "info@banyannation.com",
        status: "active",
        rates: {
          plastic: 25,
          metal: 38
        }
      },
      {
        name: "Nepra Resource Management",
        address: "#67, Peenya Industrial Area, Bangalore - 560058",
        phone: "080-28397456",
        email: "operations@nepra.in",
        status: "pending",
        rates: {
          plastic: 16,
          paper: 9,
          glass: 7,
          metal: 28,
          organic: 4
        }
      }
    ];
    
    await RecyclingCenter.insertMany(realCenters);
    console.log('Real recycling centers added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to add test centers:', error);
    process.exit(1);
  }
};

addTestCenters();