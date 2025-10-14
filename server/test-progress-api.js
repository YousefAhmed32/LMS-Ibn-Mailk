/**
 * Test script to verify the new progress API endpoints
 */

const axios = require('axios');

async function testProgressAPI() {
  const BASE_URL = 'http://localhost:5000';
  
  console.log('🧪 Testing Progress API Endpoints...\n');
  
  try {
    // Test the new user-progress endpoint
    console.log('📊 Testing GET /api/user-progress/course/:courseId (without auth)');
    
    const response = await axios.get(`${BASE_URL}/api/user-progress/course/test-course-id`, {
      timeout: 5000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n✅ This is expected - authentication required');
      console.log('The new endpoint is working correctly and requires authentication.');
    } else if (error.response?.status === 500) {
      console.log('\n❌ This indicates a server error.');
      console.log('Check the server logs for more details.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ Connection refused - server might not be running');
    } else {
      console.log('\n❌ Unexpected error:', error.message);
    }
  }

  try {
    // Test the old progress endpoint for comparison
    console.log('\n📊 Testing GET /api/progress/course/:courseId/:studentId (without auth)');
    
    const response = await axios.get(`${BASE_URL}/api/progress/course/test-course-id/test-student-id`, {
      timeout: 5000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n✅ This is expected - authentication required');
      console.log('The old endpoint is still working correctly.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ Connection refused - server might not be running');
    } else {
      console.log('\n❌ Unexpected error:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testProgressAPI().catch(console.error);
}

module.exports = { testProgressAPI };
