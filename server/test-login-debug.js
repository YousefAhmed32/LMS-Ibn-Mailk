// Debug login issues
const axios = require('axios');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login issues...\n');

    // Test 1: Check server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running:', healthResponse.status);

    // Test 2: Test admin login
    console.log('\n2. Testing admin login...');
    try {
      const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        userEmail: 'admin@test.com',
        password: 'test123'
      });
      
      if (adminLoginResponse.data.success) {
        console.log('✅ Admin login successful');
        console.log('   Token:', adminLoginResponse.data.token ? 'Received' : 'Missing');
        console.log('   User:', adminLoginResponse.data.user ? 'Received' : 'Missing');
      } else {
        console.log('❌ Admin login failed:', adminLoginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Admin login error:', error.response?.data || error.message);
    }

    // Test 3: Test student login
    console.log('\n3. Testing student login...');
    try {
      const studentLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        userEmail: 'student@test.com',
        password: 'test123'
      });
      
      if (studentLoginResponse.data.success) {
        console.log('✅ Student login successful');
        console.log('   Token:', studentLoginResponse.data.token ? 'Received' : 'Missing');
        console.log('   User:', studentLoginResponse.data.user ? 'Received' : 'Missing');
      } else {
        console.log('❌ Student login failed:', studentLoginResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Student login error:', error.response?.data || error.message);
    }

    // Test 4: Test invalid credentials
    console.log('\n4. Testing invalid credentials...');
    try {
      const invalidLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        userEmail: 'invalid@test.com',
        password: 'wrongpassword'
      });
      
      console.log('❌ Invalid login should have failed but succeeded:', invalidLoginResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        console.log('❌ Unexpected error for invalid credentials:', error.response?.data || error.message);
      }
    }

    // Test 5: Test missing fields
    console.log('\n5. Testing missing fields...');
    try {
      const missingFieldsResponse = await axios.post('http://localhost:5000/api/auth/login', {
        userEmail: 'admin@test.com'
        // Missing password
      });
      
      console.log('❌ Missing password should have failed but succeeded:', missingFieldsResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Missing fields properly rejected');
      } else {
        console.log('❌ Unexpected error for missing fields:', error.response?.data || error.message);
      }
    }

    console.log('\n🎯 Login debugging completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugLogin();