const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testPenalties() {
  try {
    console.log('🧪 Testing Penalties System...\n');

    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server is running:', healthResponse.data.status);

    // 2. Test penalties endpoint accessibility
    console.log('\n2. Testing penalties endpoint...');
    try {
      const penaltiesResponse = await axios.get(`${API_BASE}/penalties/all`);
      console.log('❌ Penalties endpoint should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Penalties endpoint is properly protected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // 3. Try to login as admin
    console.log('\n3. Testing admin login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@wastewise.com',
        password: 'admin123',
        role: 'admin'
      });
      
      if (loginResponse.data.token) {
        console.log('✅ Admin login successful');
        
        // 4. Test authenticated penalties access
        console.log('\n4. Testing authenticated penalties access...');
        const token = loginResponse.data.token;
        const penaltiesResponse = await axios.get(`${API_BASE}/penalties/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Penalties fetched successfully: ${penaltiesResponse.data.length} penalties found`);
        
        // 5. Test penalty statistics
        console.log('\n5. Testing penalty statistics...');
        const statsResponse = await axios.get(`${API_BASE}/penalties/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Penalty statistics:', {
          total: statsResponse.data.totalPenalties,
          revenue: statsResponse.data.totalRevenue
        });
        
      } else {
        console.log('❌ Admin login failed - no token received');
      }
    } catch (loginError) {
      console.log('⚠️ Admin login failed:', loginError.response?.data?.message || loginError.message);
      console.log('   This is expected if admin user doesn\'t exist yet');
    }

    console.log('\n🎉 Penalties system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPenalties();