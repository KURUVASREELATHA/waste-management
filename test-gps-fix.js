import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testGPSFix() {
  console.log('Testing GPS Location Tracking Fix...\n');

  // Test location update without workerId (simulates test worker)
  console.log('1. Testing location update without workerId...');
  try {
    const response = await fetch(`${API_BASE}/workers/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 13.573920,
        lng: 78.493948
      })
    });
    
    const result = await response.json();
    console.log('✅ Location update response:', result.message);
    console.log('Worker created/updated:', result.worker.name, result.worker.email);
  } catch (error) {
    console.error('❌ Location update failed:', error.message);
  }

  // Test second location update (should update same worker)
  console.log('\n2. Testing second location update (should update same worker)...');
  try {
    const response = await fetch(`${API_BASE}/workers/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat: 13.574000,
        lng: 78.494000
      })
    });
    
    const result = await response.json();
    console.log('✅ Second location update response:', result.message);
    console.log('Same worker updated:', result.worker.name, result.worker.email);
  } catch (error) {
    console.error('❌ Second location update failed:', error.message);
  }

  // Check active workers
  console.log('\n3. Checking active workers...');
  try {
    const response = await fetch(`${API_BASE}/workers/active`);
    const workers = await response.json();
    console.log(`✅ Found ${workers.length} active workers:`);
    workers.forEach((worker, index) => {
      console.log(`  Worker ${index + 1}: ${worker.name} at (${worker.currentLocation.lat}, ${worker.currentLocation.lng})`);
    });
  } catch (error) {
    console.error('❌ Failed to get active workers:', error.message);
  }
}

testGPSFix();