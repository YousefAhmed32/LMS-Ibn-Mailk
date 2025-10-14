const express = require('express');
const router = express.Router();
const examResultController = require('../controllers/examResultController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Submit exam result
router.post('/submit', examResultController.submitExamResult);

// Get student's exam results for a specific course
router.get('/course/:courseId', examResultController.getStudentCourseResults);

// Get student's overall performance
router.get('/performance', examResultController.getStudentPerformance);

// Get specific exam result
router.get('/:resultId', examResultController.getExamResult);

// Update exam result
router.put('/:resultId', examResultController.updateExamResult);

// Delete exam result
router.delete('/:resultId', examResultController.deleteExamResult);

// Get parent dashboard data (for parents to view their child's results)
router.get('/parent/:studentId', examResultController.getParentDashboardData);

module.exports = router;

