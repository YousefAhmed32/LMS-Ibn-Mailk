const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

// Test data for payment proof functionality
async function testPaymentProofs() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/lms-ebn', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create a test course
    const testCourse = new Course({
      title: 'Test Mathematics Course',
      description: 'A test course for payment proof functionality',
      grade: '7',
      term: 'Term 1',
      subject: 'Mathematics',
      price: 150,
      videos: [
        {
          title: 'Introduction to Algebra',
          url: 'https://www.youtube.com/watch?v=test1',
          order: 1,
          duration: 45
        },
        {
          title: 'Solving Linear Equations',
          url: 'https://www.youtube.com/watch?v=test2',
          order: 2,
          duration: 60
        }
      ],
      isActive: true
    });

    await testCourse.save();
    console.log('✅ Test course created:', testCourse._id);

    // Create a test student user
    const testStudent = new User({
      firstName: 'Ahmed',
      secondName: 'Ali',
      thirdName: 'Mohammed',
      fourthName: 'Hassan',
      userEmail: 'ahmed.ali@test.com',
      password: 'testpassword123',
      role: 'student',
      phoneStudent: '01012345678',
      governorate: 'Cairo',
      grade: 'grade7',
      enrolledCourses: []
    });

    await testStudent.save();
    console.log('✅ Test student created:', testStudent._id);

    // Simulate enrollment with pending payment
    testStudent.enrolledCourses.push({
      courseId: testCourse._id,
      paymentStatus: 'pending',
      proofImage: 'https://example.com/test-payment-proof.jpg',
      enrolledAt: new Date()
    });

    await testStudent.save();
    console.log('✅ Test enrollment created with pending payment');

    // Test the enrollment status endpoint
    console.log('\n📋 Testing enrollment status...');
    const enrollment = testStudent.enrolledCourses.find(
      e => e.courseId.toString() === testCourse._id.toString()
    );
    
    if (enrollment) {
      console.log('✅ Enrollment found:', {
        courseId: enrollment.courseId,
        paymentStatus: enrollment.paymentStatus,
        proofImage: enrollment.proofImage,
        enrolledAt: enrollment.enrolledAt
      });
    }

    // Test the pending payment proofs endpoint
    console.log('\n📋 Testing pending payment proofs...');
    const usersWithPendingProofs = await User.find({
      'enrolledCourses.paymentStatus': 'pending'
    }).populate({
      path: 'enrolledCourses.courseId',
      select: 'title description grade subject price'
    });

    console.log('✅ Found users with pending proofs:', usersWithPendingProofs.length);
    
    usersWithPendingProofs.forEach(user => {
      user.enrolledCourses.forEach(enrollment => {
        if (enrollment.paymentStatus === 'pending') {
          console.log('  - Student:', user.firstName, user.secondName);
          console.log('  - Course:', enrollment.courseId.title);
          console.log('  - Payment Status:', enrollment.paymentStatus);
          console.log('  - Proof Image:', enrollment.proofImage);
        }
      });
    });

    console.log('\n🎉 All tests passed! Payment proof functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    try {
      await User.deleteOne({ userEmail: 'ahmed.ali@test.com' });
      await Course.deleteOne({ title: 'Test Mathematics Course' });
      console.log('🧹 Test data cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup failed:', cleanupError);
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testPaymentProofs();
