const axios = require('axios');

async function testFixedAuthEndpoints() {
  console.log('🔐 Testing Fixed Authentication Endpoints');
  console.log('========================================');
  
  const API_BASE_URL = 'http://localhost:5000';
  
  // Fixed test data with correct field names and values
  const testUser = {
    firstName: "أحمد",
    secondName: "محمد", 
    thirdName: "علي",
    fourthName: "حسن",
    email: "test.user.1234567890@example.com", // Changed from userEmail to email
    password: "password123",
    phoneStudent: "01234567890",
    guardianPhone: "01234567891", // Added missing guardianPhone field
    governorate: "Cairo",
    grade: "أولى إعدادي", // Changed to Arabic grade format
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
    
    // Test 2: Registration with Fixed Data
    console.log('\n📝 Testing user registration with fixed data...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Registration successful');
      console.log('   Status:', registerResponse.status);
      console.log('   Success:', registerResponse.data.success);
      console.log('   Token:', registerResponse.data.token ? 'Present' : 'Missing');
      console.log('   User ID:', registerResponse.data.user?._id);
      
    } catch (error) {
      console.log('❌ Registration failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
      
      if (error.response?.data?.details) {
        console.log('   Validation errors:');
        error.response.data.details.forEach(err => {
          console.log(`     - ${err.field}: ${err.message}`);
        });
      }
    }
    
    // Test 3: Login with userEmail field (as expected by login endpoint)
    console.log('\n🔐 Testing user login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: testUser.email, // Login expects userEmail field
        password: testUser.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Login successful');
      console.log('   Status:', loginResponse.status);
      console.log('   Success:', loginResponse.data.success);
      console.log('   Token:', loginResponse.data.token ? 'Present' : 'Missing');
      console.log('   User:', loginResponse.data.user?.email);
      
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
    
    // Test 5: Invalid Login (wrong password)
    console.log('\n❌ Testing invalid login (wrong password)...');
    try {
      const invalidLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: testUser.email,
        password: "wrongpassword"
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('⚠️ Invalid login succeeded (should fail)');
      console.log('   Status:', invalidLoginResponse.status);
      
    } catch (error) {
      console.log('✅ Invalid login correctly rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFixedAuthEndpoints();
