const express = require('express');
const router = express.Router();
const {
  getExamForTaking,
  submitExam,
  getExamResults,
  getStudentExamPerformance
} = require('../../controllers/examController');
const { authenticateToken } = require('../../middleware/auth');

// Apply authentication middleware to all exam routes
router.use(authenticateToken);

// Get exam for taking (without correct answers)
router.get('/:courseId/:examId', getExamForTaking);

// Submit exam answers
router.post('/:courseId/:examId/submit', submitExam);

// Get student's exam results for a course
router.get('/results/:courseId', getExamResults);

// Get student's overall exam performance
router.get('/performance', getStudentExamPerformance);

module.exports = router;
