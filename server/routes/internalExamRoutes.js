const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCourseExams,
  getExamForTaking,
  submitExam,
  getExamResult
} = require('../controllers/examController');

// GET /api/exams/course/:courseId - Get all exams for a course
router.get('/course/:courseId', authenticateToken, getCourseExams);

// GET /api/exams/:courseId/:examId - Get specific exam for taking
router.get('/:courseId/:examId', authenticateToken, getExamForTaking);

// POST /api/exams/:courseId/:examId/submit - Submit exam answers
router.post('/:courseId/:examId/submit', authenticateToken, submitExam);

// GET /api/exams/:courseId/:examId/result - Get exam result
router.get('/:courseId/:examId/result', authenticateToken, getExamResult);

module.exports = router;
