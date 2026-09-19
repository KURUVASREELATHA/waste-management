// Test script to simulate waste collection
// Run this with: node test-waste-collection.js

const API_BASE = 'http://localhost:5000/api';

async function testWasteCollection() {
  try {
    // First, register a test user (citizen)
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Citizen',
        email: 'test@example.com',
        password: 'password123',
        role: 'citizen',
        houseId: 'HOUSE_001'
      })
    });

    if (!registerResponse.ok) {
      console.log('User might already exist, trying to login...');
    }

    // Login as citizen
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const citizenToken = loginData.token;

    console.log('✅ Citizen logged in');

    // Create waste entry as citizen
    const wasteResponse = await fetch(`${API_BASE}/waste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        type: 'organic',
        weight: 5.5,
        location: '123 Main Street',
        description: 'Kitchen waste'
      })
    });

    const wasteData = await wasteResponse.json();
    console.log('✅ Waste entry created:', wasteData._id);

    // Register and login as worker
    const workerRegisterResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Worker',
        email: 'worker@example.com',
        password: 'password123',
        role: 'worker'
      })
    });

    const workerLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'worker@example.com',
        password: 'password123'
      })
    });

    const workerLoginData = await workerLoginResponse.json();
    const workerToken = workerLoginData.token;

    console.log('✅ Worker logged in');

    // Mark waste as collected
    const collectResponse = await fetch(`${API_BASE}/waste/${wasteData._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerToken}`
      },
      body: JSON.stringify({
        status: 'collected'
      })
    });

    const collectedWaste = await collectResponse.json();
    console.log('✅ Waste marked as collected:', collectedWaste.status);

    // Check dashboard stats
    const statsResponse = await fetch(`${API_BASE}/waste/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${workerToken}`
      }
    });

    const stats = await statsResponse.json();
    console.log('📊 Dashboard Stats:', stats);

    console.log('\n🎉 Test completed successfully! Dashboard should now show updated data.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWasteCollection();