const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🧪 Testing Login...');
    
    // Test login with admin credentials
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      userEmail: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();