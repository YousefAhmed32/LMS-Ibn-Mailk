const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Sample exam data - in production, this would come from a database
const sampleExams = {
  'exam_123': {
    id: 'exam_123',
    title: 'JavaScript Fundamentals Exam',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    duration: 60, // minutes
    questionCount: 20,
    passingScore: 70,
    questions: [
      {
        id: 1,
        question: 'What is the correct way to declare a variable in JavaScript?',
        type: 'multiple-choice',
        options: [
          'var myVar = 5;',
          'variable myVar = 5;',
          'v myVar = 5;',
          'declare myVar = 5;'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: 'Which method is used to add an element to the end of an array?',
        type: 'multiple-choice',
        options: [
          'push()',
          'pop()',
          'shift()',
          'unshift()'
        ],
        correctAnswer: 0
      }
      // Add more questions as needed
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'exam_456': {
    id: 'exam_456',
    title: 'React Components Exam',
    description: 'Test your understanding of React components, props, and state management.',
    duration: 45,
    questionCount: 15,
    passingScore: 75,
    questions: [
      {
        id: 1,
        question: 'What is a React component?',
        type: 'multiple-choice',
        options: [
          'A JavaScript function that returns HTML',
          'A CSS class',
          'A database table',
          'A server endpoint'
        ],
        correctAnswer: 0
      }
      // Add more questions as needed
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// GET /api/exams/:examId - Get exam data
router.get('/:examId', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    
    const exam = sampleExams[examId];
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    
    // Return exam data without correct answers for security
    const examData = {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questionCount: exam.questionCount,
      passingScore: exam.passingScore,
      questions: exam.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options
        // Don't include correctAnswer in response
      })),
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt
    };
    
    res.json({
      success: true,
      exam: examData
    });
    
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam data'
    });
  }
});

// POST /api/exams/:examId/submit - Submit exam answers
router.post('/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, timeSpent } = req.body;
    const studentId = req.user.id; // From auth middleware
    
    const exam = sampleExams[examId];
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    
    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;
    
    exam.questions.forEach(question => {
      const studentAnswer = answers[question.id];
      if (studentAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= exam.passingScore;
    
    // In production, save this to database
    const examResult = {
      examId,
      studentId,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      timeSpent,
      submittedAt: new Date(),
      answers
    };
    
    res.json({
      success: true,
      result: {
        score,
        passed,
        correctAnswers,
        totalQuestions,
        passingScore: exam.passingScore,
        timeSpent,
        submittedAt: examResult.submittedAt
      }
    });
    
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit exam'
    });
  }
});

// GET /api/exams/:examId/results - Get exam results
router.get('/:examId/results', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    // In production, fetch from database
    // For now, return a sample result
    res.json({
      success: true,
      result: {
        examId,
        studentId,
        score: 85,
        passed: true,
        correctAnswers: 17,
        totalQuestions: 20,
        submittedAt: new Date(),
        timeSpent: 45 * 60 // 45 minutes in seconds
      }
    });
    
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exam results'
    });
  }
});

// GET /api/exams - Get all available exams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const exams = Object.values(sampleExams).map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      questionCount: exam.questionCount,
      passingScore: exam.passingScore,
      createdAt: exam.createdAt
    }));
    
    res.json({
      success: true,
      exams
    });
    
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exams'
    });
  }
});

module.exports = router;
