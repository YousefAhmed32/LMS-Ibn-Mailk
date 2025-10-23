const Course = require('../../models/Course');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Import the new course content controller
const courseContentController = require('./courseContentController');

// Get course content for enrolled students
const getCourseContent = courseContentController.getCourseContent;

// Mark video as completed
const markVideoCompleted = courseContentController.markVideoCompleted;

// Get exam details
const getExamDetails = courseContentController.getExamDetails;

// Create course
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      grade,
      term,
      subject,
      price,
      videos = [],
      exams = [],
      level = 'beginner',
      duration = 0
    } = req.body;

    // Validate required fields
    if (!title || !description || !grade || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, grade, and subject are required'
      });
    }

    // Create new course
    const newCourse = new Course({
      title,
      description,
      grade,
      term,
      subject,
      price: parseFloat(price) || 0,
      level,
      duration: parseInt(duration) || 0,
      videos: videos,
      exams: exams,
      createdBy: req.user._id
    });

    await newCourse.save();

    // Populate creator info
    await newCourse.populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course: newCourse
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating course',
      details: error.message
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

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if user has permission to update
    if (existingCourse.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to update this course"
      });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: {
        course: updatedCourse
      }
    });

  } catch (error) {
    console.error('Update course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while updating course",
      details: error.message
    });
  }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if user has permission to delete
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to delete this course"
      });
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error('Delete course error:', error);
    
    return res.status(500).json({
      success: false,
      error: "Internal server error while deleting course",
      details: error.message
    });
  }
};

// Enroll in course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('=== Enroll in Course Request ===');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "You are already enrolled in this course"
      });
    }

    // Add course to user's enrolled courses
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false
    });

    await user.save();

    console.log('✅ User enrolled in course:', {
      userId,
      courseId,
      courseTitle: course.title
    });

    res.status(200).json({
      success: true,
      message: "Successfully enrolled in course",
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description
        },
        enrollment: {
          course: courseId,
          enrolledAt: new Date(),
          progress: 0,
          completed: false
        }
      }
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while enrolling in course",
      details: error.message
    });
  }
};

// Get enrollment status
const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('=== Get Enrollment Status Request ===');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is enrolled
    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        data: {
          enrolled: false,
          message: "Not enrolled in this course"
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enrolled: true,
        enrollment: {
          course: enrollment.course,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completed: enrollment.completed
        }
      }
    });

  } catch (error) {
    console.error('Get enrollment status error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while checking enrollment status",
      details: error.message
    });
  }
};

// Get my enrolled courses
const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('=== Get My Enrolled Courses Request ===');
    console.log('User ID:', userId);

    // Find user with populated enrolled courses
    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description grade subject price imageUrl videos exams'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Format enrolled courses
    const enrolledCourses = user.enrolledCourses.map(enrollment => ({
      ...enrollment.toObject(),
      course: enrollment.course
    }));

    res.status(200).json({
      success: true,
      data: {
        enrolledCourses: enrolledCourses,
        totalEnrolled: enrolledCourses.length
      }
    });

  } catch (error) {
    console.error('Get my enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching enrolled courses",
      details: error.message
    });
  }
};

// Get all courses with enrollment status for current user
const getAllCoursesWithEnrollmentStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated"
      });
    }
    
    const userId = req.user._id;

    // Optimized: Get all active courses with lean() for faster serialization
    // Only select essential fields, exclude heavy nested data
    const courses = await Course.find({ isActive: { $ne: false } })
      .select('title description grade subject price imageUrl coverImage videos.title videos.duration exams.title exams.type createdAt')
      .lean() // Use lean() for 30-50% performance boost
      .sort({ createdAt: -1 })
      .maxTimeMS(3000); // 3 second timeout

    // Optimized: Only get enrolledCourses field, no populate needed
    const user = await User.findById(userId)
      .select('enrolledCourses')
      .lean()
      .maxTimeMS(2000); // 2 second timeout

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Create a map of enrolled courses for quick lookup
    const enrolledCoursesMap = new Map();
    user.enrolledCourses.forEach(enrollment => {
      if (enrollment.course) {
        enrolledCoursesMap.set(enrollment.course.toString(), {
          paymentStatus: enrollment.paymentStatus,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completed: enrollment.completed,
          paymentApprovedAt: enrollment.paymentApprovedAt
        });
      }
    });

    // Add enrollment status to each course
    const coursesWithStatus = courses.map(course => {
      const enrollment = enrolledCoursesMap.get(course._id.toString());
      
      return {
        ...course,
        enrollmentStatus: enrollment ? {
          isEnrolled: true,
          paymentStatus: enrollment.paymentStatus,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completed: enrollment.completed,
          paymentApprovedAt: enrollment.paymentApprovedAt
        } : {
          isEnrolled: false,
          paymentStatus: null,
          enrolledAt: null,
          progress: 0,
          completed: false,
          paymentApprovedAt: null
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        courses: coursesWithStatus,
        totalCourses: coursesWithStatus.length,
        enrolledCount: enrolledCoursesMap.size
      }
    });

  } catch (error) {
    console.error('Get all courses with enrollment status error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching courses with enrollment status",
      details: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrollmentStatus,
  getMyEnrolledCourses,
  getAllCoursesWithEnrollmentStatus,
  getCourseContent,
  markVideoCompleted,
  getExamDetails
};
