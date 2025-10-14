const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@test.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
};

testLogin();
