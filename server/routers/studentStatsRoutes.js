const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const ExamSubmission = require('../models/ExamSubmission');
const ExamResult = require('../models/ExamResult');
const UserCourseProgress = require('../models/UserCourseProgress');

// GET /api/student/me/stats - Get current student's own statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log(`📊 Fetching stats for student: ${studentId}`);
    
    // 1. Get student data
    const student = await User.findById(studentId).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User is not a student.'
      });
    }
    
    // 2. Get enrolled courses from User model with actual progress from UserCourseProgress
    const studentWithCourses = await User.findById(studentId)
      .populate('enrolledCourses.course')
      .lean();
    
    // Get all course progress records for this student
    const courseProgressRecords = await UserCourseProgress.find({ userId: studentId })
      .populate('courseId')
      .lean();
    
    // Create a map of courseId -> progress for quick lookup
    const progressMap = {};
    courseProgressRecords.forEach(progress => {
      // Handle both populated and non-populated courseId
      const courseIdKey = progress.courseId?._id 
        ? progress.courseId._id.toString() 
        : progress.courseId?.toString() || progress.courseId;
      if (courseIdKey) {
        progressMap[courseIdKey] = progress;
      }
    });
    
    console.log(`📊 Found ${courseProgressRecords.length} progress records for student ${studentId}`);
    
    const enrolledCourses = (studentWithCourses?.enrolledCourses || [])
      .filter(e => e.course && e.paymentStatus === 'approved') // Only approved courses
      .map(e => {
        const courseId = e.course._id.toString();
        const progressRecord = progressMap[courseId];
        
        // Get actual progress from UserCourseProgress
        const actualProgress = progressRecord?.overallProgress || 0;
        const isCompleted = progressRecord?.isCompleted || false;
        
        return {
          _id: e.course._id,
          courseName: e.course.title,
          name: e.course.title,
          subject: e.course.subject,
          imageUrl: e.course.imageUrl || e.course.thumbnail,
          image: e.course.imageUrl || e.course.thumbnail,
          status: isCompleted ? 'completed' : (actualProgress > 0 ? 'in_progress' : 'not_started'),
          progress: actualProgress, // ✅ Actual progress from UserCourseProgress
          duration: e.course.duration || '4 أسابيع',
          enrolledAt: progressRecord?.enrolledAt || e.enrolledAt,
          completedVideos: progressRecord?.completedVideos?.length || 0,
          completedExams: progressRecord?.completedExams?.length || 0,
          totalVideos: e.course.videos?.length || 0,
          totalExams: e.course.exams?.length || 0
        };
      });
    
    // 3. Get exam results (prefer ExamResult over ExamSubmission for more complete data)
    const examResultsData = await ExamResult.find({ studentId })
      .populate('courseId')
      .sort({ submittedAt: -1 })
      .lean();
    
    // Also get ExamSubmission as fallback if ExamResult doesn't have all data
    const submissions = await ExamSubmission.find({ studentId })
      .populate('courseId')
      .sort({ submittedAt: -1 })
      .lean();
    
    // 4. Process exam results with ranking - use ExamResult first, then ExamSubmission
    const examResults = [];
    const processedExamKeys = new Set(); // Track processed exams to avoid duplicates
    
    // Process ExamResult entries (preferred source)
    for (const result of examResultsData) {
      if (!result.courseId) continue;
      
      const examKey = `${result.courseId._id}_${result.examId}`;
      if (processedExamKeys.has(examKey)) continue;
      processedExamKeys.add(examKey);
      
      // Get all results for this exam to calculate rank
      const allResults = await ExamResult.find({
        courseId: result.courseId._id,
        examId: result.examId
      }).sort({ percentage: -1 });
      
      const rank = allResults.findIndex(r => r._id.toString() === result._id.toString()) + 1;
      
      examResults.push({
        examTitle: result.examTitle || 'امتحان',
        title: result.examTitle || 'امتحان',
        courseName: result.courseId.title,
        course: { title: result.courseId.title },
        studentScore: result.score,
        score: result.score,
        totalScore: result.maxScore,
        maxScore: result.maxScore,
        percentage: result.percentage,
        grade: result.grade,
        level: result.level,
        examDate: result.submittedAt,
        submittedAt: result.submittedAt,
        createdAt: result.createdAt,
        rank: rank,
        totalStudents: allResults.length
      });
    }
    
    // Process ExamSubmission entries that don't have ExamResult
    for (const submission of submissions) {
      if (!submission.courseId) continue;
      
      const examKey = `${submission.courseId._id}_${submission.examId}`;
      if (processedExamKeys.has(examKey)) continue;
      processedExamKeys.add(examKey);
      
      // Get all submissions for this exam to calculate rank
      const allSubmissions = await ExamSubmission.find({
        courseId: submission.courseId._id,
        examId: submission.examId
      }).sort({ percentage: -1 });
      
      const rank = allSubmissions.findIndex(s => s._id.toString() === submission._id.toString()) + 1;
      
      examResults.push({
        examTitle: submission.examTitle || 'امتحان',
        title: submission.examTitle || 'امتحان',
        courseName: submission.courseId.title,
        course: { title: submission.courseId.title },
        studentScore: submission.score,
        score: submission.score,
        totalScore: submission.maxScore,
        maxScore: submission.maxScore,
        percentage: submission.percentage,
        grade: submission.grade,
        level: submission.level,
        examDate: submission.submittedAt,
        submittedAt: submission.submittedAt,
        createdAt: submission.createdAt,
        rank: rank,
        totalStudents: allSubmissions.length
      });
    }
    
    // Sort all results by date (most recent first)
    examResults.sort((a, b) => new Date(b.examDate || 0) - new Date(a.examDate || 0));
    
    // 5. Calculate statistics from actual data
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(c => c.status === 'completed').length;
    
    // Calculate average grade from exam results
    const averageGrade = examResults.length > 0
      ? Math.round(examResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / examResults.length)
      : 0;
    
    // Calculate overall progress across all courses
    const overallProgress = enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
      : 0;
    
    // 6. Build response (compatible with frontend expectations)
    const response = {
      success: true,
      student: {
        _id: student._id,
        firstName: student.firstName,
        secondName: student.secondName,
        name: `${student.firstName} ${student.secondName}`,
        email: student.email,
        studentId: student.studentId,
        grade: student.grade,
        section: student.section
      },
      statistics: {
        totalCourses,
        completedCourses,
        averageGrade,
        overallProgress, // ✅ Overall progress across all courses
        attendanceRate: 0 // يمكن حسابه لاحقاً
      },
      enrolledCourses,
      examResults,
      recentActivity: [], // يمكن إضافتها لاحقاً
      progressCharts: {
        gradeProgression: [],
        subjectDistribution: [],
        completionRates: [
          {
            name: 'مكتمل',
            value: completedCourses,
            color: '#10B981'
          },
          {
            name: 'قيد التقدم',
            value: totalCourses - completedCourses,
            color: '#F59E0B'
          }
        ],
        attendanceChart: []
      },
      // Also include 'charts' for compatibility
      charts: {
        gradeProgression: [],
        subjectDistribution: [],
        completionRates: [
          {
            name: 'مكتمل',
            value: completedCourses,
            color: '#10B981'
          },
          {
            name: 'قيد التقدم',
            value: totalCourses - completedCourses,
            color: '#F59E0B'
          }
        ],
        attendanceChart: []
      },
      // Include data wrapper for compatibility
      data: {
        student: {
          _id: student._id,
          firstName: student.firstName,
          secondName: student.secondName,
          name: `${student.firstName} ${student.secondName}`,
          email: student.email,
          studentId: student.studentId,
          grade: student.grade,
          section: student.section
        },
        statistics: {
          totalCourses,
          completedCourses,
          averageGrade,
          overallProgress, // ✅ Overall progress across all courses
          attendanceRate: 0
        },
        enrolledCourses,
        examResults,
        recentActivity: [],
        charts: {
          gradeProgression: [],
          subjectDistribution: [],
          completionRates: [
            {
              name: 'مكتمل',
              value: completedCourses,
              color: '#10B981'
            },
            {
              name: 'قيد التقدم',
              value: totalCourses - completedCourses,
              color: '#F59E0B'
            }
          ],
          attendanceChart: []
        }
      }
    };
    
    console.log('✅ Student stats retrieved successfully');
    console.log(`📊 Summary: ${totalCourses} courses, ${completedCourses} completed, ${examResults.length} exam results, avg grade: ${averageGrade}%`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student statistics'
    });
  }
});

module.exports = router;