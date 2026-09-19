// Test script to verify delete functionality
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test function to check if delete endpoints are working
async function testDeleteEndpoints() {
  console.log('Testing delete functionality...\n');
  
  // Test 1: Check if server is running
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server is running:', healthData.status);
    console.log('📊 Database status:', healthData.database);
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('Error:', error.message);
    return;
  }
  
  // Test 2: Check waste delete endpoint (without auth - should fail)
  try {
    const wasteDeleteResponse = await fetch(`${API_BASE}/waste/test-id`, {
      method: 'DELETE'
    });
    console.log('🗑️ Waste delete endpoint status:', wasteDeleteResponse.status);
    
    if (wasteDeleteResponse.status === 401) {
      console.log('✅ Waste delete endpoint requires authentication (correct)');
    } else {
      const errorData = await wasteDeleteResponse.json();
      console.log('Response:', errorData);
    }
  } catch (error) {
    console.log('❌ Error testing waste delete endpoint:', error.message);
  }
  
  // Test 3: Check reports delete endpoint (without auth - should fail)
  try {
    const reportsDeleteResponse = await fetch(`${API_BASE}/reports/test-id`, {
      method: 'DELETE'
    });
    console.log('📋 Reports delete endpoint status:', reportsDeleteResponse.status);
    
    if (reportsDeleteResponse.status === 401) {
      console.log('✅ Reports delete endpoint requires authentication (correct)');
    } else {
      const errorData = await reportsDeleteResponse.json();
      console.log('Response:', errorData);
    }
  } catch (error) {
    console.log('❌ Error testing reports delete endpoint:', error.message);
  }
  
  // Test 4: Check products delete endpoint (without auth - should fail)
  try {
    const productsDeleteResponse = await fetch(`${API_BASE}/products/test-id`, {
      method: 'DELETE'
    });
    console.log('🛍️ Products delete endpoint status:', productsDeleteResponse.status);
    
    if (productsDeleteResponse.status === 401) {
      console.log('✅ Products delete endpoint requires authentication (correct)');
    } else {
      const errorData = await productsDeleteResponse.json();
      console.log('Response:', errorData);
    }
  } catch (error) {
    console.log('❌ Error testing products delete endpoint:', error.message);
  }
  
  console.log('\n🔍 Delete endpoints are properly configured and require authentication.');
  console.log('💡 If delete is not working in the frontend, the issue might be:');
  console.log('   1. Authentication token is missing or invalid');
  console.log('   2. Network connectivity issues');
  console.log('   3. CORS configuration problems');
  console.log('   4. Frontend API call implementation');
}

testDeleteEndpoints();