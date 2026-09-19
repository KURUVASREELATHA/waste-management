import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Citizen from './models/Citizen.js';
import QRCode from './models/QRCode.js';
import Waste from './models/Waste.js';

dotenv.config();

const initializeQRCodes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all citizens
    const citizens = await Citizen.find({});
    console.log(`Found ${citizens.length} citizens`);

    for (const citizen of citizens) {
      // Check if QR code already exists
      const existingQR = await QRCode.findOne({ citizenId: citizen._id });
      
      if (!existingQR) {
        // Generate QR code if citizen doesn't have one
        let qrCodeValue = citizen.qrCode;
        if (!qrCodeValue) {
          qrCodeValue = `WW${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
          citizen.qrCode = qrCodeValue;
          await citizen.save();
        }

        // Calculate total waste collected for this citizen
        const wasteData = await Waste.aggregate([
          { $match: { userId: citizen._id, status: 'collected' } },
          { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
        ]);
        
        const totalWaste = wasteData.length > 0 ? wasteData[0].totalWeight : 0;

        // Create QR code document
        const qrCodeDoc = new QRCode({
          citizenId: citizen._id,
          qrCode: qrCodeValue,
          houseId: citizen.houseId || `HOUSE_${citizen._id.toString().slice(-6)}`,
          citizenName: citizen.name,
          citizenEmail: citizen.email,
          citizenPhone: citizen.phone,
          citizenAddress: citizen.address,
          totalWasteCollected: totalWaste,
          iotData: {
            sensorId: `IOT_${citizen._id.toString().slice(-8)}`,
            currentWeight: Math.floor(Math.random() * 50) + 10, // Mock IoT data
            lastReading: new Date(),
            batteryLevel: Math.floor(Math.random() * 30) + 70,
            status: 'active'
          }
        });

        await qrCodeDoc.save();
        console.log(`✅ Created QR code for citizen: ${citizen.name} (${qrCodeValue})`);
      } else {
        console.log(`⏭️  QR code already exists for citizen: ${citizen.name}`);
      }
    }

    console.log('✅ QR code initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing QR codes:', error);
    process.exit(1);
  }
};

initializeQRCodes();