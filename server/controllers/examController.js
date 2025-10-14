const Course = require('../models/Course');
const ExamResult = require('../models/ExamResult');
const UserCourseProgress = require('../models/UserCourseProgress');
const { authenticateToken } = require('../middleware/auth');

// GET /api/exams/course/:courseId - Get all exams for a course
const getCourseExams = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('=== GET COURSE EXAMS ===');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled in the course
    const isEnrolled = course.enrolledStudents.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get exam results for this user
    const examResults = await ExamResult.find({
      studentId: userId,
      courseId: courseId
    });

    // Create a map of completed exams
    const completedExams = {};
    examResults.forEach(result => {
      completedExams[result.examId] = {
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        grade: result.grade,
        submittedAt: result.submittedAt
      };
    });

    // Return exams without correct answers for security
    const examsData = course.exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      createdAt: exam.createdAt,
      questions: exam.questions.map(question => ({
        id: question.id,
        questionText: question.questionText,
        type: question.type,
        options: question.type === 'mcq' ? question.options.map(opt => ({
          id: opt.id,
          text: opt.text
        })) : undefined,
        marks: question.marks,
        order: question.order
        // Don't include correctAnswer for security
      })),
      isCompleted: completedExams[exam.id] ? true : false,
      result: completedExams[exam.id] || null
    }));

    console.log('✅ Returning exams:', examsData.length);

    res.json({
      success: true,
      exams: examsData
    });

  } catch (error) {
    console.error('❌ Error getting course exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course exams',
      error: error.message
    });
  }
};

// GET /api/exams/:courseId/:examId - Get specific exam for taking
const getExamForTaking = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    console.log('=== GET EXAM FOR TAKING ===');
    console.log('Course ID:', courseId);
    console.log('Exam ID:', examId);
    console.log('User ID:', userId);

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Find the specific exam
    const exam = course.exams.find(e => e.id === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam is already completed
    const existingResult = await ExamResult.findOne({
      studentId: userId,
      courseId: courseId,
      examId: examId
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this exam',
        result: {
          score: existingResult.score,
          maxScore: existingResult.maxScore,
          percentage: existingResult.percentage,
          grade: existingResult.grade,
          submittedAt: existingResult.submittedAt
        }
      });
    }

    // Return exam without correct answers
    const examData = {
      id: exam.id,
      title: exam.title,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.totalQuestions,
      createdAt: exam.createdAt,
      questions: exam.questions.map(question => ({
        id: question.id,
        questionText: question.questionText,
        type: question.type,
        options: question.type === 'mcq' ? question.options.map(opt => ({
          id: opt.id,
          text: opt.text
        })) : undefined,
        marks: question.marks,
        order: question.order
        // Don't include correctAnswer for security
      }))
    };

    console.log('✅ Returning exam for taking:', examData.title);

    res.json({
      success: true,
      exam: examData
    });

  } catch (error) {
    console.error('❌ Error getting exam for taking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam',
      error: error.message
    });
  }
};

// POST /api/exams/:courseId/:examId/submit - Submit exam answers
const submitExam = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    console.log('=== SUBMIT EXAM ===');
    console.log('Course ID:', courseId);
    console.log('Exam ID:', examId);
    console.log('User ID:', userId);
    console.log('Answers:', answers);

    // Validate required fields
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Answers are required'
      });
    }

    // Find the course and exam
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const exam = course.exams.find(e => e.id === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if exam is already completed
    const existingResult = await ExamResult.findOne({
      studentId: userId,
      courseId: courseId,
      examId: examId
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this exam'
      });
    }

    // Grade the exam
    let totalScore = 0;
    let maxScore = 0;
    const questionResults = [];

    exam.questions.forEach(question => {
      maxScore += question.marks;
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let earnedMarks = 0;

      if (question.type === 'mcq') {
        // For MCQ, compare with correct answer ID
        isCorrect = userAnswer === question.correctAnswer;
        earnedMarks = isCorrect ? question.marks : 0;
      } else if (question.type === 'true_false') {
        // For true/false, compare boolean values
        isCorrect = userAnswer === question.correctAnswer;
        earnedMarks = isCorrect ? question.marks : 0;
      } else if (question.type === 'essay') {
        // For essay questions, give full marks (manual grading can be done later)
        earnedMarks = question.marks;
        isCorrect = true; // Essay questions are considered "correct" for now
      }

      totalScore += earnedMarks;

      questionResults.push({
        questionId: question.id,
        questionText: question.questionText,
        type: question.type,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        earnedMarks: earnedMarks,
        maxMarks: question.marks
      });
    });

    // Calculate percentage and grade
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let grade = 'F';
    let level = 'Poor';
    
    if (percentage >= 97) { grade = 'A+'; level = 'Excellent'; }
    else if (percentage >= 93) { grade = 'A'; level = 'Excellent'; }
    else if (percentage >= 90) { grade = 'A-'; level = 'Very Good'; }
    else if (percentage >= 87) { grade = 'B+'; level = 'Very Good'; }
    else if (percentage >= 83) { grade = 'B'; level = 'Good'; }
    else if (percentage >= 80) { grade = 'B-'; level = 'Good'; }
    else if (percentage >= 77) { grade = 'C+'; level = 'Average'; }
    else if (percentage >= 73) { grade = 'C'; level = 'Average'; }
    else if (percentage >= 70) { grade = 'C-'; level = 'Below Average'; }
    else if (percentage >= 67) { grade = 'D+'; level = 'Below Average'; }
    else if (percentage >= 63) { grade = 'D'; level = 'Below Average'; }
    else { grade = 'F'; level = 'Poor'; }

    // Save exam result
    const examResult = new ExamResult({
      studentId: userId,
      courseId: courseId,
      examId: examId,
      examTitle: exam.title,
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      grade: grade,
      level: level,
      submittedAt: new Date()
    });

    await examResult.save();

    // Update course progress
    await UserCourseProgress.markExamCompleted(userId, courseId, examId, percentage, percentage >= 70);

    console.log('✅ Exam submitted successfully:', {
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      grade: grade
    });

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      result: {
        score: totalScore,
        maxScore: maxScore,
        percentage: percentage,
        grade: grade,
        level: level,
        submittedAt: examResult.submittedAt,
        questionResults: questionResults
      }
    });

  } catch (error) {
    console.error('❌ Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam',
      error: error.message
    });
  }
};

// GET /api/exams/:courseId/:examId/result - Get exam result
const getExamResult = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    console.log('=== GET EXAM RESULT ===');
    console.log('Course ID:', courseId);
    console.log('Exam ID:', examId);
    console.log('User ID:', userId);

    // Find the exam result
    const examResult = await ExamResult.findOne({
      studentId: userId,
      courseId: courseId,
      examId: examId
    });

    if (!examResult) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    console.log('✅ Returning exam result');

    res.json({
      success: true,
      result: {
        score: examResult.score,
        maxScore: examResult.maxScore,
        percentage: examResult.percentage,
        grade: examResult.grade,
        level: examResult.level,
        submittedAt: examResult.submittedAt
      }
    });

  } catch (error) {
    console.error('❌ Error getting exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam result',
      error: error.message
    });
  }
};

module.exports = {
  getCourseExams,
  getExamForTaking,
  submitExam,
  getExamResult
};
