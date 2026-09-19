const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test penalties system
async function testPenaltiesSystem() {
  try {
    console.log('🧪 Testing Penalties System...\n');

    // 1. Login as admin/worker to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@wastewise.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');

    // 2. Get citizens list
    console.log('2. Fetching citizens...');
    const citizensResponse = await axios.get(`${API_BASE}/auth/users/role/citizen`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (citizensResponse.data.length === 0) {
      console.log('❌ No citizens found. Please create a citizen first.\n');
      return;
    }
    
    const citizen = citizensResponse.data[0];
    console.log(`✅ Found citizen: ${citizen.name} (${citizen.houseId})\n`);

    // 3. Issue a penalty
    console.log('3. Issuing penalty...');
    const penaltyData = {
      citizenId: citizen._id,
      violationType: 'improper_segregation',
      description: 'Citizen mixed organic and plastic waste in the same bag',
      amount: 500,
      location: citizen.address || 'Citizen residence'
    };

    const issuePenaltyResponse = await axios.post(`${API_BASE}/penalties/issue`, penaltyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const penalty = issuePenaltyResponse.data;
    console.log(`✅ Penalty issued successfully: ₹${penalty.amount} for ${penalty.violationType}\n`);

    // 4. Get all penalties (municipal view)
    console.log('4. Fetching all penalties...');
    const allPenaltiesResponse = await axios.get(`${API_BASE}/penalties/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${allPenaltiesResponse.data.length} penalties in system\n`);

    // 5. Login as citizen to test citizen view
    console.log('5. Testing citizen login...');
    try {
      const citizenLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: citizen.email,
        password: 'password123' // Default password
      });
      
      const citizenToken = citizenLoginResponse.data.token;
      console.log('✅ Citizen login successful\n');

      // 6. Get citizen's penalties
      console.log('6. Fetching citizen penalties...');
      const citizenPenaltiesResponse = await axios.get(`${API_BASE}/penalties/my-penalties`, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      
      console.log(`✅ Citizen has ${citizenPenaltiesResponse.data.length} penalties\n`);

      // 7. Test penalty payment
      if (citizenPenaltiesResponse.data.length > 0) {
        const penaltyToPay = citizenPenaltiesResponse.data[0];
        console.log('7. Testing penalty payment...');
        
        const paymentResponse = await axios.patch(`${API_BASE}/penalties/${penaltyToPay._id}/pay`, {
          paymentMethod: 'UPI',
          paymentReference: 'TEST_PAY_' + Date.now()
        }, {
          headers: { Authorization: `Bearer ${citizenToken}` }
        });
        
        console.log(`✅ Penalty payment successful: ₹${paymentResponse.data.amount}\n`);
      }

    } catch (citizenError) {
      console.log('⚠️ Citizen login failed (expected if no citizen password set)\n');
    }

    // 8. Get penalty statistics
    console.log('8. Fetching penalty statistics...');
    const statsResponse = await axios.get(`${API_BASE}/penalties/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Penalty Statistics:');
    console.log(`   Total Penalties: ${statsResponse.data.totalPenalties}`);
    console.log(`   Total Revenue: ₹${statsResponse.data.totalRevenue}`);
    console.log(`   Status Breakdown:`, statsResponse.data.statusBreakdown);

    console.log('\n🎉 Penalties system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testPenaltiesSystem();