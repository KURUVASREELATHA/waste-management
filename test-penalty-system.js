import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test penalty system
async function testPenaltySystem() {
  try {
    console.log('Testing penalty system...');
    
    // Test 1: Check if penalty routes are accessible
    console.log('\n1. Testing penalty routes accessibility...');
    
    try {
      const response = await fetch(`${API_BASE}/penalties/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Penalty routes response status:', response.status);
      
      if (response.status === 401) {
        console.log('✓ Penalty routes are protected (401 Unauthorized - expected)');
      } else if (response.status === 404) {
        console.log('✗ Penalty routes not found (404)');
      } else {
        console.log('Response status:', response.status);
      }
    } catch (error) {
      console.log('✗ Error accessing penalty routes:', error.message);
    }
    
    // Test 2: Check server health
    console.log('\n2. Testing server health...');
    try {
      const healthResponse = await fetch(`${API_BASE}/health`);
      const healthData = await healthResponse.json();
      console.log('✓ Server health:', healthData);
    } catch (error) {
      console.log('✗ Server health check failed:', error.message);
    }
    
    console.log('\nPenalty system test completed.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPenaltySystem();