const mongoose = require('mongoose');
const Course = require("../../models/Course");
const User = require("../../models/User");
const Payment = require("../../models/Payment");

// Create a new course (Admin only)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      grade,
      term,
      subject,
      price,
      videos
    } = req.body;

    // Create new course
    const newCourse = new Course({
      title,
      description,
      grade,
      term,
      subject,
      price,
      videos,
      createdBy: req.user._id // From auth middleware
    });

    await newCourse.save();

    // Populate creator info
    await newCourse.populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse
    });

  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while creating course"
    });
  }
};

// Get all courses with filters
const getAllCourses = async (req, res) => {
  try {
    const { 
      grade, 
      term, 
      subject, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter - Only show active courses to students
    const filter = { isActive: true };
    if (grade) filter.grade = grade;
    if (term) filter.term = term;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };

    console.log('🔍 Course filter for students:', filter);

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const courses = await Course.find(filter)
      .populate('createdBy', 'firstName secondName thirdName fourthName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: { grade, term, subject }
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching courses"
    });
  }
};

// Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    const course = await Course.findById(id)
      .populate('createdBy', 'firstName secondName thirdName fourthName userEmail')
      .populate('enrolledStudents', 'firstName secondName thirdName fourthName userEmail');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    if (!course.isActive) {
      return res.status(404).json({
        success: false,
        error: "Course is not available"
      });
    }

    return res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching course"
    });
  }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.enrolledStudents;
    delete updateData.totalEnrollments;
    delete updateData.averageRating;
    delete updateData.totalRatings;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if the user is the creator of the course
    if (updatedCourse.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only update courses you created"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while updating course"
    });
  }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if the user is the creator of the course
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only delete courses you created"
      });
    }

    // Check if there are enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete course with enrolled students. Consider deactivating instead."
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error('Delete course error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while deleting course"
    });
  }
};

// Deactivate course (Admin only) - Alternative to deletion
const deactivateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if the user is the creator of the course
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You can only deactivate courses you created"
      });
    }

    course.isActive = false;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course deactivated successfully"
    });

  } catch (error) {
    console.error('Deactivate course error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while deactivating course"
    });
  }
};

// Get courses by creator (Admin only)
const getCoursesByCreator = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const courses = await Course.find({ 
      createdBy: req.user._id,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments({ 
      createdBy: req.user._id,
      isActive: true 
    });

    return res.status(200).json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get courses by creator error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching your courses"
    });
  }
};

// Enroll in a course with payment proof
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { proofImage } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if user is already enrolled
    const user = await User.findById(userId);
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "You are already enrolled in this course"
      });
    }

    // Add course to enrolled courses with pending status
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in course.",
      enrollment: {
        course: courseId,
        enrolledAt: new Date(),
        progress: 0,
        completed: false
      }
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while enrolling in course"
    });
  }
};

// Get user's enrollment status for a specific course
const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        enrolled: false,
        enrollment: null
      });
    }

    return res.status(200).json({
      success: true,
      enrolled: true,
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Get enrollment status error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while getting enrollment status"
    });
  }
};

// Upload payment proof for course enrollment
const uploadPaymentProof = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const { senderPhone, studentPhone, parentPhone, amount, transferTime } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Payment proof image is required"
      });
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Upload to Cloudinary
    const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');
    let proofImageUrl;
    
    try {
      // Use the buffer from memory storage
      const result = await uploadToCloudinary(req.file.buffer);
      proofImageUrl = result.secure_url;
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload image to cloud storage"
      });
    }

    // Check if user is already enrolled
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Create or update enrollment in User model
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      // Update existing enrollment
      existingEnrollment.enrolledAt = new Date();
    } else {
      // Create new enrollment
      user.enrolledCourses.push({
        course: courseId,
        enrolledAt: new Date(),
        progress: 0,
        completed: false
      });
    }

    await user.save();

    // Create Payment record for admin dashboard
    const paymentData = {
      studentId: userId,
      studentPhone: studentPhone,
      parentPhone: parentPhone || null, // Make it optional for course enrollment
      courseId: courseId,
      amount: parseFloat(amount) || course.price,
      senderPhone: senderPhone,
      transferTime: transferTime ? new Date(transferTime) : new Date(),
      submittedAt: new Date(),
      proofImage: proofImageUrl,
      status: "pending",
      currency: "EGP",
      paymentMethod: "vodafone_cash"
    };

    // Check if payment already exists for this course
    const existingPayment = await Payment.findOne({
      studentId: userId,
      courseId: courseId,
      status: "pending"
    });

    let payment;
    if (existingPayment) {
      // Update existing payment
      Object.assign(existingPayment, paymentData);
      payment = await existingPayment.save();
    } else {
      // Create new payment
      payment = new Payment(paymentData);
      await payment.save();
    }

    return res.status(200).json({
      success: true,
      message: "تم إرسال إثبات الدفع بنجاح وجاري المراجعة من قبل الإدارة.",
      proofImage: proofImageUrl,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Upload payment proof error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      error: "Internal server error while uploading payment proof",
      details: error.message
    });
  }
};

// Get all enrolled courses for a user
const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'enrolledCourses.course',
      select: 'title description grade subject price imageUrl videos'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const enrolledCourses = user.enrolledCourses.map(enrollment => ({
      ...enrollment.toObject(),
      course: enrollment.course
    }));

    return res.status(200).json({
      success: true,
      data: enrolledCourses
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching enrolled courses"
    });
  }
};

// Import the new course content controller
const courseContentController = require('./courseContentController');

// Get course content for enrolled students
const getCourseContent = courseContentController.getCourseContent;
  try {
    // Step 1: Validate request parameters and user
    console.log('=== Get Course Content Request ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user ? 'User exists' : 'No user');
    console.log('Request course:', req.course ? 'Course exists' : 'No course');
    console.log('Request userWithEnrollment:', req.userWithEnrollment ? 'User with enrollment exists' : 'No user with enrollment');

    // Validate courseId parameter
    const { id: courseId } = req.params;
    if (!courseId) {
      console.error('❌ Missing courseId parameter');
      return res.status(400).json({
        success: false,
        error: 'Course ID is required',
        code: 'MISSING_COURSE_ID'
      });
    }

    // Validate user from auth middleware
    if (!req.user) {
      console.error('❌ No user found in request (auth middleware failed)');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER'
      });
    }

    const userId = req.user._id;
    if (!userId) {
      console.error('❌ No user ID found in authenticated user');
      return res.status(401).json({
        success: false,
        error: 'Invalid user authentication',
        code: 'INVALID_USER_ID'
      });
    }

    // Validate course from enrollment middleware
    if (!req.course) {
      console.error('❌ No course found in request (enrollment middleware failed)');
      return res.status(404).json({
        success: false,
        error: 'Course not found or not accessible',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (!req.userWithEnrollment) {
      console.error('❌ No user with enrollment found in request');
      return res.status(403).json({
        success: false,
        error: 'User enrollment not found',
        code: 'NO_ENROLLMENT'
      });
    }

    const course = req.course;
    const user = req.userWithEnrollment;

    console.log('✅ Validation passed:', {
      courseId: courseId,
      userId: userId.toString(),
      courseTitle: course.title,
      userEmail: user.email || user.userEmail
    });

    // Step 2: Safely get user's progress for this course
    const LessonProgress = require("../../models/LessonProgress");
    
    let progress = null;
    
    try {
      // Additional validation before calling LessonProgress
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId format');
      }
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        throw new Error('Invalid courseId format');
      }

      console.log('📊 Fetching progress data...');
      progress = await LessonProgress.getUserCourseProgress(userId, courseId);
      console.log('✅ Progress data fetched successfully');
    } catch (progressError) {
      console.warn('⚠️ Could not fetch progress data:', {
        error: progressError.message,
        userId: userId,
        courseId: courseId,
        errorName: progressError.name
      });
      
      // Continue without progress data - provide safe defaults
      progress = {
        totalLessons: 0,
        completedLessons: 0,
        totalWatchTime: 0,
        totalDuration: 0,
        overallProgress: 0,
        lessons: []
      };
    }

    // Step 3: Safely prepare course content with progress data
    console.log('📝 Preparing course content...');
    
    const courseContent = {
      course: {
        _id: course._id,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        grade: course.grade || '',
        term: course.term || '',
        subject: course.subject || '',
        price: course.price || 0,
        imageUrl: course.imageUrl || '',
        totalDuration: course.videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0,
        videoCount: course.videos?.length || 0,
        examCount: course.exams?.length || 0,
        createdBy: course.createdBy
      },
      videos: (course.videos || []).map((video, index) => {
        const lessonId = `lesson_${index + 1}`;
        const lessonProgress = progress?.lessons?.find(p => p.lessonId === lessonId);
        
        return {
          _id: video._id || `video_${index}`,
          id: lessonId,
          title: video.title || `Lesson ${index + 1}`,
          description: video.description || '',
          url: video.url || '',
          thumbnail: video.thumbnail || '',
          duration: video.duration || 0,
          order: video.order || index,
          progress: lessonProgress ? {
            watchedDuration: lessonProgress.watchedDuration || 0,
            totalDuration: lessonProgress.totalDuration || 0,
            watchPercentage: lessonProgress.watchPercentage || 0,
            isCompleted: lessonProgress.isCompleted || false,
            completedAt: lessonProgress.completedAt,
            lastWatchedAt: lessonProgress.lastWatchedAt,
            watchCount: lessonProgress.watchCount || 0
          } : null
        };
      }).sort((a, b) => (a.order || 0) - (b.order || 0)),
      exams: (course.exams || []).map((exam, index) => {
        return {
          id: exam.id || exam._id || `exam_${index}`,
          title: exam.title || `Exam ${index + 1}`,
          type: exam.type || 'internal_exam',
          url: exam.url || '',
          totalMarks: exam.totalMarks || exam.totalPoints || 0,
          totalPoints: exam.totalPoints || 0,
          duration: exam.duration || 30,
          passingScore: exam.passingScore || 60,
          questions: exam.questions || [],
          totalQuestions: exam.totalQuestions || (exam.questions ? exam.questions.length : 0),
          migratedFromGoogleForm: exam.migratedFromGoogleForm || false,
          migrationNote: exam.migrationNote || '',
          createdAt: exam.createdAt
        };
      }),
      progress: {
        totalLessons: progress?.totalLessons || 0,
        completedLessons: progress?.completedLessons || 0,
        overallProgress: progress?.overallProgress || 0,
        totalWatchTime: progress?.totalWatchTime || 0,
        totalDuration: progress?.totalDuration || 0
      },
      hasAccess: true
    };

    console.log('✅ Course content prepared successfully:', {
      videosCount: courseContent.videos.length,
      examsCount: courseContent.exams.length,
      progressPercentage: courseContent.progress.overallProgress
    });

    res.status(200).json({
      success: true,
      data: courseContent
    });

  } catch (error) {
    console.error('💥 Error fetching course content:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      courseId: req.params?.id,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching course content",
      details: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
};

// Update lesson progress
const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { videoId, watchedDuration, totalDuration } = req.body;

    console.log('=== Update Lesson Progress Request ===');
    console.log('Course ID:', courseId);
    console.log('Lesson ID:', lessonId);
    console.log('User ID:', userId);
    console.log('Watched Duration:', watchedDuration);
    console.log('Total Duration:', totalDuration);

    // Validate user has access to this course
    const user = await User.findById(userId);
    if (!user || !user.allowedCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You need to enroll and get approval for this course."
      });
    }

    // Update lesson progress
    const LessonProgress = require("../../models/LessonProgress");
    const progress = await LessonProgress.updateLessonProgress(
      userId, 
      courseId, 
      lessonId, 
      videoId, 
      watchedDuration, 
      totalDuration
    );

    res.status(200).json({
      success: true,
      message: "Lesson progress updated successfully",
      data: progress
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while updating lesson progress",
      details: error.message
    });
  }
};


// Check course access for current user
const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Get user with enrolledCourses
    const user = await User.findById(userId);
    
    // Check if user has access to this course
    // Check both allowedCourses and enrolledCourses
    const hasAccess = user.allowedCourses.includes(courseId) || 
                     user.enrolledCourses.some(enrollment => 
                       enrollment.course && enrollment.course.toString() === courseId
                     );

    return res.status(200).json({
      success: true,
      access: hasAccess,
      courseId: courseId,
      userId: userId
    });

  } catch (error) {
    console.error('Error checking course access:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while checking course access",
      details: error.message
    });
  }
};

// Unsubscribe from course (Remove enrollment)
const unsubscribeFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('🔄 Unsubscribing user from course:', { userId, courseId });

    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is enrolled in this course
    const enrollmentIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (enrollmentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "You are not enrolled in this course"
      });
    }

    // Remove from enrolledCourses
    user.enrolledCourses.splice(enrollmentIndex, 1);

    // Remove from allowedCourses if exists
    user.allowedCourses = user.allowedCourses.filter(
      allowedCourseId => allowedCourseId.toString() !== courseId
    );

    // Remove from course's enrolledStudents
    course.enrolledStudents = course.enrolledStudents.filter(
      studentId => studentId.toString() !== userId
    );

    // Save both user and course
    await Promise.all([user.save(), course.save()]);

    console.log('✅ Successfully unsubscribed from course:', { userId, courseId });

    return res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from course",
      data: {
        courseId: courseId,
        courseTitle: course.title,
        unsubscribedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error unsubscribing from course:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while unsubscribing",
      details: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseContent,
  updateCourse,
  deleteCourse,
  deactivateCourse,
  getCoursesByCreator,
  enrollInCourse,
  getEnrollmentStatus,
  uploadPaymentProof,
  getMyEnrolledCourses,
  updateLessonProgress,
  checkCourseAccess,
  unsubscribeFromCourse
};
