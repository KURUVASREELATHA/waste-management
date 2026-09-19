// Quick test to check API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  try {
    // Test basic connection
    console.log('Testing basic connection...');
    const response = await fetch(`${API_BASE}/waste/test`);
    const data = await response.json();
    console.log('✅ Basic test:', data);
    
    // Test health endpoint
    console.log('\nTesting health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();