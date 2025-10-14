const express = require('express');
const router = express.Router();
const VideoProgress = require('../models/VideoProgress');
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/auth');

// POST /api/progress/video - Update video progress
router.post('/video', authenticateToken, async (req, res) => {
  try {
    const { 
      studentId, 
      courseId, 
      videoId, 
      currentTime, 
      duration, 
      percent, 
      event,
      timestamp 
    } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !videoId || percent === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: studentId, courseId, videoId, percent' 
      });
    }

    // Find or create progress entry
    let progress = await VideoProgress.findOne({
      studentId,
      courseId,
      videoId
    });

    if (!progress) {
      progress = new VideoProgress({
        studentId,
        courseId,
        videoId,
        progressHistory: [],
        completed: false,
        lastWatchedAt: new Date()
      });
    }

    // Update progress data
    progress.currentTime = currentTime || 0;
    progress.duration = duration || 0;
    progress.percent = Math.min(100, Math.max(0, percent));
    progress.lastWatchedAt = new Date();

    // Add to progress history (keep last 50 entries)
    progress.progressHistory.push({
      timestamp: timestamp || Date.now(),
      percent: progress.percent,
      currentTime: progress.currentTime,
      event: event || 'progress'
    });

    // Keep only last 50 history entries
    if (progress.progressHistory.length > 50) {
      progress.progressHistory = progress.progressHistory.slice(-50);
    }

    // Check for completion (70% threshold)
    if (progress.percent >= 70 && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    res.json({
      success: true,
      progress: {
        percent: progress.percent,
        completed: progress.completed,
        currentTime: progress.currentTime,
        duration: progress.duration,
        lastWatchedAt: progress.lastWatchedAt
      }
    });

  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({ error: 'Failed to update video progress' });
  }
});

// GET /api/progress/course/:courseId/:studentId - Get course progress
router.get('/course/:courseId/:studentId', authenticateToken, async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Get all video progress for this course and student
    const progressEntries = await VideoProgress.find({
      courseId,
      studentId
    });

    // Get course to find total videos
    const course = await Course.findById(courseId).select('videos');
    const totalVideos = course?.videos?.length || 0;

    // Calculate overall progress
    const completedVideosCount = progressEntries.filter(p => p.completed).length;
    const percentComplete = totalVideos > 0 ? (completedVideosCount / totalVideos) * 100 : 0;

    // Get detailed progress for each video
    const videoProgress = progressEntries.map(entry => ({
      videoId: entry.videoId,
      percent: entry.percent,
      completed: entry.completed,
      lastWatchedAt: entry.lastWatchedAt,
      completedAt: entry.completedAt
    }));

    res.json({
      success: true,
      courseProgress: {
        percentComplete: Math.round(percentComplete * 100) / 100,
        completedVideosCount,
        totalVideos,
        videoProgress
      }
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});

// GET /api/progress/student/:studentId - Get all student progress (for instructor dashboard)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all progress entries for this student
    const progressEntries = await VideoProgress.find({ studentId })
      .populate('courseId', 'title subject grade')
      .sort({ lastWatchedAt: -1 });

    // Group by course
    const courseProgress = {};
    progressEntries.forEach(entry => {
      const courseId = entry.courseId._id.toString();
      if (!courseProgress[courseId]) {
        courseProgress[courseId] = {
          course: {
            _id: entry.courseId._id,
            title: entry.courseId.title,
            subject: entry.courseId.subject,
            grade: entry.courseId.grade
          },
          videos: []
        };
      }
      
      courseProgress[courseId].videos.push({
        videoId: entry.videoId,
        percent: entry.percent,
        completed: entry.completed,
        lastWatchedAt: entry.lastWatchedAt,
        completedAt: entry.completedAt
      });
    });

    // Calculate course-level statistics
    Object.keys(courseProgress).forEach(courseId => {
      const course = courseProgress[courseId];
      const totalVideos = course.videos.length;
      const completedVideos = course.videos.filter(v => v.completed).length;
      course.totalVideos = totalVideos;
      course.completedVideos = completedVideos;
      course.percentComplete = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    });

    res.json({
      success: true,
      studentProgress: {
        studentId,
        courses: Object.values(courseProgress),
        totalCourses: Object.keys(courseProgress).length
      }
    });

  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
});

// GET /api/progress/video/:videoId/:studentId - Get specific video progress
router.get('/video/:videoId/:studentId', authenticateToken, async (req, res) => {
  try {
    const { videoId, studentId } = req.params;

    const progress = await VideoProgress.findOne({
      videoId,
      studentId
    });

    if (!progress) {
      return res.json({
        success: true,
        progress: {
          percent: 0,
          completed: false,
          currentTime: 0,
          duration: 0,
          lastWatchedAt: null
        }
      });
    }

    res.json({
      success: true,
      progress: {
        percent: progress.percent,
        completed: progress.completed,
        currentTime: progress.currentTime,
        duration: progress.duration,
        lastWatchedAt: progress.lastWatchedAt,
        completedAt: progress.completedAt,
        progressHistory: progress.progressHistory.slice(-10) // Last 10 entries
      }
    });

  } catch (error) {
    console.error('Error fetching video progress:', error);
    res.status(500).json({ error: 'Failed to fetch video progress' });
  }
});

module.exports = router;
