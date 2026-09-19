// Debug login issues
const testLogin = async (email, password, role) => {
  try {
    console.log(`\n🔍 Testing login for ${role}: ${email}`);
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Test all roles
const runTests = async () => {
  await testLogin('test@citizen.com', 'password123', 'citizen');
  await testLogin('worker@test.com', 'password123', 'worker');
  await testLogin('admin@test.com', 'password123', 'admin');
  await testLogin('wrong@email.com', 'password123', 'citizen');
};

runTests();