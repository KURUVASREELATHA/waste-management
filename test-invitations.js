import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test invitation functionality
async function testInvitations() {
  try {
    console.log('Testing invitation endpoints...');
    
    // Test getting available centers
    console.log('\n1. Testing available centers endpoint...');
    const centersResponse = await fetch(`${API_BASE}/invitations/available-centers`);
    if (centersResponse.ok) {
      const centers = await centersResponse.json();
      console.log(`✓ Found ${centers.length} available recycling centers`);
      if (centers.length > 0) {
        console.log('Sample center:', centers[0].name);
      }
    } else {
      console.log('✗ Failed to fetch available centers:', centersResponse.status);
    }
    
    // Test getting sent invitations
    console.log('\n2. Testing sent invitations endpoint...');
    const invitationsResponse = await fetch(`${API_BASE}/invitations/sent`);
    if (invitationsResponse.ok) {
      const invitations = await invitationsResponse.json();
      console.log(`✓ Found ${invitations.length} sent invitations`);
      if (invitations.length > 0) {
        const invitation = invitations[0];
        console.log('Sample invitation:');
        console.log('- Status:', invitation.status);
        console.log('- Center:', invitation.recyclingCenterId?.name || invitation.recyclingCenterDetails?.name);
        console.log('- Message:', invitation.message);
      }
    } else {
      console.log('✗ Failed to fetch sent invitations:', invitationsResponse.status);
    }
    
    console.log('\nInvitation endpoints test completed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testInvitations();