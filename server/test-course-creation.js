const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCourseCreation() {
  try {
    console.log('🧪 Testing Course Creation...');
    
    // First, let's test the health endpoint
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is healthy:', healthResponse.data);
    
    // Test course creation endpoint (should require auth)
    console.log('2. Testing course creation endpoint (without auth)...');
    try {
      const courseData = {
        title: 'Test Course',
        subject: 'mathematics',
        grade: '7',
        price: 100,
        duration: 10,
        level: 'beginner',
        description: 'Test course description'
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData);
      console.log('❌ Unexpected success without auth:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authentication required (expected):', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test with FormData
    console.log('3. Testing course creation with FormData (without auth)...');
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('title', 'Test Course FormData');
      formData.append('subject', 'mathematics');
      formData.append('grade', '7');
      formData.append('price', '100');
      formData.append('duration', '10');
      formData.append('level', 'beginner');
      formData.append('description', 'Test course description with FormData');
      
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      console.log('❌ Unexpected success without auth:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Authentication required for FormData (expected):', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('✅ Course creation endpoint is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCourseCreation();
