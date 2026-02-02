const Course = require('../../models/Course');
const UserCourseProgress = require('../../models/UserCourseProgress');
const ExamResult = require('../../models/ExamResult');
const mongoose = require('mongoose');
const { getYouTubeEmbedUrl } = require('../../utils/videoUtils');

// Get course content for enrolled students
const getCourseContent = async (req, res) => {
  try {
    console.log('=== Get Course Content Request ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user ? 'User exists' : 'No user');
    console.log('Request course:', req.course ? 'Course exists' : 'No course');

    // Validate courseId parameter
    const { id: courseId } = req.params;
    if (!courseId) {
      console.error('❌ Missing courseId parameter');
      return res.status(400).json({
        success: false,
        error: 'Course ID is required',
        code: 'MISSING_COURSE_ID'
      });
    }

    // Validate user from auth middleware
    if (!req.user) {
      console.error('❌ No user found in request (auth middleware failed)');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_USER'
      });
    }

    const userId = req.user._id;
    if (!userId) {
      console.error('❌ No user ID found in authenticated user');
      return res.status(401).json({
        success: false,
        error: 'Invalid user authentication',
        code: 'INVALID_USER_ID'
      });
    }

    // Validate course from enrollment middleware
    if (!req.course) {
      console.error('❌ No course found in request (enrollment middleware failed)');
      return res.status(404).json({
        success: false,
        error: 'Course not found or not accessible',
        code: 'COURSE_NOT_FOUND'
      });
    }

    const course = req.course;
    console.log('✅ Course found:', course.title);

    // Get user progress for this course
    let userProgress = await UserCourseProgress.findOne({
      userId: userId,
      courseId: course._id
    });

    // Get exam results for this course
    const examResults = await ExamResult.find({
      studentId: userId,
      courseId: course._id
    });

    // Create exam results map for quick lookup
    const examResultsMap = {};
    examResults.forEach(result => {
      examResultsMap[result.examId] = result;
    });

    // Prepare course content response
    const courseContent = {
      course: {
        _id: course._id,
        title: course.title || 'Untitled Course',
        description: course.description || '',
        grade: course.grade || '',
        term: course.term || '',
        subject: course.subject || '',
        price: course.price || 0,
        imageUrl: course.imageUrl || '',
        isActive: course.isActive !== false,
        createdBy: course.createdBy
      },
      videos: (course.videos || []).map((video, index) => {
        const videoId = video._id || `video_${index}`;
        const isWatched = userProgress?.completedVideos?.some(
          completed => completed.videoId === videoId
        ) || false;

        return {
          id: videoId,
          title: video.title || `Video ${index + 1}`,
          description: video.description || '',
          url: video.url || '',
          thumbnail: video.thumbnail || '',
          duration: video.duration || 0,
          order: video.order || index,
          watched: isWatched,
          embedUrl: video.url ? convertToEmbedUrl(video.url) : ''
        };
      }).sort((a, b) => (a.order || 0) - (b.order || 0)),
      
      exams: (course.exams || []).map((exam, index) => {
        const examId = exam.id || exam._id || `exam_${index}`;
        const examResult = examResultsMap[examId];
        
        // Calculate total marks from questions
        const totalMarks = exam.questions?.reduce((sum, question) => {
          return sum + (question.points || 1);
        }, 0) || exam.totalMarks || 0;

        return {
          id: examId,
          title: exam.title || `Exam ${index + 1}`,
          description: exam.description || '',
          questionsCount: exam.questions?.length || exam.totalQuestions || 0,
          totalMarks: totalMarks,
          duration: exam.duration || 30,
          passingScore: exam.passingScore || 60,
          questions: exam.questions || [],
          status: examResult ? 'completed' : 'not started',
          result: examResult ? {
            score: examResult.score,
            maxScore: examResult.maxScore,
            percentage: examResult.percentage,
            grade: examResult.grade,
            passed: examResult.passed,
            submittedAt: examResult.submittedAt
          } : null,
          createdAt: exam.createdAt
        };
      }),
      
      progress: {
        progressPercentage: calculateOverallProgress(userProgress, course, examResults),
        watchedVideos: userProgress?.completedVideos?.map(cv => cv.videoId) || [],
        completedExams: examResults.map(er => er.examId) || [],
        totalVideos: course.videos?.length || 0,
        totalExams: course.exams?.length || 0,
        totalScore: examResults.reduce((sum, result) => sum + result.score, 0),
        maxPossibleScore: course.exams?.reduce((sum, exam) => {
          const examMarks = exam.questions?.reduce((qSum, q) => qSum + (q.points || 1), 0) || exam.totalMarks || 0;
          return sum + examMarks;
        }, 0) || 0
      }
    };

    console.log('✅ Course content prepared successfully:', {
      videosCount: courseContent.videos.length,
      examsCount: courseContent.exams.length,
      progressPercentage: courseContent.progress.progressPercentage
    });

    res.status(200).json({
      success: true,
      data: courseContent
    });

  } catch (error) {
    console.error('💥 Error fetching course content:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      courseId: req.params?.id,
      userId: req.user?._id
    });
    
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching course content",
      details: error.message,
      code: 'INTERNAL_ERROR'
    });
  }
};

// Helper: convert any YouTube URL (watch, youtu.be, shorts, embed, params) to embed URL
const convertToEmbedUrl = (url) => {
  if (!url) return '';
  const embedUrl = getYouTubeEmbedUrl(url);
  return embedUrl || url;
};

// Helper function to calculate overall progress
const calculateOverallProgress = (userProgress, course, examResults) => {
  if (!course) return 0;
  
  const totalItems = (course.videos?.length || 0) + (course.exams?.length || 0);
  if (totalItems === 0) return 0;
  
  const completedVideos = userProgress?.completedVideos?.length || 0;
  const completedExams = examResults?.length || 0;
  const completedItems = completedVideos + completedExams;
  
  return Math.round((completedItems / totalItems) * 100);
};

// Mark video as completed
const markVideoCompleted = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;

    console.log('=== Mark Video Completed Request ===');
    console.log('Course ID:', courseId);
    console.log('Video ID:', videoId);
    console.log('User ID:', userId);

    // Validate input
    if (!courseId || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and Video ID are required'
      });
    }

    // Find or create user progress
    let userProgress = await UserCourseProgress.findOne({
      userId: userId,
      courseId: courseId
    });

    if (!userProgress) {
      userProgress = new UserCourseProgress({
        userId: userId,
        courseId: courseId,
        completedVideos: [],
        completedExams: [],
        overallProgress: 0
      });
    }

    // Check if video is already marked as completed
    const existingCompletion = userProgress.completedVideos.find(
      cv => cv.videoId === videoId
    );

    if (!existingCompletion) {
      // Add video to completed list
      userProgress.completedVideos.push({
        videoId: videoId,
        completedAt: new Date(),
        watchPercentage: 100
      });

      // Update overall progress
      const course = await Course.findById(courseId);
      if (course) {
        const totalItems = (course.videos?.length || 0) + (course.exams?.length || 0);
        const completedItems = userProgress.completedVideos.length + userProgress.completedExams.length;
        userProgress.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      }

      await userProgress.save();

      console.log('✅ Video marked as completed:', {
        userId,
        courseId,
        videoId,
        overallProgress: userProgress.overallProgress
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video marked as completed',
      data: {
        videoId: videoId,
        completed: true,
        overallProgress: userProgress.overallProgress
      }
    });

  } catch (error) {
    console.error('Error marking video as completed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while marking video as completed',
      details: error.message
    });
  }
};

// Get exam details
const getExamDetails = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    console.log('=== Get Exam Details Request ===');
    console.log('Course ID:', courseId);
    console.log('Exam ID:', examId);
    console.log('User ID:', userId);

    // Find the course and exam
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const exam = course.exams.find(e => e.id === examId || e._id.toString() === examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Check if user has access to this course
    const user = await require('../../models/User').findById(userId);
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

    // Calculate total marks from questions
    const totalMarks = exam.questions?.reduce((sum, question) => {
      return sum + (question.points || 1);
    }, 0) || exam.totalMarks || 0;

    const examDetails = {
      id: exam.id || exam._id,
      title: exam.title,
      description: exam.description || '',
      questions: exam.questions || [],
      totalQuestions: exam.questions?.length || 0,
      totalMarks: totalMarks,
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      alreadySubmitted: !!existingResult,
      previousResult: existingResult ? {
        score: existingResult.score,
        maxScore: existingResult.maxScore,
        percentage: existingResult.percentage,
        grade: existingResult.grade,
        passed: existingResult.passed,
        submittedAt: existingResult.submittedAt
      } : null
    };

    res.status(200).json({
      success: true,
      data: examDetails
    });

  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching exam details',
      details: error.message
    });
  }
};

module.exports = {
  getCourseContent,
  markVideoCompleted,
  getExamDetails
};

