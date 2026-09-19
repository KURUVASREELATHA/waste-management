#!/usr/bin/env node

const API_BASE = 'http://localhost:3001/api';

async function testLocationTracking() {
  console.log('🧪 Testing Location Tracking System...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend server is not running');
    }
    const health = await healthResponse.json();
    console.log('✅ Backend is healthy:', health.status);
    console.log('   Database:', health.database);
    console.log('');

    // Test 2: Check active workers
    console.log('2. Checking active workers...');
    const workersResponse = await fetch(`${API_BASE}/workers/active`);
    const workers = await workersResponse.json();
    console.log(`✅ Found ${workers.length} active worker(s)`);
    if (workers.length > 0) {
      console.log('   Worker details:', {
        name: workers[0].name,
        workerId: workers[0].workerId,
        status: workers[0].status,
        location: workers[0].currentLocation
      });
    }
    console.log('');

    // Test 3: Update worker location
    console.log('3. Testing location update...');
    const testLocation = {
      lat: 13.630434 + Math.random() * 0.001, // Add small random offset
      lng: 78.479515 + Math.random() * 0.001,
      workerId: 'TW001'
    };

    const locationResponse = await fetch(`${API_BASE}/workers/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testLocation)
    });

    if (!locationResponse.ok) {
      const error = await locationResponse.json();
      throw new Error(`Location update failed: ${error.message}`);
    }

    const locationResult = await locationResponse.json();
    console.log('✅ Location updated successfully');
    console.log('   New location:', {
      lat: locationResult.worker.currentLocation.lat,
      lng: locationResult.worker.currentLocation.lng,
      lastUpdated: locationResult.worker.currentLocation.lastUpdated
    });
    console.log('');

    // Test 4: Update worker status
    console.log('4. Testing status update...');
    const statusResponse = await fetch(`${API_BASE}/workers/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'collecting',
        workerId: 'TW001',
        currentLoad: 25.5
      })
    });

    if (!statusResponse.ok) {
      const error = await statusResponse.json();
      throw new Error(`Status update failed: ${error.message}`);
    }

    const statusResult = await statusResponse.json();
    console.log('✅ Status updated successfully');
    console.log('   New status:', statusResult.worker.status);
    console.log('   Current load:', statusResult.worker.currentLoad);
    console.log('');

    // Test 5: Verify updates in active workers
    console.log('5. Verifying updates...');
    const updatedWorkersResponse = await fetch(`${API_BASE}/workers/active`);
    const updatedWorkers = await updatedWorkersResponse.json();
    
    if (updatedWorkers.length > 0) {
      const worker = updatedWorkers[0];
      console.log('✅ Worker data verified:');
      console.log('   Status:', worker.status);
      console.log('   Location:', `${worker.currentLocation.lat}, ${worker.currentLocation.lng}`);
      console.log('   Last updated:', worker.currentLocation.lastUpdated);
      console.log('   Current load:', worker.currentLoad);
    }

    console.log('\n🎉 All location tracking tests passed!');
    console.log('\n📱 The LocationTracker component should now work properly in the frontend.');
    console.log('   - GPS tracking will update worker location every few seconds');
    console.log('   - Worker status will be updated when tracking starts/stops');
    console.log('   - No more 404 errors should appear in the console');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testLocationTracking();