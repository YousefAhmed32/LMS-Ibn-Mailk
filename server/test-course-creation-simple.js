const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';

// Test data that matches the frontend request
const testCourseData = {
  title: "ffff",
  subject: "لغة عربية",
  grade: "7",
  price: 499.98,
  duration: 0,
  description: "",
  level: "beginner",
  isActive: true,
  videos: [],
  exams: []
};

// Admin credentials for testing
const adminCredentials = {
  userEmail: "admin@test.com",
  password: "admin123"
};

async function testCourseCreation() {
  try {
    console.log('🔍 Testing Course Creation Endpoint');
    console.log('==================================');
    
    // Step 1: Login as admin
    console.log('\n🔐 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, adminCredentials);
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      console.error('❌ Admin login failed:', loginResponse.data);
      return;
    }
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${adminToken.substring(0, 20)}...`);
    
    // Step 2: Test course creation
    console.log('\n📝 Step 2: Testing course creation...');
    console.log('Request data:', JSON.stringify(testCourseData, null, 2));
    
    const courseResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, testCourseData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      timeout: 10000
    });
    
    console.log('✅ Course creation successful!');
    console.log('Response status:', courseResponse.status);
    console.log('Response data:', JSON.stringify(courseResponse.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Course creation failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    if (error.response?.data) {
      console.error('\n🔍 Detailed error analysis:');
      console.error('Success:', error.response.data.success);
      console.error('Message:', error.response.data.message);
      console.error('Error type:', error.response.data.errorType);
      console.error('Full error:', error.response.data.error);
      
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
    
    // Additional debugging
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🚨 Connection refused - Server might not be running');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🚨 Host not found - Check API_BASE_URL');
    } else if (error.response?.status === 500) {
      console.error('\n🚨 500 Internal Server Error - Check server logs');
    }
  }
}

// Run the test
testCourseCreation();
