// Simple login test to identify issues
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSimpleLogin() {
  try {
    console.log('🧪 Testing Simple Login...\n');

    // Test 1: Test server health
    console.log('1. Testing server health...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/login', { timeout: 5000 });
      console.log('❌ Server should return 400/401 for GET request');
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 401) {
        console.log('✅ Server is responding correctly');
      } else {
        console.log('❌ Server error:', error.message);
        return;
      }
    }

    // Test 2: Test login with invalid credentials
    console.log('\n2. Testing login with invalid credentials...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        userEmail: 'invalid@test.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        console.log('✅ Login correctly rejects invalid credentials');
        console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test login with missing fields
    console.log('\n3. Testing login with missing fields...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        userEmail: 'test@test.com'
        // Missing password
      });
      console.log('❌ Should have failed with missing password');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Login correctly rejects missing fields');
        console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 4: Test login with wrong field name
    console.log('\n4. Testing login with wrong field name (email instead of userEmail)...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'testpassword'
      });
      console.log('❌ Should have failed with wrong field name');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Login correctly rejects wrong field name');
        console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Simple login test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testSimpleLogin();
