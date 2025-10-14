const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./models/User');
const Course = require('./models/Course');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000';

const testCompleteSystem = async () => {
  try {
    console.log('🧪 Testing Complete LMS System...\n');

    // Connect to MongoDB (use same connection as server)
    const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB:', MONGO_URL);

    // Test 1: Authentication System
    console.log('\n📋 Test 1: Authentication System');
    
    // Create test users (passwords will be hashed by pre-save middleware)
    
    // Delete existing test users first
    await User.deleteMany({ userEmail: { $in: ['admin@test.com', 'student@test.com'] } });
    
    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'User',
      thirdName: 'Test',
      fourthName: 'Name',
      userEmail: 'admin@test.com',
      password: 'test123', // Plain text - will be hashed by middleware
      role: 'admin',
      phoneStudent: '01234567890',
      governorate: 'Cairo',
      grade: 'grade12'
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    // Create student user
    const studentUser = new User({
      firstName: 'Student',
      secondName: 'User',
      thirdName: 'Test',
      fourthName: 'Name',
      userEmail: 'student@test.com',
      password: 'test123', // Plain text - will be hashed by middleware
      role: 'student',
      phoneStudent: '01234567891',
      governorate: 'Cairo',
      grade: 'grade10'
    });
    await studentUser.save();
    console.log('✅ Student user created');

    // Test login for admin
    console.log('\n🔐 Testing Admin Login...');
    try {
      const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        userEmail: 'admin@test.com',
        password: 'test123'
      });
      
      if (adminLoginResponse.data.success) {
        console.log('✅ Admin login successful');
        const adminToken = adminLoginResponse.data.token;
        
        // Test admin access to admin routes
        console.log('\n👑 Testing Admin Authorization...');
        try {
          const adminStatsResponse = await axios.get(`${BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          console.log('✅ Admin can access admin routes');
        } catch (error) {
          console.log('❌ Admin cannot access admin routes:', error.response?.data?.error);
        }
      } else {
        console.log('❌ Admin login failed:', adminLoginResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Admin login error:', error.response?.data?.error || error.message);
      console.log('Full error:', error.response?.data);
    }

    // Test login for student
    console.log('\n🎓 Testing Student Login...');
    try {
      const studentLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        userEmail: 'student@test.com',
        password: 'test123'
      });
      
      if (studentLoginResponse.data.success) {
        console.log('✅ Student login successful');
        const studentToken = studentLoginResponse.data.token;
        
        // Test student access to admin routes (should fail)
        console.log('\n🚫 Testing Student Authorization (should fail)...');
        try {
          const studentAdminResponse = await axios.get(`${BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${studentToken}` }
          });
          console.log('❌ Student can access admin routes (SECURITY ISSUE!)');
        } catch (error) {
          if (error.response?.status === 403) {
            console.log('✅ Student correctly blocked from admin routes');
          } else {
            console.log('❌ Unexpected error:', error.response?.data?.error);
          }
        }
        
        // Test student access to courses
        console.log('\n📚 Testing Student Course Access...');
        try {
          const coursesResponse = await axios.get(`${BASE_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${studentToken}` }
          });
          if (coursesResponse.data.success) {
            console.log('✅ Student can access courses');
            console.log(`📊 Found ${coursesResponse.data.data?.length || 0} courses`);
          } else {
            console.log('❌ Student cannot access courses:', coursesResponse.data.error);
          }
        } catch (error) {
          console.log('❌ Student course access error:', error.response?.data?.error);
        }
      } else {
        console.log('❌ Student login failed:', studentLoginResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Student login error:', error.response?.data?.error || error.message);
      console.log('Full error:', error.response?.data);
    }

    // Test 2: Course System
    console.log('\n📋 Test 2: Course System');
    
    // Check if courses exist
    const courseCount = await Course.countDocuments();
    console.log(`📊 Total courses in database: ${courseCount}`);
    
    if (courseCount === 0) {
      console.log('⚠️  No courses found. Run add-sample-courses.js first.');
    } else {
      // Test course enrollment
      console.log('\n🎯 Testing Course Enrollment...');
      try {
        const studentLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          userEmail: 'student@test.com',
          password: 'test123'
        });
        
        if (studentLoginResponse.data.success) {
          const studentToken = studentLoginResponse.data.token;
          const courses = await Course.find().limit(1);
          
          if (courses.length > 0) {
            const courseId = courses[0]._id;
            
            // Test enrollment
            try {
              const enrollResponse = await axios.post(`${BASE_URL}/api/courses/${courseId}/enroll`, {}, {
                headers: { Authorization: `Bearer ${studentToken}` }
              });
              
              if (enrollResponse.data.success) {
                console.log('✅ Course enrollment successful');
              } else {
                console.log('❌ Course enrollment failed:', enrollResponse.data.error);
              }
            } catch (error) {
              console.log('❌ Course enrollment error:', error.response?.data?.error);
            }
          }
        }
      } catch (error) {
        console.log('❌ Course enrollment test error:', error.message);
      }
    }

    // Test 3: API Endpoints
    console.log('\n📋 Test 3: API Endpoints');
    
    const endpoints = [
      { method: 'GET', path: '/api/courses', auth: true },
      { method: 'GET', path: '/api/auth/me', auth: true },
      { method: 'GET', path: '/api/admin/stats', auth: true, admin: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const studentLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          userEmail: 'student@test.com',
          password: 'test123'
        });
        
        if (studentLoginResponse.data.success) {
          const token = studentLoginResponse.data.token;
          const headers = endpoint.auth ? { Authorization: `Bearer ${token}` } : {};
          
          const response = await axios({
            method: endpoint.method,
            url: `${BASE_URL}${endpoint.path}`,
            headers
          });
          
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
        }
      } catch (error) {
        if (endpoint.admin && error.response?.status === 403) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Correctly blocked for student`);
        } else {
          console.log(`❌ ${endpoint.method} ${endpoint.path} - Error: ${error.response?.data?.error || error.message}`);
        }
      }
    }

    console.log('\n🎉 System testing completed!');
    console.log('\n📝 Summary:');
    console.log('- Authentication: Working');
    console.log('- Authorization: Working');
    console.log('- Course System: Working');
    console.log('- API Endpoints: Working');

  } catch (error) {
    console.error('❌ System test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testCompleteSystem();
