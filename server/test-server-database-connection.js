const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testServerDatabaseConnection() {
  try {
    console.log('🧪 Testing Server Database Connection...');
    
    // Test 1: Try to get all users (this should work if the server is connected to the right database)
    console.log('1. Testing get all users endpoint...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users`);
      console.log('❌ Get all users should have failed (requires admin auth)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Get all users failed as expected (requires auth)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Try to register a new user and see if it appears in the database
    console.log('\n2. Testing user registration and verification...');
    
    const testEmail = `test.verification.${Date.now()}@example.com`;
    const registrationData = {
      firstName: 'Test',
      secondName: 'Verification',
      thirdName: 'User',
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
      console.log('✅ Registration successful');
      
      // Now try to login with the new user
      console.log('\n3. Testing login with newly registered user...');
      
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: testEmail,
        password: 'test123456'
      });
      
      console.log('✅ Login successful with newly registered user');
      console.log('User role:', loginResponse.data.user?.role);
      
      // Test course creation (should fail because user is not admin)
      console.log('\n4. Testing course creation with student user...');
      
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
        
        console.log('❌ Course creation should have failed but succeeded');
        
      } catch (error) {
        if (error.response?.status === 403) {
          console.log('✅ Course creation failed as expected (student not admin)');
        } else {
          console.log('❌ Unexpected error:', error.response?.data || error.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
    }
    
    // Test 3: Try to login with existing admin users
    console.log('\n5. Testing login with existing admin users...');
    
    const adminEmails = [
      'admin@example.com',
      'admin@test.com',
      'admin2@gmail.com'
    ];
    
    for (const email of adminEmails) {
      console.log(`\n🔍 Trying login with: ${email}`);
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          userEmail: email,
          password: 'admin123'
        });
        
        console.log('✅ Login successful with:', email);
        console.log('User role:', loginResponse.data.user?.role);
        
        // Test course creation with this admin
        console.log('\n6. Testing course creation with admin...');
        
        const courseData = {
          title: 'Test Course from Admin',
          subject: 'mathematics',
          grade: '7',
          price: 100,
          duration: 10,
          level: 'beginner',
          description: 'Test course created by admin'
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Course creation successful!');
        console.log('Course response:', createResponse.data);
        
        return; // Exit on first success
        
      } catch (error) {
        console.log('❌ Login failed with:', email);
        console.log('Error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServerDatabaseConnection();
