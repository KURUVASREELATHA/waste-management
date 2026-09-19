import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const initializeWorkerLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find existing workers and update them with location data
    const workers = await User.find({ role: 'worker' });
    
    if (workers.length === 0) {
      console.log('No workers found. Creating sample workers...');
      
      // Create sample workers with location data
      const sampleWorkers = [
        {
          name: 'Waste Truck Alpha',
          email: 'worker1@wastewise.com',
          password: 'password123',
          role: 'worker',
          workerId: 'WW001',
          vehicleId: 'TRUCK_001',
          route: 'Route A - Madanapalle Town',
          vehicleCapacity: 1000,
          currentLoad: 250,
          status: 'available',
          currentLocation: {
            lat: 13.5497,
            lng: 78.5004,
            lastUpdated: new Date()
          },
          isLocationActive: true,
          municipalId: 'MU01'
        },
        {
          name: 'Waste Truck Beta',
          email: 'worker2@wastewise.com',
          password: 'password123',
          role: 'worker',
          workerId: 'WW002',
          vehicleId: 'TRUCK_002',
          route: 'Route B - Residential Area',
          vehicleCapacity: 1200,
          currentLoad: 670,
          status: 'collecting',
          currentLocation: {
            lat: 13.5744,
            lng: 78.4944,
            lastUpdated: new Date()
          },
          isLocationActive: true,
          municipalId: 'MU01'
        },
        {
          name: 'Waste Truck Gamma',
          email: 'worker3@wastewise.com',
          password: 'password123',
          role: 'worker',
          workerId: 'WW003',
          vehicleId: 'TRUCK_003',
          route: 'Route C - MITS Campus',
          vehicleCapacity: 1000,
          currentLoad: 150,
          status: 'en_route',
          currentLocation: {
            lat: 13.5601,
            lng: 78.5042,
            lastUpdated: new Date()
          },
          isLocationActive: true,
          municipalId: 'MU01'
        }
      ];

      for (const workerData of sampleWorkers) {
        const worker = new User(workerData);
        await worker.save();
        console.log(`Created worker: ${worker.name}`);
      }
    } else {
      console.log(`Found ${workers.length} existing workers. Updating with location data...`);
      
      const locations = [
        { lat: 13.5497, lng: 78.5004, route: 'Route A - Madanapalle Town', vehicleId: 'TRUCK_001' },
        { lat: 13.5744, lng: 78.4944, route: 'Route B - Residential Area', vehicleId: 'TRUCK_002' },
        { lat: 13.5601, lng: 78.5042, route: 'Route C - MITS Campus', vehicleId: 'TRUCK_003' }
      ];
      
      for (let i = 0; i < workers.length && i < locations.length; i++) {
        const worker = workers[i];
        const location = locations[i];
        
        await User.findByIdAndUpdate(worker._id, {
          vehicleId: location.vehicleId,
          route: location.route,
          vehicleCapacity: 1000,
          currentLoad: Math.floor(Math.random() * 500),
          status: ['available', 'collecting', 'en_route'][Math.floor(Math.random() * 3)],
          currentLocation: {
            lat: location.lat,
            lng: location.lng,
            lastUpdated: new Date()
          },
          isLocationActive: true
        });
        
        console.log(`Updated worker: ${worker.name} with location data`);
      }
    }

    console.log('Worker location initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing worker locations:', error);
    process.exit(1);
  }
};

initializeWorkerLocations();