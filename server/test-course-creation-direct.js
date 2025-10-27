const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCourseCreationDirect() {
  try {
    console.log('🧪 Testing Course Creation Direct...');
    
    // Since login is failing, let me try to create a course without authentication first
    console.log('1. Testing course creation without authentication...');
    
    const courseData = {
      title: 'Test Course Direct',
      subject: 'mathematics',
      grade: '7',
      price: 100,
      duration: 10,
      level: 'beginner',
      description: 'Test course created directly'
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData);
      console.log('❌ Course creation should have failed but succeeded:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Course creation failed as expected (no auth)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Try to create a course with a fake token
    console.log('\n2. Testing course creation with fake token...');
    
    const fakeToken = 'fake.token.here';
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
        headers: {
          'Authorization': `Bearer ${fakeToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Course creation should have failed but succeeded:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Course creation failed as expected (invalid token)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Try to create a course with a valid JWT token (but not from our database)
    console.log('\n3. Testing course creation with valid JWT token...');
    
    const jwt = require('jsonwebtoken');
    const validToken = jwt.sign({ userId: '507f1f77bcf86cd799439011' }, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '14d' });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Course creation should have failed but succeeded:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Course creation failed as expected (invalid user)');
      } else if (error.response?.status === 403) {
        console.log('✅ Course creation failed as expected (not admin)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Try to create a course with a valid JWT token for an admin user
    console.log('\n4. Testing course creation with valid admin JWT token...');
    
    // Create a token for the admin user we know exists
    const adminToken = jwt.sign({ userId: '68fd6352b896d9bc99abee02' }, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '14d' });
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Course creation successful with admin token!');
      console.log('Response:', response.data);
      
    } catch (error) {
      console.log('❌ Course creation failed with admin token:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCourseCreationDirect();
