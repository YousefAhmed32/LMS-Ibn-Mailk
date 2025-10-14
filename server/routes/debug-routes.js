const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const ExamResult = require('../models/ExamResult');

/**
 * Debug Routes - لعرض البيانات الحقيقية من قاعدة البيانات
 * Debug Routes - Display Real Data from Database
 */

// عرض جميع المستخدمين
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('firstName secondName email role studentId grade createdAt').lean();
    
    res.json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.secondName}`,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        grade: user.grade,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين',
      error: error.message
    });
  }
});

// عرض المستخدمين حسب الدور
router.get('/users/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('firstName secondName email studentId grade linkedStudents').lean();
    
    res.json({
      success: true,
      role,
      totalUsers: users.length,
      users: users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.secondName}`,
        email: user.email,
        studentId: user.studentId,
        grade: user.grade,
        linkedStudents: user.linkedStudents?.length || 0
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `خطأ في جلب ${req.params.role}`,
      error: error.message
    });
  }
});

// عرض الكورسات
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({}).select('title instructor grade level price enrolledStudents').lean();
    
    res.json({
      success: true,
      totalCourses: courses.length,
      courses: courses.map(course => ({
        _id: course._id,
        title: course.title,
        instructor: course.instructor,
        grade: course.grade,
        level: course.level,
        price: course.price,
        enrolledStudents: course.enrolledStudents?.length || 0
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الكورسات',
      error: error.message
    });
  }
});

// عرض نتائج الامتحانات
router.get('/exam-results', async (req, res) => {
  try {
    const examResults = await ExamResult.find({})
      .populate('studentId', 'firstName secondName studentId')
      .populate('courseId', 'title')
      .lean();
    
    res.json({
      success: true,
      totalResults: examResults.length,
      examResults: examResults.map(exam => ({
        _id: exam._id,
        student: exam.studentId ? {
          name: `${exam.studentId.firstName} ${exam.studentId.secondName}`,
          studentId: exam.studentId.studentId
        } : null,
        course: exam.courseId ? exam.courseId.title : null,
        examTitle: exam.examTitle,
        score: exam.score,
        maxScore: exam.maxScore,
        percentage: exam.percentage,
        grade: exam.grade,
        submittedAt: exam.submittedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب نتائج الامتحانات',
      error: error.message
    });
  }
});

// اختبار API لوحة تحكم ولي الأمر بدون مصادقة
router.get('/parent-dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // استيراد الـ controller
    const { getComprehensiveStudentData } = require('../controllers/enhanced-parent-controller');
    
    // إنشاء request و response وهميين
    const mockReq = {
      params: { 
        studentId,
        parentId: '68e2f1cc46da4b0686cf06b6' // Parent Test ID
      },
      user: { id: 'debug-user' }
    };
    
    const mockRes = {
      json: (data) => res.json(data),
      status: (code) => ({
        json: (data) => res.status(code).json(data)
      })
    };
    
    // استدعاء الـ controller
    await getComprehensiveStudentData(mockReq, mockRes);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في اختبار API لوحة تحكم ولي الأمر',
      error: error.message
    });
  }
});

// عرض الطلاب المرتبطين بولي أمر معين
router.get('/parent/:parentId/students', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const parent = await User.findById(parentId).populate('linkedStudents', 'firstName secondName studentId grade email');
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'الوالد غير موجود'
      });
    }
    
    res.json({
      success: true,
      parent: {
        _id: parent._id,
        name: `${parent.firstName} ${parent.secondName}`,
        email: parent.email
      },
      linkedStudents: parent.linkedStudents || [],
      totalStudents: parent.linkedStudents?.length || 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الطلاب المرتبطين',
      error: error.message
    });
  }
});

// عرض إحصائيات قاعدة البيانات
router.get('/stats', async (req, res) => {
  try {
    const [users, courses, examResults] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      ExamResult.countDocuments()
    ]);
    
    const students = await User.countDocuments({ role: 'student' });
    const parents = await User.countDocuments({ role: 'parent' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    res.json({
      success: true,
      stats: {
        totalUsers: users,
        students,
        parents,
        admins,
        totalCourses: courses,
        totalExamResults: examResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

module.exports = router;
