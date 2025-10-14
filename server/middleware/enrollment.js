const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

/**
 * Middleware to check if user is enrolled in a course with approved payment
 * This middleware should be used for course content access
 */
const checkEnrollment = async (req, res, next) => {
  try {
    console.log('🔐 Enrollment Middleware: Starting validation...');
    
    // Step 1: Validate courseId parameter
    const { id: courseId } = req.params;
    if (!courseId) {
      console.error('❌ Enrollment Middleware: Missing courseId parameter');
      return res.status(400).json({
        success: false,
        error: "Course ID is required",
        code: 'MISSING_COURSE_ID'
      });
    }

    // Step 2: Validate user from auth middleware
    if (!req.user) {
      console.error('❌ Enrollment Middleware: No user found in request');
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        code: 'NO_USER'
      });
    }

    const userId = req.user._id;
    if (!userId) {
      console.error('❌ Enrollment Middleware: No user ID found');
      return res.status(401).json({
        success: false,
        error: "Invalid user authentication",
        code: 'INVALID_USER_ID'
      });
    }

    console.log('🔍 Enrollment Middleware: Validating parameters:', {
      courseId: courseId,
      userId: userId.toString()
    });

    // Step 3: Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error('❌ Enrollment Middleware: Invalid courseId format:', courseId);
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format",
        code: 'INVALID_COURSE_ID_FORMAT'
      });
    }

    // Step 4: Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Enrollment Middleware: Invalid userId format:', userId);
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format",
        code: 'INVALID_USER_ID_FORMAT'
      });
    }

    // Step 5: Check if course exists
    console.log('🔍 Enrollment Middleware: Checking if course exists...');
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('❌ Enrollment Middleware: Course not found:', courseId);
      return res.status(404).json({
        success: false,
        error: "Course not found",
        code: 'COURSE_NOT_FOUND'
      });
    }

    // Step 6: Check if course is active
    if (!course.isActive) {
      console.error('❌ Enrollment Middleware: Course is not active:', courseId);
      return res.status(404).json({
        success: false,
        error: "Course is not available",
        code: 'COURSE_INACTIVE'
      });
    }

    // Step 7: Get user with enrolled courses
    console.log('🔍 Enrollment Middleware: Checking user enrollment...');
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ Enrollment Middleware: User not found:', userId);
      return res.status(404).json({
        success: false,
        error: "User not found",
        code: 'USER_NOT_FOUND'
      });
    }

    // Step 8: Check if user has access to this course
    console.log('🔍 Enrollment Middleware: Checking access permissions...');
    
    // Check both allowedCourses and enrolledCourses
    const hasAccess = user.allowedCourses.includes(courseId) || 
                     user.enrolledCourses.some(enrollment => 
                       enrollment.course && enrollment.course.toString() === courseId
                     );

    if (!hasAccess) {
      console.error('❌ Enrollment Middleware: Access denied:', {
        userId: userId.toString(),
        courseId: courseId,
        allowedCourses: user.allowedCourses.length,
        enrolledCourses: user.enrolledCourses.length
      });
      return res.status(403).json({
        success: false,
        error: "غير مصرح لك بالوصول — يجب عليك الاشتراك في الدورة أولاً",
        hasAccess: false,
        code: 'ACCESS_DENIED'
      });
    }

    // Step 9: Add course and user info to request for use in controllers
    req.course = course;
    req.userWithEnrollment = user;
    
    console.log('✅ Enrollment Middleware: Access granted:', {
      userId: userId.toString(),
      courseId: courseId,
      courseTitle: course.title,
      userEmail: user.email || user.userEmail
    });

    next();

  } catch (error) {
    console.error('💥 Enrollment Middleware: Unexpected error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      courseId: req.params?.id,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      error: "Internal server error while checking enrollment",
      details: error.message,
      code: 'ENROLLMENT_CHECK_ERROR'
    });
  }
};

/**
 * Middleware to check if user is enrolled (but payment might be pending)
 * This is less restrictive than checkEnrollment
 */
const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Get user with enrolled courses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is enrolled (regardless of payment status)
    const enrollment = user.enrolledCourses.find(enrollment => 
      enrollment.course && enrollment.course.toString() === courseId
    );

    // Add enrollment info to request
    req.enrollment = enrollment;
    req.userWithEnrollment = user;
    next();

  } catch (error) {
    console.error('Enrollment status check error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while checking enrollment status",
      details: error.message
    });
  }
};

module.exports = {
  checkEnrollment,
  checkEnrollmentStatus
};
