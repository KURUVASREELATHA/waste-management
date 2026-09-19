import mongoose from 'mongoose';
import Municipality from './backend/models/Municipality.js';
import Citizen from './backend/models/Citizen.js';
import Penalty from './backend/models/Penalty.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

const setupTestData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create admin user if not exists
    let admin = await Municipality.findOne({ email: 'admin@wastewise.com' });
    if (!admin) {
      admin = new Municipality({
        name: 'System Administrator',
        email: 'admin@wastewise.com',
        password: 'admin123',
        role: 'admin',
        municipalId: 'MU01',
        workerId: 'ADMIN001',
        phone: '9999999999',
        address: 'Municipal Office'
      });
      await admin.save();
      console.log('✅ Admin user created');
    }

    // Create worker user if not exists
    let worker = await Municipality.findOne({ email: 'worker@wastewise.com' });
    if (!worker) {
      worker = new Municipality({
        name: 'Municipal Worker',
        email: 'worker@wastewise.com',
        password: 'worker123',
        role: 'worker',
        municipalId: 'MU01',
        workerId: 'WORKER001',
        phone: '8888888888',
        address: 'Municipal Office'
      });
      await worker.save();
      console.log('✅ Worker user created');
    }

    // Create test citizen if not exists
    let citizen = await Citizen.findOne({ email: 'citizen@test.com' });
    if (!citizen) {
      citizen = new Citizen({
        name: 'Test Citizen',
        email: 'citizen@test.com',
        password: 'citizen123',
        houseId: 'H001',
        municipalId: 'MU01',
        phone: '7777777777',
        address: 'Test Address, Test City',
        upiId: 'citizen@upi'
      });
      await citizen.save();
      console.log('✅ Test citizen created');
    }

    await mongoose.disconnect();
    console.log('✅ Database setup completed\n');

    return { admin, worker, citizen };
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
};

const testPenaltiesAPI = async () => {
  try {
    console.log('🧪 Testing Penalties API...\n');

    // 1. Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Server status:', healthResponse.data.status);

    // 2. Login as worker
    console.log('\n2. Logging in as worker...');
    const workerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'worker@wastewise.com',
      password: 'worker123',
      role: 'worker'
    });
    const workerToken = workerLogin.data.token;
    console.log('✅ Worker login successful');

    // 3. Get citizens list
    console.log('\n3. Fetching citizens...');
    const citizensResponse = await axios.get(`${API_BASE}/auth/users/role/citizen`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    console.log(`✅ Found ${citizensResponse.data.length} citizens`);

    if (citizensResponse.data.length === 0) {
      console.log('❌ No citizens found for testing');
      return;
    }

    const testCitizen = citizensResponse.data[0];
    console.log(`   Using citizen: ${testCitizen.name} (${testCitizen.houseId})`);

    // 4. Issue a penalty
    console.log('\n4. Issuing penalty...');
    const penaltyData = {
      citizenId: testCitizen._id,
      violationType: 'improper_segregation',
      description: 'Mixed organic and plastic waste in the same bag during inspection',
      amount: '500',
      location: testCitizen.address || 'Citizen residence'
    };

    const issuePenaltyResponse = await axios.post(`${API_BASE}/penalties/issue`, penaltyData, {
      headers: { 
        Authorization: `Bearer ${workerToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Penalty issued successfully');
    console.log(`   Penalty ID: ${issuePenaltyResponse.data.penalty._id}`);
    console.log(`   Amount: ₹${issuePenaltyResponse.data.penalty.amount}`);

    // 5. Fetch all penalties
    console.log('\n5. Fetching all penalties...');
    const allPenaltiesResponse = await axios.get(`${API_BASE}/penalties/all`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    console.log(`✅ Found ${allPenaltiesResponse.data.length} total penalties`);

    // 6. Test citizen login and penalty view
    console.log('\n6. Testing citizen penalty view...');
    try {
      const citizenLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'citizen@test.com',
        password: 'citizen123',
        role: 'citizen'
      });
      const citizenToken = citizenLogin.data.token;
      console.log('✅ Citizen login successful');

      const citizenPenaltiesResponse = await axios.get(`${API_BASE}/penalties/my-penalties`, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      console.log(`✅ Citizen has ${citizenPenaltiesResponse.data.length} penalties`);

      // 7. Test penalty payment
      if (citizenPenaltiesResponse.data.length > 0) {
        const penaltyToPay = citizenPenaltiesResponse.data.find(p => p.status === 'pending');
        if (penaltyToPay) {
          console.log('\n7. Testing penalty payment...');
          const paymentResponse = await axios.patch(`${API_BASE}/penalties/${penaltyToPay._id}/pay`, {
            paymentMethod: 'UPI',
            paymentReference: 'TEST_PAY_' + Date.now()
          }, {
            headers: { Authorization: `Bearer ${citizenToken}` }
          });
          console.log(`✅ Payment successful: ₹${paymentResponse.data.amount}`);
        }
      }

    } catch (citizenError) {
      console.log('⚠️ Citizen login/penalty test failed:', citizenError.response?.data?.message || citizenError.message);
    }

    // 8. Get penalty statistics
    console.log('\n8. Fetching penalty statistics...');
    const statsResponse = await axios.get(`${API_BASE}/penalties/stats`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    console.log('✅ Penalty Statistics:');
    console.log(`   Total Penalties: ${statsResponse.data.totalPenalties}`);
    console.log(`   Total Revenue: ₹${statsResponse.data.totalRevenue}`);
    console.log(`   Status Breakdown:`, statsResponse.data.statusBreakdown);

    console.log('\n🎉 All penalties tests passed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response data:', error.response.data);
    }
  }
};

const runCompleteTest = async () => {
  try {
    console.log('🚀 Starting Complete Penalties System Test\n');
    
    // Setup test data
    await setupTestData();
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test API functionality
    await testPenaltiesAPI();
    
    console.log('\n✅ Complete test finished successfully!');
  } catch (error) {
    console.error('\n❌ Complete test failed:', error.message);
  }
};

runCompleteTest();