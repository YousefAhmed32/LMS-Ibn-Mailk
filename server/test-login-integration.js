// Test login integration and backend functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLoginIntegration() {
  try {
    console.log('🧪 Testing Login Integration...\n');

    // Test 1: Create a test user
    console.log('1. Creating test user...');
    const testUser = {
      firstName: 'Test',
      secondName: 'User',
      thirdName: 'Student',
      fourthName: 'LMS',
      userEmail: 'testuser@example.com',
      password: 'testpassword123',
      phoneStudent: '01234567890',
      governorate: 'Cairo',
      grade: '12'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      if (registerResponse.data.success) {
        console.log('✅ Test user created successfully');
      } else {
        console.log('ℹ️  Test user might already exist');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  Test user already exists, continuing...');
      } else {
        console.log('❌ Error creating test user:', error.response?.data?.error || error.message);
      }
    }

    // Test 2: Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: testUser.userEmail,
      password: testUser.password
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;
      
      console.log(`   User ID: ${user._id}`);
      console.log(`   User Role: ${user.role}`);
      console.log(`   Token: ${token.substring(0, 20)}...`);

      // Test 3: Test GET /api/auth/me
      console.log('\n3. Testing GET /api/auth/me...');
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (meResponse.data.success) {
        console.log('✅ GET /api/auth/me successful');
        console.log(`   User enrolledCourses: ${meResponse.data.user.enrolledCourses?.length || 0}`);
        console.log(`   User allowedCourses: ${meResponse.data.user.allowedCourses?.length || 0}`);
      } else {
        console.log('❌ GET /api/auth/me failed');
      }

      // Test 4: Test course access endpoint
      console.log('\n4. Testing course access endpoint...');
      try {
        const accessResponse = await axios.get(`${BASE_URL}/courses/507f1f77bcf86cd799439011/access`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (accessResponse.data.success) {
          console.log('✅ Course access endpoint working');
          console.log(`   Has access: ${accessResponse.data.access}`);
        } else {
          console.log('❌ Course access endpoint failed');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️  Course access endpoint working (404 for non-existent course)');
        } else {
          console.log('❌ Course access error:', error.response?.data?.error || error.message);
        }
      }

      // Test 5: Test courses endpoint
      console.log('\n5. Testing courses endpoint...');
      try {
        const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (coursesResponse.data.success) {
          console.log('✅ Courses endpoint working');
          console.log(`   Found ${coursesResponse.data.courses?.length || 0} courses`);
        } else {
          console.log('❌ Courses endpoint failed');
        }
      } catch (error) {
        console.log('❌ Courses error:', error.response?.data?.error || error.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.error);
    }

    console.log('\n🎉 Login integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testLoginIntegration();
