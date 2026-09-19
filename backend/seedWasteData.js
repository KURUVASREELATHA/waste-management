import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Waste from './models/Waste.js';

dotenv.config();

const seedWasteData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create sample citizens if they don't exist
    const sampleCitizens = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567890',
        address: '123 Main Street, City Center',
        municipalId: 'MUN001',
        houseId: 'HOUSE001',
        upiId: 'john@upi'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567891',
        address: '456 Oak Avenue, Downtown',
        municipalId: 'MUN001',
        houseId: 'HOUSE002',
        upiId: 'jane@upi'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567892',
        address: '789 Pine Road, Suburb',
        municipalId: 'MUN001',
        houseId: 'HOUSE003',
        upiId: 'bob@upi'
      }
    ];

    // Create citizens
    const createdCitizens = [];
    for (const citizenData of sampleCitizens) {
      let citizen = await User.findOne({ email: citizenData.email });
      if (!citizen) {
        citizen = new User(citizenData);
        await citizen.save();
        console.log(`Created citizen: ${citizen.name}`);
      }
      createdCitizens.push(citizen);
    }

    // Create sample waste data
    const sampleWasteData = [
      {
        userId: createdCitizens[0]._id,
        municipalId: 'MUN001',
        citizenName: createdCitizens[0].name,
        citizenHouseId: createdCitizens[0].houseId,
        type: 'plastic',
        weight: 2.5,
        location: createdCitizens[0].address,
        description: 'Plastic bottles and containers from kitchen',
        status: 'pending'
      },
      {
        userId: createdCitizens[1]._id,
        municipalId: 'MUN001',
        citizenName: createdCitizens[1].name,
        citizenHouseId: createdCitizens[1].houseId,
        type: 'organic',
        weight: 4.2,
        location: createdCitizens[1].address,
        description: 'Kitchen waste and food scraps',
        status: 'pending'
      },
      {
        userId: createdCitizens[2]._id,
        municipalId: 'MUN001',
        citizenName: createdCitizens[2].name,
        citizenHouseId: createdCitizens[2].houseId,
        type: 'paper',
        weight: 1.8,
        location: createdCitizens[2].address,
        description: 'Newspapers and cardboard boxes',
        status: 'pending'
      },
      {
        userId: createdCitizens[0]._id,
        municipalId: 'MUN001',
        citizenName: createdCitizens[0].name,
        citizenHouseId: createdCitizens[0].houseId,
        type: 'mixed',
        weight: 3.1,
        location: createdCitizens[0].address,
        description: 'Mixed household waste',
        status: 'pending'
      }
    ];

    // Clear existing waste data
    await Waste.deleteMany({});
    console.log('Cleared existing waste data');

    // Insert new waste data
    for (const wasteData of sampleWasteData) {
      const waste = new Waste(wasteData);
      await waste.save();
      console.log(`Created waste entry: ${waste.type} - ${waste.weight}kg by ${waste.citizenName}`);
    }

    console.log('Sample waste data seeded successfully!');
    console.log(`Created ${sampleWasteData.length} waste entries for ${createdCitizens.length} citizens`);
    
  } catch (error) {
    console.error('Error seeding waste data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedWasteData();