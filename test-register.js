// Test registration to create a user
const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Citizen',
        email: 'test@citizen.com',
        password: 'password123',
        role: 'citizen',
        phone: '1234567890',
        address: '123 Test Street',
        municipalId: 'MU01',
        houseId: 'H001',
        upiId: 'test@upi'
      }),
    });

    const data = await response.json();
    console.log('Registration status:', response.status);
    console.log('Registration data:', data);

    if (response.ok) {
      console.log('\n✅ User created successfully! Now testing login...');
      
      // Test login
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@citizen.com',
          password: 'password123',
          role: 'citizen'
        }),
      });

      const loginData = await loginResponse.json();
      console.log('Login status:', loginResponse.status);
      console.log('Login data:', loginData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testRegister();