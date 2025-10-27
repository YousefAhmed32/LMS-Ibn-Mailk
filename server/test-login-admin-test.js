const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testLoginAdminTest() {
  try {
    console.log('🧪 Testing Login with admin@test.com...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      userEmail: 'admin@test.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    // Test course creation with this token
    console.log('\n🧪 Testing course creation...');
    const courseData = {
      title: 'Test Course from Script',
      subject: 'mathematics',
      grade: '7',
      price: 100,
      duration: 10,
      level: 'beginner',
      description: 'Test course created from script'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Course created successfully:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLoginAdminTest();
