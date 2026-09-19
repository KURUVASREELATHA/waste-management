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
    centerName: 'Green Recycling Center',
    wasteTypesProcessed: ['plastic', 'paper', 'metal']
  }
];

const createUser = async (user) => {
  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  console.log(`${user.role}: ${response.ok ? '✅' : '❌'} ${data.message || 'Success'}`);
};

users.forEach(createUser);