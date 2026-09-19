const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testWithExistingUsers() {
  try {
    console.log('🧪 Testing with existing users...\n');

    // 1. Login as municipal worker
    console.log('1. Logging in as municipal worker...');
    const workerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mv@g',
      password: 'password', // You may need to adjust this
      role: 'worker'
    });
    const workerToken = workerLogin.data.token;
    console.log('✅ Municipal worker login successful');

    // 2. Login as citizen
    console.log('\n2. Logging in as citizen...');
    const citizenLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'cv@g',
      password: 'password', // You may need to adjust this
      role: 'citizen'
    });
    const citizenToken = citizenLogin.data.token;
    console.log('✅ Citizen login successful');

    // 3. Get citizen details for penalty
    const citizenResponse = await axios.get(`${API_BASE}/auth/users/role/citizen`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    const citizen = citizenResponse.data.find(c => c.email === 'cv@g');
    
    if (!citizen) {
      console.log('❌ Citizen cv@g not found');
      return;
    }

    // 4. Issue penalty
    console.log('\n3. Issuing penalty...');
    const penaltyResponse = await axios.post(`${API_BASE}/penalties/issue`, {
      citizenId: citizen._id,
      violationType: 'improper_segregation',
      description: 'Test penalty for improper waste segregation',
      amount: '250',
      location: 'Test location'
    }, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    console.log('✅ Penalty issued successfully');

    // 5. Check citizen penalties
    console.log('\n4. Checking citizen penalties...');
    const penalties = await axios.get(`${API_BASE}/penalties/my-penalties`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`✅ Citizen has ${penalties.data.length} penalties`);

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testWithExistingUsers();