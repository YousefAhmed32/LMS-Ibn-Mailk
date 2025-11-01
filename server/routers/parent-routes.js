const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { 
  searchStudent, 
  sendOTP, 
  verifyOTP, 
  linkStudent, 
  linkStudentRobust,
  getStudentData, 
  getStudentGrades,
  getStudentAttendance,
  getStudentProgress,
  exportReport,
  getStudentStats,
  getComprehensiveStudentData
} = require('../controllers/parent-controller');

// Validation middleware
const studentIdValidation = [
  body('studentId')
    .trim()
    .isLength({ min: 8, max: 12 })
    .withMessage('معرف الطالب يجب أن يكون بين 8 و 12 حرف')
    .matches(/^STU\d{8}$/)
    .withMessage('معرف الطالب يجب أن يبدأ بـ STU متبوعاً بـ 8 أرقام')
];

const otpValidation = [
  body('otpCode')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('رمز التحقق يجب أن يكون 6 أرقام')
    .isNumeric()
    .withMessage('رمز التحقق يجب أن يحتوي على أرقام فقط')
];

// Parent routes
router.post('/search-student', authenticateToken, studentIdValidation, searchStudent);
router.post('/send-otp', authenticateToken, sendOTP);
router.post('/verify-otp', authenticateToken, otpValidation, verifyOTP);
router.post('/link-student', authenticateToken, linkStudent);
router.post('/link-student-robust', authenticateToken, linkStudentRobust);
router.post('/:parentId/link-student', authenticateToken, linkStudentRobust);
router.get('/student-data', authenticateToken, getStudentData);
router.get('/export-report', authenticateToken, exportReport);
router.get('/student/:studentId/stats', authenticateToken, getStudentStats);
router.get('/student/:studentId/comprehensive', authenticateToken, getComprehensiveStudentData);

// Get all linked students for a parent
router.get('/students/comprehensive', authenticateToken, async (req, res) => {
  try {
    const User = require('../models/User');
    const parentId = req.user.id;
    
    const parent = await User.findById(parentId).populate('linkedStudents', 'firstName secondName thirdName fourthName studentId email grade governorate');
    
    if (!parent || !parent.linkedStudents || parent.linkedStudents.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          students: [],
          totalStudents: 0
        }
      });
    }

    // Fetch stats for each linked student by calling the endpoint handler directly
    const studentsData = [];
    for (const student of parent.linkedStudents) {
      try {
        // Create a mock request/response to call getStudentStats
        const mockReq = {
          params: { studentId: student._id.toString() },
          user: { id: parentId }
        };
        
        let statsData = null;
        const mockRes = {
          json: (data) => { statsData = data; },
          status: (code) => ({ json: (data) => { statsData = data; } })
        };
        
        await getStudentStats(mockReq, mockRes);
        
        if (statsData && statsData.success && statsData.data) {
          studentsData.push(statsData.data);
        } else {
          // Fallback if stats call fails
          studentsData.push({
            student: {
              _id: student._id,
              firstName: student.firstName,
              secondName: student.secondName,
              studentId: student.studentId,
              email: student.email,
              grade: student.grade,
              governorate: student.governorate
            },
            statistics: {},
            charts: {},
            recentActivity: []
          });
        }
      } catch (error) {
        console.error(`Error fetching stats for student ${student._id}:`, error);
        // Add basic student info even if stats fail
        studentsData.push({
          student: {
            _id: student._id,
            firstName: student.firstName,
            secondName: student.secondName,
            studentId: student.studentId,
            email: student.email,
            grade: student.grade,
            governorate: student.governorate
          },
          statistics: {},
          charts: {},
          recentActivity: []
        });
      }
    }

    res.json({
      success: true,
      data: {
        students: studentsData,
        totalStudents: studentsData.length
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive students data:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الطلاب'
    });
  }
});

// Additional routes for ParentDashboard - using existing functions
router.get('/children', authenticateToken, getStudentData);
router.get('/:parentId/children', authenticateToken, getStudentData);
router.get('/:parentId/grades/:childId', authenticateToken, getStudentGrades);
router.get('/:parentId/attendance/:childId', authenticateToken, getStudentAttendance);
router.get('/:parentId/progress/:childId', authenticateToken, getStudentProgress);
router.get('/:parentId/export-report/:childId', authenticateToken, exportReport);

module.exports = router;
