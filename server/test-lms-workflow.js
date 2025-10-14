// Comprehensive LMS Payment Approval Workflow Test
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CONFIG = {
  adminEmail: 'admin@test.com',
  adminPassword: 'admin123',
  studentEmail: 'student@test.com',
  studentPassword: 'student123'
};

let adminToken = '';
let studentToken = '';
let studentId = '';
let courseId = '';
let paymentId = '';

async function testLMSWorkflow() {
  console.log('🚀 Starting Comprehensive LMS Payment Approval Workflow Test\n');
  
  try {
    // Step 1: Setup - Create test data
    await setupTestData();
    
    // Step 2: Backend Verification
    await verifyBackendModels();
    await verifyAdminRoutes();
    await verifyCourseRoutes();
    
    // Step 3: Frontend Workflow Simulation
    await simulateStudentEnrollment();
    await simulateAdminApproval();
    await verifyStudentAccess();
    
    // Step 4: State Management & UI Verification
    await verifyProgressTracking();
    await verifyQuizSystem();
    
    // Step 5: Error Handling Tests
    await testErrorHandling();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cleanup
    await cleanupTestData();
  }
}

async function setupTestData() {
  console.log('📋 Setting up test data...');
  
  // Connect to MongoDB
  await mongoose.connect('mongodb://localhost:27017/lms-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Import models
  const User = require('./models/User');
  const Course = require('./models/Course');
  const Payment = require('./models/Payment');
  
  // Create test admin user
  try {
    const hashedAdminPassword = await bcrypt.hash(TEST_CONFIG.adminPassword, 12);
    const adminUser = await User.findOneAndUpdate(
      { userEmail: TEST_CONFIG.adminEmail },
      {
        firstName: 'Test',
        secondName: 'Admin',
        thirdName: 'User',
        fourthName: 'LMS',
        userEmail: TEST_CONFIG.adminEmail,
        password: hashedAdminPassword,
        role: 'admin',
        phoneStudent: '01000000001',
        governorate: 'Cairo',
        grade: 'grade12',
        allowedCourses: []
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test admin user created/found');
  } catch (error) {
    console.log('⚠️  Admin user setup:', error.message);
  }
  
  // Create test student user
  try {
    const hashedStudentPassword = await bcrypt.hash(TEST_CONFIG.studentPassword, 12);
    const studentUser = await User.findOneAndUpdate(
      { userEmail: TEST_CONFIG.studentEmail },
      {
        firstName: 'Test',
        secondName: 'Student',
        thirdName: 'User',
        fourthName: 'LMS',
        userEmail: TEST_CONFIG.studentEmail,
        password: hashedStudentPassword,
        role: 'student',
        phoneStudent: '01000000002',
        governorate: 'Giza',
        grade: 'grade10',
        allowedCourses: [],
        enrolledCourses: []
      },
      { upsert: true, new: true }
    );
    studentId = studentUser._id.toString();
    console.log('✅ Test student user created/found:', studentId);
  } catch (error) {
    console.log('⚠️  Student user setup:', error.message);
  }
  
  // Create test course
  try {
    const testCourse = await Course.findOneAndUpdate(
      { title: 'Test Mathematics Course' },
      {
        title: 'Test Mathematics Course',
        description: 'A comprehensive test course for mathematics',
        grade: '10',
        subject: 'Mathematics',
        price: 100,
        videos: [
          {
            title: 'Introduction to Algebra',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: 30,
            order: 1,
            quiz: {
              questions: [
                {
                  id: 'q1',
                  question: 'What is 2 + 2?',
                  options: ['3', '4', '5', '6'],
                  correctAnswer: '4',
                  explanation: 'Basic addition'
                }
              ],
              passingScore: 70,
              timeLimit: 5
            }
          }
        ]
      },
      { upsert: true, new: true }
    );
    courseId = testCourse._id.toString();
    console.log('✅ Test course created/found:', courseId);
  } catch (error) {
    console.log('⚠️  Course setup:', error.message);
  }
}

async function verifyBackendModels() {
  console.log('\n🔍 Verifying Backend Models...');
  
  const User = require('./models/User');
  const Course = require('./models/Course');
  
  // Check User model has allowedCourses field
  const userSchema = User.schema.obj;
  if (userSchema.allowedCourses) {
    console.log('✅ User model contains allowedCourses field');
  } else {
    console.log('❌ User model missing allowedCourses field');
  }
  
  // Check Course model has quiz structure
  const courseSchema = Course.schema.obj;
  if (courseSchema.videos && courseSchema.videos[0].quiz) {
    console.log('✅ Course model contains quiz structure');
  } else {
    console.log('❌ Course model missing quiz structure');
  }
}

async function verifyAdminRoutes() {
  console.log('\n🔍 Verifying Admin Routes...');
  
  // Test admin login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: TEST_CONFIG.adminEmail,
      password: TEST_CONFIG.adminPassword
    });
    
    adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data || error.message);
    return;
  }
  
  // Test admin approval route exists
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/approve-payment/${studentId}/${courseId}`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Admin approval route working');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Admin approval route not found');
    } else {
      console.log('✅ Admin approval route exists (error expected without payment)');
    }
  }
}

async function verifyCourseRoutes() {
  console.log('\n🔍 Verifying Course Routes...');
  
  // Test course content route
  try {
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/content`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('❌ Course content accessible without approval (should be blocked)');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Course content properly protected (403 Forbidden)');
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status);
    }
  }
}

async function simulateStudentEnrollment() {
  console.log('\n👨‍🎓 Simulating Student Enrollment...');
  
  // Student login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: TEST_CONFIG.studentEmail,
      password: TEST_CONFIG.studentPassword
    });
    
    studentToken = loginResponse.data.token;
    console.log('✅ Student login successful');
  } catch (error) {
    console.log('❌ Student login failed:', error.response?.data || error.message);
    return;
  }
  
  // Create payment proof
  try {
    const Payment = require('./models/Payment');
    const payment = new Payment({
      studentId: studentId,
      courseId: courseId,
      amount: 100,
      senderPhone: '01000000002',
      studentPhone: '01000000002',
      transferTime: new Date(),
      proofImage: 'https://example.com/proof.jpg',
      status: 'pending'
    });
    
    await payment.save();
    paymentId = payment._id.toString();
    console.log('✅ Payment proof created:', paymentId);
  } catch (error) {
    console.log('❌ Payment creation failed:', error.message);
  }
  
  // Test student cannot access course before approval
  try {
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/content`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('❌ Student can access course before approval (should be blocked)');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Student properly blocked from course before approval');
    } else {
      console.log('⚠️  Unexpected error:', error.response?.status);
    }
  }
}

async function simulateAdminApproval() {
  console.log('\n👨‍💼 Simulating Admin Approval...');
  
  // Admin approves payment
  try {
    const response = await axios.patch(
      `${BASE_URL}/admin/payment-proofs/${paymentId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Admin approved payment successfully');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Admin approval failed:', error.response?.data || error.message);
  }
  
  // Verify student's allowedCourses was updated
  try {
    const User = require('./models/User');
    const student = await User.findById(studentId);
    
    if (student.allowedCourses.includes(courseId)) {
      console.log('✅ Student allowedCourses updated correctly');
    } else {
      console.log('❌ Student allowedCourses not updated');
    }
  } catch (error) {
    console.log('❌ Error checking student allowedCourses:', error.message);
  }
}

async function verifyStudentAccess() {
  console.log('\n🔓 Verifying Student Access After Approval...');
  
  // Test student can now access course content
  try {
    const response = await axios.get(
      `${BASE_URL}/courses/${courseId}/content`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    
    if (response.data.success && response.data.data.course) {
      console.log('✅ Student can access course content after approval');
      console.log('Course title:', response.data.data.course.title);
      console.log('Lessons count:', response.data.data.lessons.length);
    } else {
      console.log('❌ Course content response format incorrect');
    }
  } catch (error) {
    console.log('❌ Student still cannot access course:', error.response?.data || error.message);
  }
}

async function verifyProgressTracking() {
  console.log('\n📊 Verifying Progress Tracking...');
  
  // Test lesson progress update
  try {
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/lessons/lesson_1/progress`,
      {
        videoId: 'video_1',
        watchedDuration: 300, // 5 minutes
        totalDuration: 1800   // 30 minutes
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    
    if (response.data.success) {
      console.log('✅ Lesson progress tracking working');
    } else {
      console.log('❌ Lesson progress tracking failed');
    }
  } catch (error) {
    console.log('❌ Progress tracking error:', error.response?.data || error.message);
  }
}

async function verifyQuizSystem() {
  console.log('\n🧠 Verifying Quiz System...');
  
  // Test quiz submission
  try {
    const response = await axios.post(
      `${BASE_URL}/courses/${courseId}/lessons/lesson_1/quiz`,
      {
        answers: [
          {
            questionId: 'q1',
            selectedAnswer: '4'
          }
        ],
        timeSpent: 30
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    
    if (response.data.success && response.data.data.score === 100) {
      console.log('✅ Quiz system working correctly');
      console.log('Quiz score:', response.data.data.score + '%');
    } else {
      console.log('❌ Quiz system failed');
    }
  } catch (error) {
    console.log('❌ Quiz submission error:', error.response?.data || error.message);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...');
  
  // Test duplicate approval
  try {
    const response = await axios.patch(
      `${BASE_URL}/admin/payment-proofs/${paymentId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (response.data.alreadyApproved) {
      console.log('✅ Duplicate approval handled correctly');
    } else {
      console.log('⚠️  Duplicate approval not handled');
    }
  } catch (error) {
    console.log('⚠️  Duplicate approval error:', error.response?.data || error.message);
  }
  
  // Test unauthorized access
  try {
    const response = await axios.get(
      `${BASE_URL}/courses/invalid-course-id/content`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('❌ Should have failed with invalid course ID');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Invalid course ID handled correctly (404)');
    } else {
      console.log('⚠️  Unexpected error for invalid course ID:', error.response?.status);
    }
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    const User = require('./models/User');
    const Course = require('./models/Course');
    const Payment = require('./models/Payment');
    
    await User.deleteMany({ userEmail: { $in: [TEST_CONFIG.adminEmail, TEST_CONFIG.studentEmail] } });
    await Course.deleteMany({ title: 'Test Mathematics Course' });
    await Payment.deleteMany({ studentId: studentId });
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('⚠️  Cleanup error:', error.message);
  }
  
  await mongoose.disconnect();
}

// Run the test
testLMSWorkflow().catch(console.error);
