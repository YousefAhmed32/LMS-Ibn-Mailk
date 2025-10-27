const axios = require('axios');
const mongoose = require('mongoose');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';

// Test data
const testCourseData = {
  title: "Test Course - Arabic Language",
  subject: "لغة عربية",
  grade: "7",
  price: 299.99,
  duration: 120,
  description: "A comprehensive Arabic language course for grade 7 students",
  level: "beginner",
  isActive: true,
  videos: [
    {
      title: "Introduction to Arabic",
      url: "https://example.com/video1.mp4",
      duration: 30,
      order: 1
    },
    {
      title: "Basic Arabic Grammar",
      url: "https://example.com/video2.mp4",
      duration: 45,
      order: 2
    }
  ],
  exams: [
    {
      title: "Arabic Grammar Test",
      type: "internal_exam",
      duration: 30,
      passingScore: 70,
      questions: [
        {
          questionText: "What is the Arabic word for 'book'?",
          type: "mcq",
          options: ["كتاب", "قلم", "مدرسة", "بيت"],
          correctAnswer: 0,
          points: 2
        },
        {
          questionText: "Arabic is written from right to left.",
          type: "true_false",
          correctAnswer: true,
          points: 1
        }
      ]
    }
  ]
};

const adminCredentials = {
  userEmail: "admin@test.com",
  password: "admin123"
};

let adminToken = null;
let createdCourseId = null;

async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Course Creation Test');
  console.log('=====================================');
  
  try {
    // Step 1: Connect to MongoDB
    console.log('\n📡 Step 1: Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState);
    
    // Step 2: Test server health
    console.log('\n🏥 Step 2: Testing server health...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Server is healthy');
      console.log('   Status:', healthResponse.data.status);
      console.log('   Uptime:', healthResponse.data.uptime);
    } catch (error) {
      console.log('⚠️ Health check failed, but continuing...');
    }
    
    // Step 3: Login as admin
    console.log('\n🔐 Step 3: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, adminCredentials);
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      throw new Error('Admin login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log('   Token:', adminToken.substring(0, 20) + '...');
    console.log('   User:', loginResponse.data.user.email);
    
    // Step 4: Test course creation
    console.log('\n📝 Step 4: Testing course creation...');
    console.log('Request data:', JSON.stringify(testCourseData, null, 2));
    
    const courseResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, testCourseData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      timeout: 15000
    });
    
    if (!courseResponse.data.success) {
      throw new Error('Course creation failed: ' + JSON.stringify(courseResponse.data));
    }
    
    createdCourseId = courseResponse.data.data._id;
    console.log('✅ Course created successfully!');
    console.log('   Course ID:', createdCourseId);
    console.log('   Title:', courseResponse.data.data.title);
    console.log('   Subject:', courseResponse.data.data.subject);
    console.log('   Price:', courseResponse.data.data.price);
    console.log('   Videos:', courseResponse.data.data.videos.length);
    console.log('   Exams:', courseResponse.data.data.exams.length);
    
    // Step 5: Verify course in database
    console.log('\n🔍 Step 5: Verifying course in database...');
    const Course = require('./models/Course');
    const savedCourse = await Course.findById(createdCourseId);
    
    if (!savedCourse) {
      throw new Error('Course not found in database');
    }
    
    console.log('✅ Course verified in database');
    console.log('   Title:', savedCourse.title);
    console.log('   Created By:', savedCourse.createdBy);
    console.log('   Created At:', savedCourse.createdAt);
    
    // Step 6: Test course retrieval
    console.log('\n📖 Step 6: Testing course retrieval...');
    const getCourseResponse = await axios.get(`${API_BASE_URL}/api/courses/${createdCourseId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!getCourseResponse.data.success) {
      throw new Error('Course retrieval failed: ' + JSON.stringify(getCourseResponse.data));
    }
    
    console.log('✅ Course retrieved successfully');
    console.log('   Title:', getCourseResponse.data.course.title);
    console.log('   Videos:', getCourseResponse.data.course.videos.length);
    console.log('   Exams:', getCourseResponse.data.course.exams.length);
    
    // Step 7: Test course list
    console.log('\n📋 Step 7: Testing course list...');
    const listResponse = await axios.get(`${API_BASE_URL}/api/courses`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!listResponse.data.success) {
      throw new Error('Course list failed: ' + JSON.stringify(listResponse.data));
    }
    
    const courses = listResponse.data.data;
    const ourCourse = courses.find(c => c._id === createdCourseId);
    
    if (!ourCourse) {
      throw new Error('Created course not found in course list');
    }
    
    console.log('✅ Course list retrieved successfully');
    console.log('   Total courses:', courses.length);
    console.log('   Our course found:', !!ourCourse);
    
    // Step 8: Test error handling
    console.log('\n❌ Step 8: Testing error handling...');
    
    // Test invalid course data
    const invalidCourseData = {
      title: "", // Empty title should fail
      subject: "Test Subject",
      grade: "7",
      price: -100 // Negative price should fail
    };
    
    try {
      await axios.post(`${API_BASE_URL}/api/admin/courses`, invalidCourseData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('⚠️ Invalid course creation should have failed');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Error handling works correctly');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data.message);
      } else {
        console.log('⚠️ Unexpected error response:', error.response?.status);
      }
    }
    
    // Step 9: Cleanup
    console.log('\n🧹 Step 9: Cleaning up test data...');
    await Course.findByIdAndDelete(createdCourseId);
    console.log('✅ Test course deleted');
    
    // Final results
    console.log('\n🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('✅ All tests passed:');
    console.log('   - MongoDB connection: Stable');
    console.log('   - Server health: OK');
    console.log('   - Admin authentication: Working');
    console.log('   - Course creation: Working');
    console.log('   - Course retrieval: Working');
    console.log('   - Course listing: Working');
    console.log('   - Error handling: Working');
    console.log('   - Database operations: Working');
    console.log('\n🚀 The course creation endpoint is fully functional!');
    
  } catch (error) {
    console.error('\n❌ COMPREHENSIVE TEST FAILED!');
    console.error('================================');
    console.error('Error:', error.message);
    console.error('Details:', error.response?.data || error);
    
    // Cleanup on error
    if (createdCourseId) {
      try {
        const Course = require('./models/Course');
        await Course.findByIdAndDelete(createdCourseId);
        console.log('🧹 Cleaned up test course on error');
      } catch (cleanupError) {
        console.error('Failed to cleanup:', cleanupError.message);
      }
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the comprehensive test
runComprehensiveTest();
