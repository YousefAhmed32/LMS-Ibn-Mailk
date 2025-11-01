const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Student Routes - For parent dashboard and student stats
 * These routes provide student data that can be accessed by parents
 * 
 * IMPORTANT: More specific routes must come BEFORE the general /:studentId route
 * to ensure proper route matching in Express
 */

// GET /api/student/:studentId/tests - Get all test results for a student
router.get('/:studentId/tests', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // If parent, verify student is linked
    if (userRole === 'parent') {
      const parent = await User.findById(userId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'الوالد غير موجود'
        });
      }

      const isLinked = parent.linkedStudents && parent.linkedStudents.some(
        linkedId => linkedId.toString() === studentId.toString()
      );

      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
        });
      }
    } else if (userRole === 'student' && userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get exam results (tests) for the student
    const examResults = await ExamResult.find({ studentId })
      .populate('courseId', 'title subject grade')
      .sort({ submittedAt: -1 })
      .lean();

    // Format results
    const tests = examResults.map(exam => ({
      id: exam._id,
      examId: exam.examId,
      examTitle: exam.examTitle,
      courseId: exam.courseId?._id,
      courseName: exam.courseId?.title || 'غير محدد',
      subject: exam.courseId?.subject || 'غير محدد',
      score: exam.score,
      maxScore: exam.maxScore,
      percentage: exam.percentage || Math.round((exam.score / exam.maxScore) * 100),
      grade: exam.grade,
      submittedAt: exam.submittedAt,
      createdAt: exam.createdAt
    }));

    res.json({
      success: true,
      data: {
        tests,
        totalTests: tests.length
      }
    });

  } catch (error) {
    console.error('Error fetching student tests:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الاختبارات'
    });
  }
});

// GET /api/student/:studentId/exams - Get all exam results for a student (alias for tests)
router.get('/:studentId/exams', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // If parent, verify student is linked
    if (userRole === 'parent') {
      const parent = await User.findById(userId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'الوالد غير موجود'
        });
      }

      const isLinked = parent.linkedStudents && parent.linkedStudents.some(
        linkedId => linkedId.toString() === studentId.toString()
      );

      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
        });
      }
    } else if (userRole === 'student' && userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get exam results for the student
    const examResults = await ExamResult.find({ studentId })
      .populate('courseId', 'title subject grade')
      .sort({ submittedAt: -1 })
      .lean();

    // Format results
    const exams = examResults.map(exam => ({
      id: exam._id,
      examId: exam.examId,
      examTitle: exam.examTitle,
      courseId: exam.courseId?._id,
      courseName: exam.courseId?.title || 'غير محدد',
      subject: exam.courseId?.subject || 'غير محدد',
      score: exam.score,
      maxScore: exam.maxScore,
      percentage: exam.percentage || Math.round((exam.score / exam.maxScore) * 100),
      grade: exam.grade,
      submittedAt: exam.submittedAt,
      createdAt: exam.createdAt
    }));

    res.json({
      success: true,
      data: {
        exams,
        totalExams: exams.length
      }
    });

  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الامتحانات'
    });
  }
});

// GET /api/student/:studentId/grades - Get grades summary for a student
router.get('/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // If parent, verify student is linked
    if (userRole === 'parent') {
      const parent = await User.findById(userId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'الوالد غير موجود'
        });
      }

      const isLinked = parent.linkedStudents && parent.linkedStudents.some(
        linkedId => linkedId.toString() === studentId.toString()
      );

      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
        });
      }
    } else if (userRole === 'student' && userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get exam results and calculate grades
    const examResults = await ExamResult.find({ studentId })
      .populate('courseId', 'title subject grade')
      .lean();

    // Calculate statistics
    const totalExams = examResults.length;
    const validGrades = examResults.filter(exam => exam.percentage !== null && exam.percentage !== undefined);
    const averageGrade = validGrades.length > 0
      ? Math.round(validGrades.reduce((sum, exam) => sum + exam.percentage, 0) / validGrades.length)
      : 0;

    // Group by course
    const gradesByCourse = {};
    examResults.forEach(exam => {
      const courseId = exam.courseId?._id?.toString() || 'unknown';
      if (!gradesByCourse[courseId]) {
        gradesByCourse[courseId] = {
          courseId: exam.courseId?._id,
          courseName: exam.courseId?.title || 'غير محدد',
          subject: exam.courseId?.subject || 'غير محدد',
          exams: [],
          averageGrade: 0
        };
      }
      gradesByCourse[courseId].exams.push({
        examTitle: exam.examTitle,
        score: exam.score,
        maxScore: exam.maxScore,
        percentage: exam.percentage || Math.round((exam.score / exam.maxScore) * 100),
        grade: exam.grade,
        submittedAt: exam.submittedAt
      });
    });

    // Calculate average for each course
    Object.values(gradesByCourse).forEach(course => {
      const courseAverage = course.exams.length > 0
        ? Math.round(course.exams.reduce((sum, exam) => sum + (exam.percentage || 0), 0) / course.exams.length)
        : 0;
      course.averageGrade = courseAverage;
    });

    res.json({
      success: true,
      data: {
        totalExams,
        averageGrade,
        courses: Object.values(gradesByCourse)
      }
    });

  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الدرجات'
    });
  }
});

// GET /api/student/:studentId/attendance - Get attendance data
router.get('/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // If parent, verify student is linked
    if (userRole === 'parent') {
      const parent = await User.findById(userId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'الوالد غير موجود'
        });
      }

      const isLinked = parent.linkedStudents && parent.linkedStudents.some(
        linkedId => linkedId.toString() === studentId.toString()
      );

      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
        });
      }
    } else if (userRole === 'student' && userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Calculate attendance based on exam participation
    const examResults = await ExamResult.find({ studentId }).lean();
    const student = await User.findById(studentId).lean();
    const enrolledCourses = student?.enrolledCourses || [];

    // Mock attendance calculation (can be replaced with actual attendance data)
    const totalPossibleExams = enrolledCourses.length * 3; // Assume 3 exams per course
    const attendedExams = examResults.length;
    const attendanceRate = totalPossibleExams > 0
      ? Math.round((attendedExams / totalPossibleExams) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        attendanceRate,
        totalPossibleExams,
        attendedExams,
        attendance: [
          { month: 'سبتمبر', rate: attendanceRate, totalDays: 20, presentDays: Math.round(attendanceRate * 20 / 100) },
          { month: 'أكتوبر', rate: attendanceRate, totalDays: 22, presentDays: Math.round(attendanceRate * 22 / 100) },
          { month: 'نوفمبر', rate: attendanceRate, totalDays: 21, presentDays: Math.round(attendanceRate * 21 / 100) },
          { month: 'ديسمبر', rate: attendanceRate, totalDays: 15, presentDays: Math.round(attendanceRate * 15 / 100) }
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الحضور'
    });
  }
});

// GET /api/student/:studentId - Get basic student information
// NOTE: This route must be LAST to avoid matching more specific routes
router.get('/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const mongoose = require('mongoose');

    // Validate studentId
    if (!studentId || studentId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب غير صحيح'
      });
    }

    // If parent, verify student is linked
    if (userRole === 'parent') {
      const parent = await User.findById(userId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'الوالد غير موجود'
        });
      }

      const isLinked = parent.linkedStudents && parent.linkedStudents.some(
        linkedId => linkedId.toString() === studentId.toString()
      );

      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
        });
      }
    } else if (userRole === 'student' && userId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get student data with enrolled courses populated
    const student = await User.findById(studentId)
      .populate('enrolledCourses.course', 'title subject grade price videos exams')
      .select('-password') // Exclude password
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    // Verify it's actually a student
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'المستخدم المحدد ليس طالباً'
      });
    }

    // Format enrolled courses
    const enrolledCourses = (student.enrolledCourses || []).map(enrollment => {
      const course = enrollment.course || enrollment.courseId || enrollment;
      return {
        courseId: course._id || course,
        courseName: course.title || 'غير محدد',
        subject: course.subject || 'غير محدد',
        grade: course.grade || student.grade,
        progress: enrollment.progress || 0,
        status: enrollment.paymentStatus || 'pending',
        enrolledAt: enrollment.enrolledAt,
        isCompleted: enrollment.completed || false,
        paymentStatus: enrollment.paymentStatus || 'pending'
      };
    }).filter(enrollment => enrollment.courseId);

    // Format student response
    const studentData = {
      _id: student._id,
      firstName: student.firstName,
      secondName: student.secondName,
      thirdName: student.thirdName,
      fourthName: student.fourthName,
      email: student.email || student.userEmail,
      userEmail: student.email || student.userEmail,
      phoneStudent: student.phoneStudent,
      studentId: student.studentId,
      grade: student.grade,
      governorate: student.governorate,
      role: student.role,
      isActive: student.isActive !== false,
      enrolledCourses: enrolledCourses,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };

    res.json({
      success: true,
      data: studentData,
      student: studentData // Also include for compatibility
    });

  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الطالب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

