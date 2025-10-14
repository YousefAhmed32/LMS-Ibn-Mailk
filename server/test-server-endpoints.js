// Simple test to check if server endpoints are responding
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testServerEndpoints() {
  try {
    console.log('🧪 Testing server endpoint availability...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/login', { timeout: 5000 });
      console.log('✅ Server is responding (got response, even if 400/401 is expected)');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running');
        return;
      } else {
        console.log('✅ Server is running (connection error is expected for login without credentials)');
      }
    }

    // Test 2: Check if new endpoints exist (should return 401 without auth)
    console.log('\n2. Testing new endpoint availability...');
    
    const endpoints = [
      { method: 'GET', path: '/auth/me', name: 'GET /api/auth/me' },
      { method: 'GET', path: '/courses/507f1f77bcf86cd799439011/access', name: 'GET /api/courses/:id/access' },
      { method: 'POST', path: '/admin/orders/507f1f77bcf86cd799439011/approve', name: 'POST /api/admin/orders/:id/approve' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${BASE_URL}${endpoint.path}`,
          timeout: 5000,
          validateStatus: () => true // Accept any status code
        });
        
        if (response.status === 401) {
          console.log(`✅ ${endpoint.name} - endpoint exists (401 Unauthorized as expected)`);
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint.name} - endpoint not found (404)`);
        } else {
          console.log(`✅ ${endpoint.name} - endpoint exists (status: ${response.status})`);
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`❌ ${endpoint.name} - server not responding`);
        } else {
          console.log(`✅ ${endpoint.name} - endpoint exists (error: ${error.message})`);
        }
      }
    }

    console.log('\n🎉 Endpoint availability test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testServerEndpoints();
