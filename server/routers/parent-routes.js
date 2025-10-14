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
  getStudentStats 
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

// Additional routes for ParentDashboard - using existing functions
router.get('/children', authenticateToken, getStudentData);
router.get('/:parentId/children', authenticateToken, getStudentData);
router.get('/:parentId/grades/:childId', authenticateToken, getStudentGrades);
router.get('/:parentId/attendance/:childId', authenticateToken, getStudentAttendance);
router.get('/:parentId/progress/:childId', authenticateToken, getStudentProgress);
router.get('/:parentId/export-report/:childId', authenticateToken, exportReport);

module.exports = router;
