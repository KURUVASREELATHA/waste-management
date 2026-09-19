import express from 'express';
import Municipality from '../models/Municipality.js';

const router = express.Router();

// Cleanup offline workers periodically
setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await Municipality.updateMany(
      {
        role: 'worker',
        'currentLocation.lastUpdated': { $lt: fiveMinutesAgo },
        status: { $ne: 'offline' },
        name: { $not: /^GPS Tracker/ },
        email: { $ne: 'test-gps-worker@wastewise.com' }
      },
      { 
        status: 'offline',
        isLocationActive: false
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Set ${result.modifiedCount} workers to offline due to inactivity`);
    }
    
    // Clean up any GPS Tracker workers but keep the test worker
    const cleanupResult = await Municipality.deleteMany({
      role: 'worker',
      name: { $regex: /^GPS Tracker/ },
      email: { $ne: 'test-gps-worker@wastewise.com' }
    });
    if (cleanupResult.deletedCount > 0) {
      console.log(`Cleaned up ${cleanupResult.deletedCount} GPS Tracker workers`);
    }
  } catch (error) {
    console.error('Error in offline cleanup:', error);
  }
}, 60000); // Run every minute

// Update worker location
router.patch('/location', async (req, res) => {
  try {
    const { lat, lng, workerId } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    let worker;
    
    if (workerId) {
      // Update specific worker by workerId
      worker = await Municipality.findOneAndUpdate(
        { workerId, role: 'worker' },
        {
          'currentLocation.lat': lat,
          'currentLocation.lng': lng,
          'currentLocation.lastUpdated': new Date(),
          isLocationActive: true,
          status: 'available'
        },
        { new: true }
      );
    } else {
      // For test worker or when no workerId provided, use a consistent test worker
      const testWorkerEmail = 'test-gps-worker@wastewise.com';
      
      // Try to find existing test worker first
      worker = await Municipality.findOneAndUpdate(
        { email: testWorkerEmail, role: 'worker' },
        {
          'currentLocation.lat': lat,
          'currentLocation.lng': lng,
          'currentLocation.lastUpdated': new Date(),
          isLocationActive: true,
          status: 'available'
        },
        { new: true }
      );
      
      // If no test worker exists, create one
      if (!worker) {
        worker = new Municipality({
          name: 'GPS Test Worker',
          email: testWorkerEmail,
          password: 'test123',
          role: 'worker',
          workerId: 'test-gps-001',
          vehicleId: 'TEST-001',
          route: 'Test Route',
          currentLocation: {
            lat: lat,
            lng: lng,
            lastUpdated: new Date()
          },
          isLocationActive: true,
          status: 'available'
        });
        await worker.save();
      }
    }

    if (!worker) {
      return res.status(404).json({ 
        message: 'Worker not found',
        suggestion: 'Ensure the worker exists or try again'
      });
    }

    res.json({ message: 'Location updated successfully', worker });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update worker status (no auth for testing)
router.patch('/status', async (req, res) => {
  try {
    const { status, currentLoad, workerId } = req.body;
    
    const updateData = {
      'currentLocation.lastUpdated': new Date() // Update timestamp when status changes
    };
    if (status) {
      updateData.status = status;
      // If setting to offline, also set isLocationActive to false
      if (status === 'offline') {
        updateData.isLocationActive = false;
      }
    }
    if (currentLoad !== undefined) updateData.currentLoad = currentLoad;

    let worker;
    
    if (workerId) {
      // Update specific worker by workerId
      worker = await Municipality.findOneAndUpdate(
        { workerId, role: 'worker' },
        updateData,
        { new: true }
      );
    } else {
      // For test worker, use consistent test worker email
      const testWorkerEmail = 'test-gps-worker@wastewise.com';
      worker = await Municipality.findOneAndUpdate(
        { email: testWorkerEmail, role: 'worker' },
        updateData,
        { new: true }
      );
    }

    if (!worker) {
      return res.status(404).json({ 
        message: 'Worker not found',
        suggestion: 'Ensure the worker exists or start GPS tracking first'
      });
    }

    res.json({ message: 'Status updated successfully', worker });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active workers with locations
router.get('/active', async (req, res) => {
  try {
    console.log('Fetching active workers...');
    
    // First, update offline status for workers who haven't updated location in 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Municipality.updateMany(
      {
        role: 'worker',
        'currentLocation.lastUpdated': { $lt: fiveMinutesAgo },
        status: { $ne: 'offline' },
        name: { $not: /^GPS Tracker/ },
        email: { $ne: 'test-gps-worker@wastewise.com' }
      },
      { 
        status: 'offline',
        isLocationActive: false
      }
    );
    
    // Clean up any GPS Tracker workers but keep the test worker
    await Municipality.deleteMany({
      role: 'worker',
      name: { $regex: /^GPS Tracker/ },
      email: { $ne: 'test-gps-worker@wastewise.com' }
    });
    
    const activeWorkers = await Municipality.find({
      role: 'worker',
      isLocationActive: true,
      'currentLocation.lat': { $exists: true },
      'currentLocation.lng': { $exists: true },
      'currentLocation.lastUpdated': { $gte: fiveMinutesAgo },
      status: { $ne: 'offline' },
      name: { $not: /^GPS Tracker/ },
      name: { $exists: true, $ne: null, $ne: '' }
    }).select('name workerId vehicleId route status currentLocation currentLoad vehicleCapacity');

    console.log('Found active workers:', activeWorkers.length);
    console.log('Sample worker:', activeWorkers[0]);

    res.json(activeWorkers);
  } catch (error) {
    console.error('Get active workers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;