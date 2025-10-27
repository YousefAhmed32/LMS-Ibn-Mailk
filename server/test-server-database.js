const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testServerDatabase() {
  try {
    console.log('🧪 Testing Server Database...');
    
    // Test 1: Try to register a new user and see if it works
    console.log('1. Testing user registration...');
    
    const testEmail = `test.user.${Date.now()}@example.com`;
    const registrationData = {
      firstName: 'Test',
      secondName: 'User',
      thirdName: 'Registration',
      fourthName: 'Test',
      email: testEmail,
      password: 'test123456',
      role: 'student',
      phoneStudent: '+201234567890',
      guardianPhone: '+201234567891',
      governorate: 'Cairo',
      grade: 'أولى ثانوي'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, registrationData);
      console.log('✅ Registration successful:', registerResponse.data);
      
      // Now try to login with the new user
      console.log('\n2. Testing login with newly registered user...');
      
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: testEmail,
        password: 'test123456'
      });
      
      console.log('✅ Login successful:', loginResponse.data);
      
      // Test course creation with this user (should fail because they're not admin)
      console.log('\n3. Testing course creation with student user (should fail)...');
      
      try {
        const courseData = {
          title: 'Test Course from Student',
          subject: 'mathematics',
          grade: '7',
          price: 100,
          duration: 10,
          level: 'beginner',
          description: 'Test course created by student'
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('❌ Course creation should have failed but succeeded:', createResponse.data);
        
      } catch (error) {
        console.log('✅ Course creation failed as expected (student not admin):', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServerDatabase();
