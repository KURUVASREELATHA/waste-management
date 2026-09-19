import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test waste storage and retrieval
async function testWasteStorage() {
  console.log('🧪 Testing Waste Storage System...\n');

  try {
    // 1. Test user login
    console.log('1. Testing user authentication...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'citizen@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Test waste upload
    console.log('\n2. Testing waste upload...');
    const wasteData = {
      type: 'plastic',
      weight: 2.5,
      location: 'Test Location - Kitchen',
      description: 'Plastic bottles and containers from kitchen'
    };

    const uploadResponse = await fetch(`${API_BASE}/waste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(wasteData)
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const uploadedWaste = await uploadResponse.json();
    console.log('✅ Waste uploaded successfully');
    console.log('📊 Uploaded data:', {
      id: uploadedWaste._id,
      type: uploadedWaste.type,
      weight: uploadedWaste.weight,
      location: uploadedWaste.location,
      description: uploadedWaste.description,
      status: uploadedWaste.status
    });

    // 3. Test waste history retrieval
    console.log('\n3. Testing waste history retrieval...');
    const historyResponse = await fetch(`${API_BASE}/waste/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!historyResponse.ok) {
      throw new Error('History retrieval failed');
    }

    const wasteHistory = await historyResponse.json();
    console.log('✅ Waste history retrieved successfully');
    console.log(`📋 Found ${wasteHistory.length} waste records`);

    // Find our uploaded waste
    const ourWaste = wasteHistory.find(w => w._id === uploadedWaste._id);
    if (ourWaste) {
      console.log('✅ Uploaded waste found in history');
      console.log('📊 Retrieved data:', {
        id: ourWaste._id,
        type: ourWaste.type,
        weight: ourWaste.weight,
        location: ourWaste.location,
        description: ourWaste.description,
        status: ourWaste.status,
        verificationCode: ourWaste.verificationCode
      });
    } else {
      console.log('❌ Uploaded waste not found in history');
    }

    // 4. Test verification code generation
    console.log('\n4. Testing verification code generation...');
    const codeResponse = await fetch(`${API_BASE}/waste/${uploadedWaste._id}/generate-code`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!codeResponse.ok) {
      const error = await codeResponse.text();
      throw new Error(`Code generation failed: ${error}`);
    }

    const codeData = await codeResponse.json();
    console.log('✅ Verification code generated successfully');
    console.log('🔐 Verification code:', codeData.verificationCode);

    // 5. Test stats retrieval
    console.log('\n5. Testing stats retrieval...');
    const statsResponse = await fetch(`${API_BASE}/waste/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!statsResponse.ok) {
      throw new Error('Stats retrieval failed');
    }

    const stats = await statsResponse.json();
    console.log('✅ Stats retrieved successfully');
    console.log('📈 Stats:', stats);

    console.log('\n🎉 All tests passed! Waste storage system is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testWasteStorage();