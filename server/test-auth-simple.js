const axios = require('axios');

async function testAuthEndpoints() {
  console.log('🔐 Testing Authentication Endpoints');
  console.log('===================================');
  
  const API_BASE_URL = 'http://localhost:5000';
  
  // Test data
  const testUser = {
    firstName: "أحمد",
    secondName: "محمد", 
    thirdName: "علي",
    fourthName: "حسن",
    userEmail: "test.user.1234567890@example.com",
    password: "password123",
    phoneStudent: "01234567890",
    phoneFather: "01234567891",
    phoneMother: "01234567892",
    governorate: "Cairo",
    grade: "grade10",
    role: "student"
  };
  
  try {
    // Test 1: Server Health
    console.log('\n🏥 Testing server health...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is running');
      console.log('   Status:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server not responding');
      console.log('   Error:', error.message);
      return;
    }
    
    // Test 2: Registration
    console.log('\n📝 Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Registration successful');
      console.log('   Status:', registerResponse.status);
      console.log('   Success:', registerResponse.data.success);
      console.log('   Token:', registerResponse.data.token ? 'Present' : 'Missing');
      
    } catch (error) {
      console.log('❌ Registration failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 3: Login
    console.log('\n🔐 Testing user login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: testUser.userEmail,
        password: testUser.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Login successful');
      console.log('   Status:', loginResponse.status);
      console.log('   Success:', loginResponse.data.success);
      console.log('   Token:', loginResponse.data.token ? 'Present' : 'Missing');
      
    } catch (error) {
      console.log('❌ Login failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 4: Duplicate Registration
    console.log('\n🔄 Testing duplicate registration...');
    try {
      const duplicateResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('⚠️ Duplicate registration succeeded (should fail)');
      console.log('   Status:', duplicateResponse.status);
      
    } catch (error) {
      console.log('✅ Duplicate registration correctly rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuthEndpoints();
