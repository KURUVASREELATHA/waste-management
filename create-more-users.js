// Create additional test users
const createUsers = async () => {
  const users = [
    {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      phone: '5555555555',
      address: '789 Admin Street',
      municipalId: 'MU01',
      workerId: 'A001'
    },
    {
      name: 'Green Recycling Center',
      email: 'recycler@test.com',
      password: 'password123',
      role: 'recycler',
      phone: '9999999999',
      address: '321 Recycling Ave',
      centerName: 'Green Recycling Center'
    }
  ];

  for (const user of users) {
    try {
      console.log(`\n🔄 Creating ${user.role}: ${user.email}`);
      
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${user.role} created successfully`);
      } else {
        console.log(`❌ Failed to create ${user.role}:`, data.message);
      }
    } catch (error) {
      console.error(`Error creating ${user.role}:`, error);
    }
  }

  console.log('\n📋 All test credentials:');
  console.log('Citizen: test@citizen.com / password123');
  console.log('Worker: worker@test.com / password123');
  console.log('Admin: admin@test.com / password123');
  console.log('Recycler: recycler@test.com / password123');
};

createUsers();