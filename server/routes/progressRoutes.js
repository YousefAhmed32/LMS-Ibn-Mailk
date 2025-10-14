const express = require('express');
const router = express.Router();
const UserCourseProgress = require('../models/UserCourseProgress');
const { authenticateToken } = require('../middleware/auth');

// GET /api/progress/course/:courseId - Get user's progress for a specific course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    console.log('📊 Getting course progress:', { userId, courseId });

    // Clean up any duplicate entries first
    await UserCourseProgress.cleanupProgress(userId, courseId);

    const progress = await UserCourseProgress.getCourseProgress(userId, courseId);

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('❌ Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course progress',
      error: error.message
    });
  }
});

// POST /api/progress/course/:courseId/video/:videoId/complete - Mark video as completed
router.post('/course/:courseId/video/:videoId/complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;
    const { watchPercentage = 100 } = req.body;

    console.log('✅ Marking video as completed:', { userId, courseId, videoId, watchPercentage });

    // Clean up any duplicate entries first
    await UserCourseProgress.cleanupProgress(userId, courseId);

    const progress = await UserCourseProgress.markVideoCompleted(userId, courseId, videoId, watchPercentage);

    res.json({
      success: true,
      message: 'Video marked as completed',
      data: {
        videoId,
        completed: true,
        watchPercentage,
        progressPercentage: progress.overallProgress,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('❌ Error marking video as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark video as completed',
      error: error.message
    });
  }
});

// POST /api/progress/course/:courseId/exam/:examId/complete - Mark exam as completed
router.post('/course/:courseId/exam/:examId/complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;
    const { score = 0, passed = false } = req.body;

    console.log('✅ Marking exam as completed:', { userId, courseId, examId, score, passed });

    const progress = await UserCourseProgress.markExamCompleted(userId, courseId, examId, score, passed);

    res.json({
      success: true,
      message: 'Exam marked as completed',
      data: {
        examId,
        completed: true,
        score,
        passed,
        progressPercentage: progress.overallProgress,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('❌ Error marking exam as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark exam as completed',
      error: error.message
    });
  }
});

// GET /api/progress/course/:courseId/video/:videoId/status - Check if video is completed
router.get('/course/:courseId/video/:videoId/status', authenticateToken, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;

    const isCompleted = await UserCourseProgress.isVideoCompleted(userId, courseId, videoId);

    res.json({
      success: true,
      data: {
        videoId,
        completed: isCompleted
      }
    });
  } catch (error) {
    console.error('❌ Error checking video status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check video status',
      error: error.message
    });
  }
});

// GET /api/progress/course/:courseId/exam/:examId/status - Check if exam is completed
router.get('/course/:courseId/exam/:examId/status', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    const isCompleted = await UserCourseProgress.isExamCompleted(userId, courseId, examId);

    res.json({
      success: true,
      data: {
        examId,
        completed: isCompleted
      }
    });
  } catch (error) {
    console.error('❌ Error checking exam status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check exam status',
      error: error.message
    });
  }
});

// GET /api/progress/user/summary - Get user's progress summary across all courses
router.get('/user/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('📈 Getting user progress summary:', { userId });

    const summary = await UserCourseProgress.getUserProgressSummary(userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error getting user progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress summary',
      error: error.message
    });
  }
});

// DELETE /api/progress/course/:courseId/video/:videoId - Unmark video as completed
router.delete('/course/:courseId/video/:videoId', authenticateToken, async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const userId = req.user._id;

    console.log('🔄 Unmarking video as completed:', { userId, courseId, videoId });

    const progress = await UserCourseProgress.getOrCreateProgress(userId, courseId);
    
    // Remove video from completed list
    progress.completedVideos = progress.completedVideos.filter(v => v.videoId !== videoId);
    
    // Reset completion status if needed
    if (progress.isCompleted) {
      progress.isCompleted = false;
      progress.completedAt = null;
    }
    
    await progress.save();

    res.json({
      success: true,
      message: 'Video unmarked as completed',
      data: {
        videoId,
        completed: false,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('❌ Error unmarking video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unmark video',
      error: error.message
    });
  }
});

// DELETE /api/progress/course/:courseId/exam/:examId - Unmark exam as completed
router.delete('/course/:courseId/exam/:examId', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const userId = req.user._id;

    console.log('🔄 Unmarking exam as completed:', { userId, courseId, examId });

    const progress = await UserCourseProgress.getOrCreateProgress(userId, courseId);
    
    // Remove exam from completed list
    progress.completedExams = progress.completedExams.filter(e => e.examId !== examId);
    
    // Reset completion status if needed
    if (progress.isCompleted) {
      progress.isCompleted = false;
      progress.completedAt = null;
    }
    
    await progress.save();

    res.json({
      success: true,
      message: 'Exam unmarked as completed',
      data: {
        examId,
        completed: false,
        overallProgress: progress.overallProgress
      }
    });
  } catch (error) {
    console.error('❌ Error unmarking exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unmark exam',
      error: error.message
    });
  }
});

// POST /api/progress/exam - Mark exam as completed (simplified endpoint)
router.post('/exam', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.body;
    const userId = req.user._id;

    console.log('=== EXAM COMPLETION REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', req.body);
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('================================');

    // Validate required fields
    if (!courseId || !examId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId and examId'
      });
    }

    const progress = await UserCourseProgress.markExamCompleted(userId, courseId, examId, 0, true);

    console.log('✅ Exam marked as completed, saved progress:', {
      userId: progress.userId,
      courseId: progress.courseId,
      completedExams: progress.completedExams.length,
      overallProgress: progress.overallProgress
    });

    res.json({
      success: true,
      progress: {
        courseId: progress.courseId,
        userId: progress.userId,
        completedVideos: progress.completedVideos,
        completedExams: progress.completedExams,
        overallProgress: progress.overallProgress,
        isCompleted: progress.isCompleted
      }
    });
  } catch (error) {
    console.error('❌ Error marking exam as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark exam as completed',
      error: error.message
    });
  }
});

// DELETE /api/progress/exam - Unmark exam as completed (simplified endpoint)
router.delete('/exam', authenticateToken, async (req, res) => {
  try {
    const { courseId, examId } = req.body;
    const userId = req.user._id;

    console.log('=== EXAM UNMARK REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', req.body);
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('============================');

    // Validate required fields
    if (!courseId || !examId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId and examId'
      });
    }

    const progress = await UserCourseProgress.getOrCreateProgress(userId, courseId);
    
    // Remove exam from completed list
    progress.completedExams = progress.completedExams.filter(e => e.examId !== examId);
    
    // Reset completion status if needed
    if (progress.isCompleted) {
      progress.isCompleted = false;
      progress.completedAt = null;
    }
    
    await progress.save();

    console.log('🔄 Exam unmarked, updated progress:', {
      userId: progress.userId,
      courseId: progress.courseId,
      completedExams: progress.completedExams.length,
      overallProgress: progress.overallProgress
    });

    res.json({
      success: true,
      progress: {
        courseId: progress.courseId,
        userId: progress.userId,
        completedVideos: progress.completedVideos,
        completedExams: progress.completedExams,
        overallProgress: progress.overallProgress,
        isCompleted: progress.isCompleted
      }
    });
  } catch (error) {
    console.error('❌ Error unmarking exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unmark exam',
      error: error.message
    });
  }
});

module.exports = router;
