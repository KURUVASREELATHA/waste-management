// Test worker authentication
const testWorkerAuth = async () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('User:', user ? JSON.parse(user) : 'Missing');
  
  if (token) {
    try {
      const response = await fetch('http://localhost:3001/api/waste/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('Auth test result:', result);
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  }
};

// Run in browser console
testWorkerAuth();