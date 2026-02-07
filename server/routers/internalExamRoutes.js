
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Course = require('../models/Course');
const ExamSubmission = require('../models/ExamSubmission');

// Helper function to calculate grade
function calculateGrade(percentage) {
  if (percentage >= 97) return { grade: 'A+', level: 'ممتاز جداً' };
  if (percentage >= 93) return { grade: 'A', level: 'ممتاز' };
  if (percentage >= 89) return { grade: 'B+', level: 'جيد جداً' };
  if (percentage >= 85) return { grade: 'B', level: 'جيد' };
  if (percentage >= 81) return { grade: 'C+', level: 'مقبول جداً' };
  if (percentage >= 77) return { grade: 'C', level: 'مقبول' };
  if (percentage >= 73) return { grade: 'D+', level: 'ضعيف' };
  if (percentage >= 70) return { grade: 'D', level: 'ضعيف جداً' };
  return { grade: 'F', level: 'راسب' };
}

// GET /api/internal-exams/:courseId/:examId - Get exam for taking
router.get('/:courseId/:examId', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    
    console.log(`📚 Getting exam: courseId=${courseId}, examId=${examId}`);
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find exam in course.exams
    const exam = course.exams.find(e => e.id === examId || e._id.toString() === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found in course'
      });
    }
    
    // Return exam without correct answers
    const examData = {
      id: exam.id || exam._id.toString(),
      title: exam.title,
      type: exam.type,
      totalMarks: exam.totalMarks,
      totalPoints: exam.totalPoints,
      duration: exam.duration,
      passingScore: exam.passingScore,
      totalQuestions: exam.questions?.length || 0,
      questions: (exam.questions || []).map((q, index) => ({
        id: q.id || q._id.toString(),
        questionText: q.questionText,
        type: q.type,
        points: q.points || q.marks || 10,
        marks: q.points || q.marks || 10,
        order: q.order || index + 1,
        // Include options for MCQ but WITHOUT correctAnswer
        options: (q.type === 'mcq' || q.type === 'multiple_choice') 
          ? (q.options || []).map(opt => ({
              id: opt.id,
              text: opt.text || opt.optionText,
              optionText: opt.text || opt.optionText
            }))
          : undefined
      }))
    };
    
    res.json({
      success: true,
      exam: examData
    });
    
  } catch (error) {
    console.error('❌ Error getting exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get exam'
    });
  }
});

// POST /api/internal-exams/:courseId/:examId/submit - Submit exam
router.post('/:courseId/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const { answers } = req.body; // Array of { questionId, answer }
    const studentId = req.user.id;
    
    console.log(`📝 Submitting exam: courseId=${courseId}, examId=${examId}, studentId=${studentId}`);
    
    // Find course and exam
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const exam = course.exams.find(e => e.id === examId || e._id.toString() === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }
    
    // Grade exam
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersArray = [];
    
    exam.questions.forEach(question => {
      const studentAnswer = answers.find(a => a.questionId === question.id);
      const answer = studentAnswer ? studentAnswer.answer : null;
      
      let isCorrect = false;
      const questionPoints = question.points || question.marks || 10;
      totalPoints += questionPoints;
      
      // Check correctness
      if (question.type === 'mcq' || question.type === 'multiple_choice') {
        // Compare answer (option.id) with correctAnswer
        isCorrect = String(answer) === String(question.correctAnswer);
      } else if (question.type === 'true_false') {
        isCorrect = Boolean(answer) === Boolean(question.correctAnswer);
      }
      
      if (isCorrect) {
        correctCount++;
        earnedPoints += questionPoints;
      }
      
      answersArray.push({
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.type,
        answer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        skipped: answer === null || answer === undefined || answer === '',
        maxMarks: questionPoints,
        earnedMarks: isCorrect ? questionPoints : 0
      });
    });
    
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const { grade, level } = calculateGrade(percentage);
    const passed = percentage >= (exam.passingScore || 60);
    
    // Save or update submission
    let submission = await ExamSubmission.findOne({
      studentId,
      courseId,
      examId
    });
    
    if (submission) {
      // Update existing submission
      submission.answers = answersArray;
      submission.score = earnedPoints;
      submission.maxScore = totalPoints;
      submission.percentage = percentage;
      submission.grade = grade;
      submission.level = level;
      submission.passed = passed;
      submission.submittedAt = new Date();
      submission.isEditable = false; // Lock after resubmission
      await submission.save();
    } else {
      // Create new submission
      submission = new ExamSubmission({
        studentId,
        courseId,
        examId,
        answers: answersArray,
        score: earnedPoints,
        maxScore: totalPoints,
        percentage,
        grade,
        level,
        passed,
        submittedAt: new Date(),
        isEditable: false
      });
      await submission.save();
    }
    
    res.json({
      success: true,
      data: {
        result: {
          score: earnedPoints,
          maxScore: totalPoints,
          percentage,
          grade,
          level,
          passed,
          correctAnswers: correctCount,
          totalQuestions: exam.questions.length,
          submittedAt: submission.submittedAt,
          answers: answersArray
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit exam'
    });
  }
});

// GET /api/internal-exams/:courseId/:examId/submission - Get student's submission
router.get('/:courseId/:examId/submission', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const studentId = req.user.id;
    
    const submission = await ExamSubmission.findOne({
      studentId,
      courseId,
      examId
    });
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found'
      });
    }
    
    res.json({
      success: true,
      submission: {
        ...submission.toObject(),
        answersArray: submission.answers
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting submission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get submission'
    });
  }
});

module.exports = router;