/**
 * Consolidated Exam Controller
 * 
 * Single source of truth for all exam-related operations:
 * - getCourseExams: List all exams for a course
 * - getExamForTaking: Get exam without correct answers (student view)
 * - submitExam: Submit and grade exam (hardened grading engine)
 * - getExamResult: Get a single exam result
 * - getExamSubmission: Get student's full submission for review
 * - getExamResults: Get all exam results for a course
 * - getStudentExamPerformance: Get overall performance stats
 */

const Course = require('../models/Course');
const ExamResult = require('../models/ExamResult');
const User = require('../models/User');
const UserCourseProgress = require('../models/UserCourseProgress');

// ─────────────────────────────────────────────────────────────
// Helper: Check if user has access to a course
// ─────────────────────────────────────────────────────────────
const checkCourseAccess = (user, courseId) => {
  const enrollment = user.enrolledCourses.find(
    e => e.course && e.course.toString() === courseId.toString()
  );
  return (
    enrollment?.paymentStatus === 'approved' ||
    user.role === 'admin' ||
    user.role === 'teacher' ||
    (user.allowedCourses && user.allowedCourses.some(c => c.toString() === courseId.toString()))
  );
};

// ─────────────────────────────────────────────────────────────
// Helper: Normalize a value to boolean (handles strings, booleans, numbers)
// ─────────────────────────────────────────────────────────────
const toBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'صحيح';
  }
  return false;
};

// ─────────────────────────────────────────────────────────────
// Helper: Grade a single MCQ question with text-fallback
// Returns { isCorrect: boolean, matchType: 'id'|'text'|'none' }
// ─────────────────────────────────────────────────────────────
const gradeMCQ = (question, studentAnswer) => {
  if (!question.correctAnswer) {
    return { isCorrect: false, matchType: 'none' };
  }
  if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') {
    return { isCorrect: false, matchType: 'none' };
  }

  const correctId = String(question.correctAnswer).trim();
  const answerId = String(studentAnswer).trim();

  // Primary comparison: option.id === option.id
  if (correctId === answerId) {
    return { isCorrect: true, matchType: 'id' };
  }

  // Fallback: student may have sent option.text instead of option.id
  // This handles legacy clients or the ExamTakingPage bug
  if (question.options && Array.isArray(question.options)) {
    const correctOption = question.options.find(o => {
      const optId = typeof o === 'object' ? (o.id || o._id?.toString()) : null;
      return optId === correctId;
    });
    if (correctOption) {
      const correctText = (correctOption.text || correctOption.optionText || '').trim();
      if (correctText && answerId === correctText) {
        console.warn(`⚠️ Grading text-fallback: Q=${question.id}, student sent text "${answerId}" instead of id "${correctId}"`);
        return { isCorrect: true, matchType: 'text' };
      }
    }

    // Second fallback: student sent option.id but correctAnswer is stored as text
    const matchByText = question.options.find(o => {
      const optText = typeof o === 'object' ? (o.text || o.optionText || '').trim() : '';
      return optText === correctId;
    });
    if (matchByText) {
      const matchId = typeof matchByText === 'object' ? (matchByText.id || matchByText._id?.toString()) : null;
      if (matchId && answerId === matchId) {
        console.warn(`⚠️ Grading reverse-fallback: Q=${question.id}, correctAnswer was text "${correctId}", student sent id "${answerId}"`);
        return { isCorrect: true, matchType: 'text' };
      }
    }
  }

  return { isCorrect: false, matchType: 'none' };
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/course/:courseId - Get all exams for a course
// ═══════════════════════════════════════════════════════════════
const getCourseExams = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }
    if (!checkCourseAccess(user, courseId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled or not approved for this course' });
    }

    // Get exam results for this user
    const examResults = await ExamResult.find({ studentId: userId, courseId });
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
    // Filter out draft exams for students
    const publishedExams = (course.exams || []).filter(exam => 
      exam.status === 'published' || !exam.status
    );
    
    const examsData = publishedExams.map(exam => ({
      id: exam.id,
      title: exam.title,
      totalMarks: exam.totalMarks,
      totalQuestions: exam.questions?.length || 0,
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      createdAt: exam.createdAt,
      questions: (exam.questions || []).map(question => ({
        id: question.id,
        questionText: question.questionText,
        type: question.type,
        options: (question.type === 'mcq' || question.type === 'multiple_choice') && question.options
          ? question.options.map(opt => ({ id: opt?.id, text: opt?.text ?? opt?.optionText }))
          : undefined,
        marks: question.marks ?? question.points,
        order: question.order
      })),
      isCompleted: !!completedExams[exam.id],
      result: completedExams[exam.id] || null
    }));

    res.json({ success: true, exams: examsData });
  } catch (error) {
    console.error('Error getting course exams:', error);
    res.status(500).json({ success: false, message: 'Failed to get course exams', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/:courseId/:examId - Get specific exam for taking
// ═══════════════════════════════════════════════════════════════
const getExamForTaking = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }
    if (!checkCourseAccess(user, courseId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled or not approved for this course' });
    }

    // Find the specific exam - only published exams
    const exam = course.exams.find(e => 
      e.id === examId && (e.status === 'published' || !e.status)
    );
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found or not published' });
    }

    // Check if already completed - allow review mode
    const existingResult = await ExamResult.findOne({ studentId: userId, courseId, examId });
    const isCompleted = !!existingResult;
    
    // Return exam with stable option IDs but without correct answers
    const examData = {
      id: exam.id,
      title: exam.title,
      totalMarks: exam.totalMarks ?? exam.totalPoints ?? (exam.questions || []).reduce((s, q) => s + (q.marks ?? q.points ?? 1), 0),
      totalQuestions: (exam.questions || []).length,
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      createdAt: exam.createdAt,
      isCompleted: isCompleted, // Flag to indicate exam is already completed
      previousResult: isCompleted ? {
        score: existingResult.score,
        maxScore: existingResult.maxScore,
        percentage: existingResult.percentage,
        grade: existingResult.grade,
        submittedAt: existingResult.submittedAt
      } : null,
      questions: (exam.questions || []).map((question, qIdx) => {
        const qId = question.id ?? `q_${qIdx}`;
        return {
          id: qId,
          questionText: question.questionText,
          type: question.type === 'multiple_choice' ? 'mcq' : question.type,
          options: (question.type === 'mcq' || question.type === 'multiple_choice') && question.options
            ? question.options.map((opt, optIdx) => {
                const text = typeof opt === 'object' ? (opt.text ?? opt.optionText ?? '') : String(opt);
                const optId = (typeof opt === 'object' && opt.id != null && opt.id !== '') ? opt.id : `opt_${qId}_${optIdx}`;
                return { id: optId, text };
              })
            : undefined,
          marks: question.marks ?? question.points ?? 1,
          order: question.order ?? qIdx + 1
          // correctAnswer intentionally excluded for security
        };
      })
    };

    res.json({ 
      success: true, 
      exam: examData,
      isReviewMode: isCompleted // Indicate this is review mode
    });
  } catch (error) {
    console.error('Error getting exam for taking:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// POST /api/exams/:courseId/:examId/submit - Submit exam answers
// Hardened grading engine with text-fallback, boolean normalization,
// skipped-question tracking, and model-delegated grade computation.
// ═══════════════════════════════════════════════════════════════
const submitExam = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    console.log('=== SUBMIT EXAM ===', { courseId, examId, userId, answersCount: answers?.length || 0 });

    // ── Validate input ──
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const exam = course.exams.find(e => 
      e.id === examId && (e.status === 'published' || !e.status)
    );
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found or not published' });
    }

    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Exam has no questions' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }
    if (!checkCourseAccess(user, courseId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled or not approved for this course' });
    }

    // ── Check existing submission ──
    const existingResult = await ExamResult.findOne({ studentId: userId, courseId, examId });
    if (existingResult && !existingResult.isEditable) {
      return res.status(400).json({ success: false, message: 'You have already completed this exam' });
    }

    // ── Build answers lookup ──
    const answersMap = {};
    answers.forEach(item => {
      if (item && item.questionId !== undefined) {
        answersMap[item.questionId] = item.answer;
      }
    });

    // ── Grade each question ──
    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let skippedCount = 0;
    const totalQuestions = exam.questions.length;
    const gradedAnswers = [];

    exam.questions.forEach((question, qIndex) => {
      const questionId = question.id || question._id?.toString();
      const studentAnswer = answersMap[questionId];
      const points = question.points || question.marks || 1;
      maxScore += points;

      // Detect skipped questions
      const isSkipped = studentAnswer === undefined || studentAnswer === null || studentAnswer === '';

      if (question.type === 'mcq' || question.type === 'multiple_choice') {
        // ── MCQ Grading with text-fallback ──
        if (!question.correctAnswer) {
          // No correct answer configured -- cannot grade
          gradedAnswers.push({
            questionId, questionText: question.questionText || '', questionType: question.type,
            answer: isSkipped ? '' : String(studentAnswer), correctAnswer: null,
            isCorrect: false, earnedMarks: 0, maxMarks: points, skipped: isSkipped
          });
          if (isSkipped) skippedCount++;
          return;
        }

        if (isSkipped) {
          skippedCount++;
          gradedAnswers.push({
            questionId, questionText: question.questionText || '', questionType: question.type,
            answer: '', correctAnswer: question.correctAnswer,
            isCorrect: false, earnedMarks: 0, maxMarks: points, skipped: true
          });
          return;
        }

        const { isCorrect, matchType } = gradeMCQ(question, studentAnswer);
        if (isCorrect) {
          totalScore += points;
          correctCount++;
        }

        console.log('MCQ Grade:', { questionId, correct: question.correctAnswer, student: studentAnswer, isCorrect, matchType });

        gradedAnswers.push({
          questionId, questionText: question.questionText || '', questionType: question.type,
          answer: String(studentAnswer).trim(), correctAnswer: question.correctAnswer,
          isCorrect, earnedMarks: isCorrect ? points : 0, maxMarks: points, skipped: false
        });

      } else if (question.type === 'true_false') {
        // ── True/False Grading with robust boolean normalization ──
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          gradedAnswers.push({
            questionId, questionText: question.questionText || '', questionType: question.type,
            answer: isSkipped ? '' : String(studentAnswer), correctAnswer: null,
            isCorrect: false, earnedMarks: 0, maxMarks: points, skipped: isSkipped
          });
          if (isSkipped) skippedCount++;
          return;
        }

        if (isSkipped) {
          skippedCount++;
          gradedAnswers.push({
            questionId, questionText: question.questionText || '', questionType: question.type,
            answer: '', correctAnswer: question.correctAnswer,
            isCorrect: false, earnedMarks: 0, maxMarks: points, skipped: true
          });
          return;
        }

        const correctBool = toBool(question.correctAnswer);
        const studentBool = toBool(studentAnswer);
        const isCorrect = correctBool === studentBool;

        if (isCorrect) {
          totalScore += points;
          correctCount++;
        }

        console.log('T/F Grade:', { questionId, correct: question.correctAnswer, student: studentAnswer, correctBool, studentBool, isCorrect });

        gradedAnswers.push({
          questionId, questionText: question.questionText || '', questionType: question.type,
          answer: String(studentAnswer), correctAnswer: question.correctAnswer,
          isCorrect, earnedMarks: isCorrect ? points : 0, maxMarks: points, skipped: false
        });

      } else if (question.type === 'essay') {
        // ── Essay: auto-award full marks (manual grading can override later) ──
        gradedAnswers.push({
          questionId, questionText: question.questionText || '', questionType: question.type,
          answer: isSkipped ? '' : String(studentAnswer), correctAnswer: null,
          isCorrect: null, earnedMarks: isSkipped ? 0 : points, maxMarks: points, skipped: isSkipped
        });
        if (!isSkipped) totalScore += points;
        if (isSkipped) skippedCount++;

      } else {
        // ── Unknown question type ──
        gradedAnswers.push({
          questionId, questionText: question.questionText || '', questionType: question.type,
          answer: isSkipped ? '' : String(studentAnswer), correctAnswer: null,
          isCorrect: false, earnedMarks: 0, maxMarks: points, skipped: isSkipped
        });
        if (isSkipped) skippedCount++;
      }
    });

    console.log('Grading complete:', { totalScore, maxScore, correctCount, skippedCount, totalQuestions });

    // ── Compute pass/fail based on exam's passing score ──
    const safeMaxScore = maxScore > 0 ? maxScore : 1;
    const percentage = Math.min(100, Math.max(0, Math.round((totalScore / safeMaxScore) * 100)));
    const passingScoreThreshold = Number(exam.passingScore) || 60;
    const isPassed = percentage >= passingScoreThreshold;

    // ── Save result (let ExamResult pre-save compute grade, level, and override passed for high grades) ──
    let examResult;
    try {
      if (existingResult && existingResult.isEditable) {
        // Update existing editable result
        existingResult.score = totalScore;
        existingResult.maxScore = safeMaxScore;
        existingResult.answers = gradedAnswers;
        existingResult.timeSpent = req.body.timeSpent || existingResult.timeSpent || 0;
        existingResult.passed = isPassed;
        existingResult.submittedAt = new Date();
        // Clear grade/percentage so pre-save recalculates them
        existingResult.percentage = undefined;
        existingResult.grade = undefined;
        existingResult.level = undefined;
        examResult = await existingResult.save();
      } else {
        // Create new result -- only pass score & maxScore; let model compute percentage/grade/level
        examResult = new ExamResult({
          studentId: userId,
          courseId: courseId,
          examId: examId,
          examTitle: exam.title || 'Untitled Exam',
          score: totalScore,
          maxScore: safeMaxScore,
          answers: gradedAnswers,
          timeSpent: req.body.timeSpent || 0,
          passed: isPassed,
          submittedAt: new Date()
        });
        await examResult.save();
      }
      console.log('Result saved:', examResult._id, { grade: examResult.grade, percentage: examResult.percentage });
    } catch (dbError) {
      console.error('Error saving exam result:', dbError);
      if (dbError.errors) {
        const msgs = Object.values(dbError.errors).map(e => e.message).join(', ');
        throw new Error(`Validation error: ${msgs}`);
      }
      throw new Error(`Failed to save exam result: ${dbError.message}`);
    }

    // ── Update course progress (non-blocking) ──
    try {
      await UserCourseProgress.markExamCompleted(userId, courseId, examId, examResult.percentage, isPassed);
    } catch (progressError) {
      console.warn('Progress update failed (non-critical):', progressError.message);
    }

    // ── Return response using model-computed fields ──
    res.json({
      success: true,
      message: existingResult ? 'Exam updated successfully' : 'Exam submitted successfully',
      data: {
        result: {
          totalQuestions,
          correctAnswers: correctCount,
          skippedAnswers: skippedCount,
          score: examResult.score,
          maxScore: examResult.maxScore,
          percentage: examResult.percentage,
          grade: examResult.grade,
          level: examResult.level,
          passingScore: passingScoreThreshold,
          isPassed: examResult.passed,
          submittedAt: examResult.submittedAt,
          timeSpent: examResult.timeSpent,
          answers: gradedAnswers
        }
      }
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    if (error.name === 'ValidationError') {
      const errors = error.errors
        ? Object.values(error.errors).map(e => ({ field: e.path, message: e.message, value: e.value }))
        : [];
      return res.status(400).json({ success: false, message: 'Validation error', error: error.message, errors });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error while submitting exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/:courseId/:examId/result - Get exam result
// ═══════════════════════════════════════════════════════════════
const getExamResult = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    const examResult = await ExamResult.findOne({ studentId: userId, courseId, examId });
    if (!examResult) {
      return res.status(404).json({ success: false, message: 'Exam result not found' });
    }

    res.json({
      success: true,
      result: {
        score: examResult.score,
        maxScore: examResult.maxScore,
        percentage: examResult.percentage,
        grade: examResult.grade,
        level: examResult.level,
        passed: examResult.passed,
        submittedAt: examResult.submittedAt
      }
    });
  } catch (error) {
    console.error('Error getting exam result:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam result', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/:courseId/:examId/submission - Get student's submission (for editing/review)
// ═══════════════════════════════════════════════════════════════
const getExamSubmission = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    const examResult = await ExamResult.findOne({ studentId: userId, courseId, examId });
    if (!examResult) {
      return res.status(404).json({ success: false, message: 'No submission found for this exam' });
    }

    // Convert answers array to object format for easy frontend access
    const answersObject = {};
    (examResult.answers || []).forEach(answer => {
      answersObject[answer.questionId] = {
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        correctAnswer: answer.correctAnswer,
        earnedMarks: answer.earnedMarks,
        maxMarks: answer.maxMarks,
        questionText: answer.questionText,
        questionType: answer.questionType,
        skipped: answer.skipped || false
      };
    });

    res.json({
      success: true,
      submission: {
        examId: examResult.examId,
        examTitle: examResult.examTitle,
        score: examResult.score,
        maxScore: examResult.maxScore,
        percentage: examResult.percentage,
        grade: examResult.grade,
        level: examResult.level,
        passed: examResult.passed,
        isEditable: examResult.isEditable,
        submittedAt: examResult.submittedAt,
        timeSpent: examResult.timeSpent,
        answers: answersObject,
        answersArray: examResult.answers
      }
    });
  } catch (error) {
    console.error('Error getting exam submission:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam submission', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/results/:courseId - Get all exam results for a course
// ═══════════════════════════════════════════════════════════════
const getExamResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found' });
    }
    if (!checkCourseAccess(user, courseId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const results = await ExamResult.find({ studentId: userId, courseId }).sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: {
        results,
        totalExams: results.length,
        passedExams: results.filter(r => r.passed).length,
        averageScore: results.length > 0
          ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam results', error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/exams/performance - Get student's overall exam performance
// ═══════════════════════════════════════════════════════════════
const getStudentExamPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await ExamResult.find({ studentId: userId })
      .populate('courseId', 'title subject grade')
      .sort({ submittedAt: -1 });

    const totalExams = results.length;
    const passedExams = results.filter(r => r.passed).length;
    const averageScore = totalExams > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalExams)
      : 0;

    // Grade distribution
    const gradeDistribution = {};
    results.forEach(r => { gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1; });

    // Recent results (last 5)
    const recentResults = results.slice(0, 5).map(r => ({
      examTitle: r.examTitle,
      courseTitle: r.courseId?.title || 'Unknown',
      score: r.score,
      maxScore: r.maxScore,
      percentage: r.percentage,
      grade: r.grade,
      passed: r.passed,
      submittedAt: r.submittedAt
    }));

    // Performance by course
    const courseMap = {};
    results.forEach(r => {
      const cid = r.courseId?._id?.toString() || 'unknown';
      if (!courseMap[cid]) {
        courseMap[cid] = {
          courseTitle: r.courseId?.title || 'Unknown',
          courseSubject: r.courseId?.subject || '',
          courseGrade: r.courseId?.grade || '',
          totalExams: 0, passedExams: 0, totalScore: 0, averageScore: 0
        };
      }
      courseMap[cid].totalExams++;
      courseMap[cid].totalScore += (r.percentage || 0);
      if (r.passed) courseMap[cid].passedExams++;
      courseMap[cid].averageScore = Math.round(courseMap[cid].totalScore / courseMap[cid].totalExams);
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalExams, passedExams, failedExams: totalExams - passedExams,
          passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
          averageScore
        },
        gradeDistribution,
        recentResults,
        coursePerformance: Object.values(courseMap)
      }
    });
  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam performance', error: error.message });
  }
};

module.exports = {
  getCourseExams,
  getExamForTaking,
  submitExam,
  getExamResult,
  getExamSubmission,
  getExamResults,
  getStudentExamPerformance
};
