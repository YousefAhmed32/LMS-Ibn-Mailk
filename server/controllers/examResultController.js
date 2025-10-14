const ExamResult = require('../models/ExamResult');
const Course = require('../models/Course');
const User = require('../models/User');

// Submit exam result
const submitExamResult = async (req, res) => {
  try {
    const { courseId, examId, score, maxScore, notes } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!courseId || !examId || score === undefined || !maxScore) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, examId, score, maxScore'
      });
    }

    // Validate score format
    if (typeof score !== 'number' || typeof maxScore !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Score and maxScore must be numbers'
      });
    }

    if (score < 0 || maxScore <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid score values'
      });
    }

    if (score > maxScore) {
      return res.status(400).json({
        success: false,
        message: 'Score cannot exceed maximum score'
      });
    }

    // Verify course exists and get exam details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the specific exam in the course
    const exam = course.exams.find(ex => ex.id === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found in course'
      });
    }

    // Check if result already exists for this student and exam
    const existingResult = await ExamResult.findOne({
      studentId,
      courseId,
      examId
    });

    let examResult;

    if (existingResult) {
      // Update existing result
      existingResult.score = score;
      existingResult.maxScore = maxScore;
      existingResult.notes = notes || '';
      examResult = await existingResult.save();
    } else {
      // Create new result
      console.log('Creating new exam result with data:', {
        studentId,
        courseId,
        examId,
        examTitle: exam.title,
        examUrl: exam.url,
        score,
        maxScore,
        notes: notes || ''
      });

      examResult = new ExamResult({
        studentId,
        courseId,
        examId,
        examTitle: exam.title,
        examUrl: exam.url,
        score,
        maxScore,
        notes: notes || ''
      });

      console.log('Exam result before save:', examResult);
      await examResult.save();
      console.log('Exam result after save:', examResult);
    }

    // Populate the result for response
    await examResult.populate([
      { path: 'studentId', select: 'firstName secondName thirdName fourthName' },
      { path: 'courseId', select: 'title subject grade' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Exam result submitted successfully',
      data: examResult
    });

  } catch (error) {
    console.error('Error submitting exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get student's exam results for a specific course
const getStudentCourseResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const results = await ExamResult.getStudentCourseResults(studentId, courseId);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error fetching course results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get student's overall performance
const getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.user._id;

    const performance = await ExamResult.getStudentPerformance(studentId);

    res.status(200).json({
      success: true,
      data: performance[0] || {
        totalExams: 0,
        averagePercentage: 0,
        averageGrade: 0,
        bestScore: 0,
        worstScore: 0,
        recentResults: []
      }
    });

  } catch (error) {
    console.error('Error fetching student performance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get exam result by ID
const getExamResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const studentId = req.user._id;

    const result = await ExamResult.findOne({
      _id: resultId,
      studentId
    }).populate([
      { path: 'studentId', select: 'firstName secondName thirdName fourthName' },
      { path: 'courseId', select: 'title subject grade' }
    ]);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Update exam result
const updateExamResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { score, maxScore, notes } = req.body;
    const studentId = req.user._id;

    const result = await ExamResult.findOne({
      _id: resultId,
      studentId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    // Update fields
    if (score !== undefined) result.score = score;
    if (maxScore !== undefined) result.maxScore = maxScore;
    if (notes !== undefined) result.notes = notes;

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Exam result updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error updating exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Delete exam result
const deleteExamResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const studentId = req.user._id;

    const result = await ExamResult.findOneAndDelete({
      _id: resultId,
      studentId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Exam result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam result deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get parent dashboard data (for parents to view their child's results)
const getParentDashboardData = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user._id;

    // Verify parent-child relationship (you may need to implement this based on your user model)
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's exam results
    const results = await ExamResult.find({ studentId })
      .populate('courseId', 'title subject grade')
      .sort({ submittedAt: -1 });

    // Get performance summary
    const performance = await ExamResult.getStudentPerformance(studentId);

    // Group results by course
    const resultsByCourse = results.reduce((acc, result) => {
      const courseId = result.courseId._id.toString();
      if (!acc[courseId]) {
        acc[courseId] = {
          course: result.courseId,
          results: [],
          averagePercentage: 0,
          totalExams: 0
        };
      }
      acc[courseId].results.push(result);
      acc[courseId].totalExams++;
      return acc;
    }, {});

    // Calculate averages for each course
    Object.keys(resultsByCourse).forEach(courseId => {
      const courseData = resultsByCourse[courseId];
      const totalPercentage = courseData.results.reduce((sum, result) => sum + result.percentage, 0);
      courseData.averagePercentage = Math.round(totalPercentage / courseData.totalExams);
    });

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: `${student.firstName} ${student.secondName} ${student.thirdName} ${student.fourthName}`,
          grade: student.grade
        },
        performance: performance[0] || {
          totalExams: 0,
          averagePercentage: 0,
          averageGrade: 0,
          bestScore: 0,
          worstScore: 0,
          recentResults: []
        },
        resultsByCourse: Object.values(resultsByCourse),
        recentResults: results.slice(0, 10) // Last 10 results
      }
    });

  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  submitExamResult,
  getStudentCourseResults,
  getStudentPerformance,
  getExamResult,
  updateExamResult,
  deleteExamResult,
  getParentDashboardData
};

