// Migration script to fix existing enrollments
// This script ensures all approved payments have corresponding enrollments

const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

async function fixEnrollments() {
  try {
    console.log('🔄 Starting enrollment fix migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Find all approved payments
    const approvedPayments = await Payment.find({ status: 'approved' })
      .populate('studentId', 'enrolledCourses allowedCourses')
      .populate('courseId', 'title students');

    console.log(`📊 Found ${approvedPayments.length} approved payments`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const payment of approvedPayments) {
      if (!payment.studentId || !payment.courseId) {
        console.log(`⚠️  Skipping payment ${payment._id} - missing student or course`);
        skippedCount++;
        continue;
      }

      const user = payment.studentId;
      const course = payment.courseId;
      let needsUpdate = false;

      // Check if course is in user's enrolledCourses
      const existingEnrollment = user.enrolledCourses.find(
        enrollment => enrollment.courseId.toString() === course._id.toString()
      );

      if (!existingEnrollment) {
        // Add enrollment
        user.enrolledCourses.push({
          courseId: course._id,
          enrolledAt: payment.confirmedAt || new Date(),
          paymentStatus: "approved",
          paymentApprovedAt: payment.confirmedAt || new Date(),
          proofImage: payment.proofImage
        });
        needsUpdate = true;
        console.log(`➕ Added enrollment for user ${user._id} to course ${course.title}`);
      } else if (existingEnrollment.paymentStatus !== 'approved') {
        // Update existing enrollment
        existingEnrollment.paymentStatus = "approved";
        existingEnrollment.paymentApprovedAt = payment.confirmedAt || new Date();
        existingEnrollment.proofImage = payment.proofImage;
        needsUpdate = true;
        console.log(`🔄 Updated enrollment for user ${user._id} to course ${course.title}`);
      }

      // Check if course is in user's allowedCourses
      if (!user.allowedCourses || !user.allowedCourses.includes(course._id)) {
        if (!user.allowedCourses) {
          user.allowedCourses = [];
        }
        user.allowedCourses.push(course._id);
        needsUpdate = true;
        console.log(`🔓 Added course to allowedCourses for user ${user._id}`);
      }

      // Check if user is in course's students
      if (!course.students || !course.students.includes(user._id)) {
        if (!course.students) {
          course.students = [];
        }
        course.students.push(user._id);
        await course.save();
        console.log(`👥 Added user to course students for course ${course.title}`);
      }

      if (needsUpdate) {
        await user.save();
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} enrollments`);
    console.log(`   ⏭️  Skipped: ${skippedCount} (already correct)`);
    console.log(`   📊 Total processed: ${approvedPayments.length}`);

    console.log('\n✅ Enrollment fix migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  fixEnrollments();
}

module.exports = fixEnrollments;
