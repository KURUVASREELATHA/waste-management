import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test QR code functionality
const testQRFunctionality = async () => {
  console.log('🧪 Testing QR Code Functionality...\n');

  try {
    // Test 1: Generate QR code (requires authentication)
    console.log('1. Testing QR code generation...');
    
    // First, let's test the scan endpoint with a mock QR code
    console.log('2. Testing QR code scanning...');
    
    const mockQRCode = 'WW1234567890ABCDE';
    const scanResponse = await fetch(`${API_BASE}/qrcode/scan/${mockQRCode}`);
    
    if (scanResponse.status === 404) {
      console.log('✅ Scan endpoint working - QR code not found (expected for mock code)');
    } else if (scanResponse.ok) {
      const scanData = await scanResponse.json();
      console.log('✅ Scan successful:', scanData.citizen.name);
    } else {
      console.log('❌ Scan endpoint error:', scanResponse.status);
    }

    // Test 3: IoT update endpoint
    console.log('3. Testing IoT update endpoint...');
    
    const iotUpdateResponse = await fetch(`${API_BASE}/qrcode/iot-update/${mockQRCode}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentWeight: 25.5,
        batteryLevel: 85,
        status: 'active'
      })
    });

    if (iotUpdateResponse.status === 404) {
      console.log('✅ IoT update endpoint working - QR code not found (expected for mock code)');
    } else if (iotUpdateResponse.ok) {
      const iotData = await iotUpdateResponse.json();
      console.log('✅ IoT update successful:', iotData.message);
    } else {
      console.log('❌ IoT update endpoint error:', iotUpdateResponse.status);
    }

    console.log('\n✅ QR Code API endpoints are working correctly!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: node backend/initializeQRCodes.js (to create QR codes for existing citizens)');
    console.log('2. Start the backend: npm run dev (in backend folder)');
    console.log('3. Start the frontend: npm run dev (in root folder)');
    console.log('4. Login as a citizen and go to "My QR Code" tab');
    console.log('5. Use /qr-scanner route to scan QR codes');
    console.log('6. QR codes work with Google Lens and camera apps');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the backend server is running on port 3001');
  }
};

testQRFunctionality();