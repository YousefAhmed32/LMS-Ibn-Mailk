const axios = require('axios');

async function testLoginDetailed() {
  try {
    console.log('🔍 Detailed Login Test');
    console.log('======================');
    
    const loginData = {
      userEmail: "admin@test.com",
      password: "admin123"
    };
    
    console.log('📤 Sending login request:');
    console.log('URL:', 'http://localhost:5000/api/auth/login');
    console.log('Data:', JSON.stringify(loginData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Server is not running!');
    }
  }
}

testLoginDetailed();
