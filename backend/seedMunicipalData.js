import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Waste from './models/Waste.js';
import Report from './models/Report.js';

dotenv.config();

const seedMunicipalData = async () => {
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
        municipalId: 'MU01',
        houseId: 'H001',
        upiId: 'john@upi'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567891',
        address: '456 Oak Avenue, Downtown',
        municipalId: 'MU01',
        houseId: 'H002',
        upiId: 'jane@upi'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567892',
        address: '789 Pine Road, Suburb',
        municipalId: 'MU01',
        houseId: 'H003',
        upiId: 'bob@upi'
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        password: 'password123',
        role: 'citizen',
        phone: '+1234567893',
        address: '321 Elm Street, Uptown',
        municipalId: 'MU01',
        houseId: 'H004',
        upiId: 'alice@upi'
      }
    ];

    // Create workers
    const sampleWorkers = [
      {
        name: 'Worker One',
        email: 'worker1@municipality.com',
        password: 'password123',
        role: 'worker',
        phone: '+1234567894',
        address: 'Municipal Office',
        municipalId: 'MU01',
        workerId: 'W001'
      },
      {
        name: 'Worker Two',
        email: 'worker2@municipality.com',
        password: 'password123',
        role: 'worker',
        phone: '+1234567895',
        address: 'Municipal Office',
        municipalId: 'MU01',
        workerId: 'W002'
      }
    ];

    // Create all users
    const allUsers = [...sampleCitizens, ...sampleWorkers];
    const createdUsers = [];
    
    for (const userData of allUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`Created ${userData.role}: ${user.name}`);
      }
      createdUsers.push(user);
    }

    const citizens = createdUsers.filter(u => u.role === 'citizen');
    const workers = createdUsers.filter(u => u.role === 'worker');

    // Create sample waste data with different statuses and dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const sampleWasteData = [
      // Today's collections (collected)
      {
        userId: citizens[0]._id,
        municipalId: 'MU01',
        citizenName: citizens[0].name,
        citizenHouseId: citizens[0].houseId,
        type: 'plastic',
        weight: 2.5,
        location: citizens[0].address,
        description: 'Plastic bottles and containers',
        status: 'collected',
        collectedBy: workers[0]._id,
        collectedAt: today,
        createdAt: today
      },
      {
        userId: citizens[1]._id,
        municipalId: 'MU01',
        citizenName: citizens[1].name,
        citizenHouseId: citizens[1].houseId,
        type: 'organic',
        weight: 4.2,
        location: citizens[1].address,
        description: 'Kitchen waste and food scraps',
        status: 'collected',
        collectedBy: workers[1]._id,
        collectedAt: today,
        createdAt: today
      },
      {
        userId: citizens[2]._id,
        municipalId: 'MU01',
        citizenName: citizens[2].name,
        citizenHouseId: citizens[2].houseId,
        type: 'paper',
        weight: 1.8,
        location: citizens[2].address,
        description: 'Newspapers and cardboard',
        status: 'collected',
        collectedBy: workers[0]._id,
        collectedAt: today,
        createdAt: today
      },
      // Pending collections
      {
        userId: citizens[3]._id,
        municipalId: 'MU01',
        citizenName: citizens[3].name,
        citizenHouseId: citizens[3].houseId,
        type: 'mixed',
        weight: 3.1,
        location: citizens[3].address,
        description: 'Mixed household waste',
        status: 'pending',
        createdAt: today
      },
      // Previous collections for monthly total
      {
        userId: citizens[0]._id,
        municipalId: 'MU01',
        citizenName: citizens[0].name,
        citizenHouseId: citizens[0].houseId,
        type: 'glass',
        weight: 2.0,
        location: citizens[0].address,
        description: 'Glass bottles and jars',
        status: 'collected',
        collectedBy: workers[1]._id,
        collectedAt: yesterday,
        createdAt: yesterday
      },
      {
        userId: citizens[1]._id,
        municipalId: 'MU01',
        citizenName: citizens[1].name,
        citizenHouseId: citizens[1].houseId,
        type: 'metal',
        weight: 1.5,
        location: citizens[1].address,
        description: 'Aluminum cans and metal scraps',
        status: 'collected',
        collectedBy: workers[0]._id,
        collectedAt: thisMonth,
        createdAt: thisMonth
      }
    ];

    // Clear existing waste data
    await Waste.deleteMany({});
    console.log('Cleared existing waste data');

    // Insert new waste data
    for (const wasteData of sampleWasteData) {
      const waste = new Waste(wasteData);
      await waste.save();
      console.log(`Created waste entry: ${waste.type} - ${waste.weight}kg by ${waste.citizenName} (${waste.status})`);
    }

    // Create sample reports
    const sampleReports = [
      {
        userId: citizens[0]._id,
        title: 'Missed Collection',
        description: 'Waste was not collected on scheduled day',
        status: 'pending',
        priority: 'medium',
        location: citizens[0].address,
        createdAt: today
      },
      {
        userId: citizens[1]._id,
        title: 'Overflowing Bin',
        description: 'Community bin is overflowing',
        status: 'resolved',
        priority: 'high',
        location: citizens[1].address,
        createdAt: yesterday
      }
    ];

    // Clear existing reports
    await Report.deleteMany({});
    console.log('Cleared existing reports');

    // Insert new reports
    for (const reportData of sampleReports) {
      const report = new Report(reportData);
      await report.save();
      console.log(`Created report: ${report.title} (${report.status})`);
    }

    console.log('Municipal data seeded successfully!');
    console.log(`Created ${createdUsers.length} users (${citizens.length} citizens, ${workers.length} workers)`);
    console.log(`Created ${sampleWasteData.length} waste entries`);
    console.log(`Created ${sampleReports.length} reports`);
    
  } catch (error) {
    console.error('Error seeding municipal data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedMunicipalData();