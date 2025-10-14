const ExamResult = require('../../models/ExamResult');
const Course = require('../../models/Course');
const User = require('../../models/User');

// Get exam for taking (without correct answers)
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
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }

    // Check if user is enrolled and has access
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is enrolled with approved payment status
    const enrollment = user.enrolledCourses.find(e => 
      e.course && e.course.toString() === course._id.toString()
    );
    
    // Allow access if:
    // 1. User is enrolled with approved payment status, OR
    // 2. User is admin/teacher, OR  
    // 3. User is in allowedCourses (fallback for legacy data)
    const hasAccess = enrollment?.paymentStatus === 'approved' || 
                     user.role === 'admin' || 
                     user.role === 'teacher' ||
                     user.allowedCourses.includes(course._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You need to enroll and get approval for this course to access exams'
      });
    }

    // Find the specific exam
    const exam = course.exams.find(e => e.id === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
        message: 'The requested exam does not exist'
      });
    }

    // Check if exam is internal (has questions)
    if (exam.type !== 'internal_exam' || !exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid exam type',
        message: 'This exam cannot be taken through this interface'
      });
    }

    // Check if user already submitted this exam
    const existingResult = await ExamResult.findOne({
      studentId: userId,
      courseId: course._id,
      examId: examId
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        error: 'Exam already completed',
        message: 'You have already completed this exam',
        data: {
          existingResult: {
            score: existingResult.score,
            maxScore: existingResult.maxScore,
            percentage: existingResult.percentage,
            grade: existingResult.grade,
            submittedAt: existingResult.submittedAt
          }
        }
      });
    }

    // Validate exam has questions
    if (!exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No questions available',
        message: 'This exam does not have any questions configured'
      });
    }

    // Return exam without correct answers for security
    const examData = {
      id: exam.id || examId,
      title: exam.title || 'Untitled Exam',
      type: exam.type || 'internal_exam',
      duration: exam.duration || 30,
      totalMarks: exam.totalMarks || 100,
      totalPoints: exam.totalPoints || exam.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      passingScore: exam.passingScore || 60,
      questions: exam.questions.map((question, index) => ({
        id: question.id || `q${index}`,
        questionText: question.questionText || 'Question text not available',
        type: question.type || 'multiple_choice',
        points: question.points || 1,
        order: question.order || index,
        // For MCQ questions, include options but remove correctAnswer
        options: question.options ? question.options.map((option, optIndex) => ({
          id: option.id || `opt${optIndex}`,
          text: option.text || option.optionText || `Option ${optIndex + 1}`,
          optionText: option.optionText || option.text || `Option ${optIndex + 1}`
          // Note: isCorrect is intentionally excluded for security
        })) : undefined
        // Note: correctAnswer and sampleAnswer are intentionally excluded for security
      }))
    };

    res.json({
      success: true,
      message: 'Exam loaded successfully',
      data: {
        exam: examData,
        course: {
          id: course._id,
          title: course.title,
          subject: course.subject,
          grade: course.grade
        }
      }
    });

  } catch (error) {
    console.error('Get exam for taking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to load exam'
    });
  }
};

// Submit exam answers and get results
const submitExam = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    console.log('=== Exam Submission Request ===');
    console.log('Exam ID:', examId);
    console.log('User ID:', userId);
    console.log('Answers:', answers);

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required',
        message: 'Please provide answers for the exam questions'
      });
    }

    // Find the course and exam
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        message: 'The requested course does not exist'
      });
    }

    const exam = course.exams.find(e => e.id === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found',
        message: 'The requested exam does not exist'
      });
    }

    // Check if exam is internal (has questions)
    if (exam.type !== 'internal_exam' || !exam.questions || exam.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid exam type',
        message: 'This exam cannot be submitted through this API'
      });
    }

    // Validate user has access to this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is enrolled with approved payment status
    const enrollment = user.enrolledCourses.find(e => 
      e.course && e.course.toString() === course._id.toString()
    );
    
    // Allow access if:
    // 1. User is enrolled with approved payment status, OR
    // 2. User is admin/teacher, OR  
    // 3. User is in allowedCourses (fallback for legacy data)
    const hasAccess = enrollment?.paymentStatus === 'approved' || 
                     user.role === 'admin' || 
                     user.role === 'teacher' ||
                     user.allowedCourses.includes(course._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You need to enroll and get approval for this course to access exams'
      });
    }

    // Check if user already submitted this exam
    const existingResult = await ExamResult.findOne({
      studentId: userId,
      courseId: course._id,
      examId: examId
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        error: 'Exam already submitted',
        message: 'You have already submitted this exam',
        data: {
          existingResult: {
            score: existingResult.score,
            maxScore: existingResult.maxScore,
            percentage: existingResult.percentage,
            grade: existingResult.grade,
            passed: existingResult.passed,
            submittedAt: existingResult.submittedAt
          }
        }
      });
    }

    // Grade the exam
    let totalScore = 0;
    let maxScore = exam.totalPoints || exam.totalMarks || 0;
    const gradedAnswers = [];

    exam.questions.forEach((question, questionIndex) => {
      const userAnswer = answers.find(a => a.questionId === question.id || a.questionId === questionIndex);
      let isCorrect = false;
      let pointsEarned = 0;

      if (userAnswer) {
        switch (question.type) {
          case 'multiple_choice':
          case 'mcq':
            if (question.correctAnswer === userAnswer.answer) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            }
            break;
          
          case 'true_false':
            if (question.correctAnswer === (userAnswer.answer === 'true' || userAnswer.answer === true)) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            }
            break;
          
          case 'essay':
            // For essay questions, we'll give partial credit based on length
            // In a real system, this would require manual grading
            const answerLength = userAnswer.answer ? userAnswer.answer.length : 0;
            if (answerLength > 50) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            } else if (answerLength > 20) {
              isCorrect = true;
              pointsEarned = Math.floor((question.points || 1) * 0.5);
            }
            break;
        }
      }

      totalScore += pointsEarned;

      gradedAnswers.push({
        questionId: question.id || questionIndex,
        questionText: question.questionText,
        questionType: question.type,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswer?.answer || '',
        isCorrect: isCorrect,
        pointsEarned: pointsEarned,
        maxPoints: question.points || 1
      });
    });

    // Calculate percentage and grade
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passingScore = exam.passingScore || 60;
    const passed = percentage >= passingScore;

    // Determine grade
    let grade = 'F';
    if (percentage >= 97) grade = 'A+';
    else if (percentage >= 93) grade = 'A';
    else if (percentage >= 90) grade = 'A-';
    else if (percentage >= 87) grade = 'B+';
    else if (percentage >= 83) grade = 'B';
    else if (percentage >= 80) grade = 'B-';
    else if (percentage >= 77) grade = 'C+';
    else if (percentage >= 73) grade = 'C';
    else if (percentage >= 70) grade = 'C-';
    else if (percentage >= 67) grade = 'D+';
    else if (percentage >= 63) grade = 'D';
    else if (percentage >= 60) grade = 'D-';

    // Debug logging
    console.log('🔍 حساب نتائج الامتحان:', {
      'الدرجة الإجمالية': totalScore,
      'الدرجة القصوى': maxScore,
      'النسبة المئوية': percentage,
      'الدرجة': grade,
      'درجة النجاح': passingScore,
      'النجاح': passed,
      'معرف الامتحان': examId,
      'عنوان الامتحان': exam.title
    });

    // Save exam result
    const examResult = new ExamResult({
      studentId: userId,
      courseId: course._id,
      examId: examId,
      examTitle: exam.title,
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      grade: grade,
      passed: passed,
      answers: gradedAnswers,
      submittedAt: new Date(),
      timeSpent: req.body.timeSpent || 0 // Optional: time spent on exam
    });

    await examResult.save();

    console.log('✅ Exam result saved:', {
      studentId: userId,
      examId: examId,
      score: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      passed: passed
    });

    // Return result
    res.status(200).json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        result: {
          score: totalScore,
          maxScore: maxScore,
          percentage: percentage,
          grade: grade,
          passed: passed,
          submittedAt: examResult.submittedAt,
          timeSpent: examResult.timeSpent
        },
        answers: gradedAnswers,
        exam: {
          id: exam.id,
          title: exam.title,
          totalQuestions: exam.questions.length,
          passingScore: exam.passingScore || 60
        }
      }
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while submitting exam',
      details: error.message
    });
  }
};

// Get student's exam results for a course
const getExamResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('=== Get Exam Results Request ===');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);

    // Validate user has access to this course
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is enrolled with approved payment status
    const enrollment = user.enrolledCourses.find(e => 
      e.course && e.course.toString() === courseId
    );
    
    // Allow access if:
    // 1. User is enrolled with approved payment status, OR
    // 2. User is admin/teacher, OR  
    // 3. User is in allowedCourses (fallback for legacy data)
    const hasAccess = enrollment?.paymentStatus === 'approved' || 
                     user.role === 'admin' || 
                     user.role === 'teacher' ||
                     user.allowedCourses.includes(courseId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You need to enroll and get approval for this course to access exam results'
      });
    }

    // Get exam results for this course
    const results = await ExamResult.find({
      studentId: userId,
      courseId: courseId
    }).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        results: results,
        totalExams: results.length,
        passedExams: results.filter(r => r.passed).length,
        averageScore: results.length > 0 ? 
          Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching exam results',
      details: error.message
    });
  }
};

// Get student's overall exam performance
const getStudentExamPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('=== Get Student Exam Performance ===');
    console.log('User ID:', userId);

    // Get all exam results for the student
    const results = await ExamResult.find({
      studentId: userId
    }).populate('courseId', 'title subject grade').sort({ submittedAt: -1 });

    // Calculate performance metrics
    const totalExams = results.length;
    const passedExams = results.filter(r => r.passed).length;
    const averageScore = totalExams > 0 ? 
      Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalExams) : 0;
    
    // Grade distribution
    const gradeDistribution = results.reduce((acc, result) => {
      acc[result.grade] = (acc[result.grade] || 0) + 1;
      return acc;
    }, {});

    // Recent performance (last 5 exams)
    const recentResults = results.slice(0, 5);

    // Performance by course
    const coursePerformance = results.reduce((acc, result) => {
      const courseId = result.courseId._id.toString();
      if (!acc[courseId]) {
        acc[courseId] = {
          courseTitle: result.courseId.title,
          courseSubject: result.courseId.subject,
          courseGrade: result.courseId.grade,
          totalExams: 0,
          passedExams: 0,
          totalScore: 0,
          averageScore: 0
        };
      }
      acc[courseId].totalExams++;
      acc[courseId].totalScore += result.percentage;
      if (result.passed) acc[courseId].passedExams++;
      acc[courseId].averageScore = Math.round(acc[courseId].totalScore / acc[courseId].totalExams);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalExams,
          passedExams,
          failedExams: totalExams - passedExams,
          passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
          averageScore
        },
        gradeDistribution,
        recentResults: recentResults.map(result => ({
          examTitle: result.examTitle,
          courseTitle: result.courseId.title,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.percentage,
          grade: result.grade,
          passed: result.passed,
          submittedAt: result.submittedAt
        })),
        coursePerformance: Object.values(coursePerformance)
      }
    });

  } catch (error) {
    console.error('Error fetching student exam performance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching exam performance',
      details: error.message
    });
  }
};

module.exports = {
  getExamForTaking,
  submitExam,
  getExamResults,
  getStudentExamPerformance
};