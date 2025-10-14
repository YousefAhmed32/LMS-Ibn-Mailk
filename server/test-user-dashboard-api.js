// Test script for ModernDashboardUser API endpoints
// Run this with: node test-user-dashboard-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual JWT token

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testUserDashboardAPI() {
  console.log('🧪 Testing User Dashboard API Endpoints\n');

  try {
    // Test 1: Get user statistics
    console.log('1️⃣ Testing GET /api/user/:id/stats');
    const statsResponse = await axios.get(`${BASE_URL}/user/${TEST_USER_ID}/stats`, { headers });
    console.log('✅ Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Test 2: Get recent courses
    console.log('2️⃣ Testing GET /api/user/:id/courses/recent');
    const coursesResponse = await axios.get(`${BASE_URL}/user/${TEST_USER_ID}/courses/recent`, { headers });
    console.log('✅ Recent Courses Response:', JSON.stringify(coursesResponse.data, null, 2));
    console.log('');

    // Test 3: Get progress over time
    console.log('3️⃣ Testing GET /api/user/:id/progress-over-time');
    const progressResponse = await axios.get(`${BASE_URL}/user/${TEST_USER_ID}/progress-over-time`, { headers });
    console.log('✅ Progress Over Time Response:', JSON.stringify(progressResponse.data, null, 2));
    console.log('');

    // Test 4: Get score distribution
    console.log('4️⃣ Testing GET /api/user/:id/score-distribution');
    const scoreResponse = await axios.get(`${BASE_URL}/user/${TEST_USER_ID}/score-distribution`, { headers });
    console.log('✅ Score Distribution Response:', JSON.stringify(scoreResponse.data, null, 2));
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Example curl commands for testing
console.log(`
📋 Example cURL Commands:

# Get user statistics
curl -X GET "http://localhost:5000/api/user/${TEST_USER_ID}/stats" \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json"

# Get recent courses
curl -X GET "http://localhost:5000/api/user/${TEST_USER_ID}/courses/recent" \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json"

# Get progress over time
curl -X GET "http://localhost:5000/api/user/${TEST_USER_ID}/progress-over-time" \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json"

# Get score distribution
curl -X GET "http://localhost:5000/api/user/${TEST_USER_ID}/score-distribution" \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json"
`);

// Run tests if user ID and token are provided
if (TEST_USER_ID !== 'YOUR_USER_ID_HERE' && AUTH_TOKEN !== 'YOUR_JWT_TOKEN_HERE') {
  testUserDashboardAPI();
} else {
  console.log('⚠️  Please update TEST_USER_ID and AUTH_TOKEN variables before running tests');
}
