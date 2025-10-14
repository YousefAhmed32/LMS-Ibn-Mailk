const mongoose = require('mongoose');
const User = require('../../models/User');

// Get student's enrolled courses with access control
const getStudentEnrolledCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid student ID format"
      });
    }

    const user = await User.findById(studentId)
      .populate({
        path: 'enrolledCourses.courseId',
        select: 'title subject grade price thumbnail description lessons'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    // Filter only approved courses for student access
    const approvedCourses = user.enrolledCourses.filter(
      enrollment => enrollment.paymentStatus === 'approved'
    );

    return res.status(200).json({
      success: true,
      data: {
        student: {
          _id: user._id,
          firstName: user.firstName,
          secondName: user.secondName,
          userEmail: user.userEmail
        },
        enrolledCourses: approvedCourses,
        totalEnrolled: approvedCourses.length
      }
    });

  } catch (error) {
    console.error('Error getting student enrolled courses:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching enrolled courses"
    });
  }
};

// Check if student has access to a specific course
const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid course ID format"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.courseId.toString() === courseId
    );

    const hasAccess = enrollment && enrollment.paymentStatus === 'approved';

    return res.status(200).json({
      success: true,
      data: {
        hasAccess,
        enrollment: hasAccess ? enrollment : null,
        courseId
      }
    });

  } catch (error) {
    console.error('Error checking course access:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while checking course access"
    });
  }
};

module.exports = {
  getStudentEnrolledCourses,
  checkCourseAccess
};
