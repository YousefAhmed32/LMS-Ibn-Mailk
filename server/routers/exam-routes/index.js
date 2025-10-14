const express = require('express');
const router = express.Router();
const examController = require('../../controllers/exam-controller');
const { authenticateToken } = require('../../middleware/auth');

// Apply authentication middleware to all exam routes
router.use(authenticateToken);

// Get exam for taking (without correct answers)
router.get('/:courseId/:examId', examController.getExamForTaking);

// Submit exam answers
router.post('/:courseId/:examId/submit', examController.submitExam);

// Get student's exam results for a course
router.get('/results/:courseId', examController.getExamResults);

// Get student's overall exam performance
router.get('/performance', examController.getStudentExamPerformance);

module.exports = router;