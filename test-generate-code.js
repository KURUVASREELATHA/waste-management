// Test the generate code endpoint
import fetch from 'node-fetch';

async function testGenerateCode() {
  try {
    // First, let's test if the server is running
    const healthCheck = await fetch('http://localhost:3001/api/waste/debug/pending');
    console.log('Server health check:', healthCheck.status);
    
    // You'll need to replace this with an actual waste ID and auth token
    const wasteId = 'REPLACE_WITH_ACTUAL_WASTE_ID';
    const authToken = 'REPLACE_WITH_ACTUAL_TOKEN';
    
    const response = await fetch(`http://localhost:3001/api/waste/${wasteId}/generate-code`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const result = await response.json();
    console.log('Generate code response:', result);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGenerateCode();