const express = require('express');
const router = express.Router();
const VideoProgress = require('../models/VideoProgress');
const ExamOverride = require('../models/ExamOverride');
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/auth');

// POST /api/exam/check-access - Check if student can access exam
router.post('/check-access', authenticateToken, async (req, res) => {
  try {
    const { studentId, courseId, videoId, examId } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !videoId || !examId) {
      return res.status(400).json({ 
        error: 'Missing required fields: studentId, courseId, videoId, examId' 
      });
    }

    // Get video progress
    const progress = await VideoProgress.findOne({
      studentId,
      courseId,
      videoId
    });

    const percentWatched = progress?.percent || 0;
    const isCompleted = progress?.completed || false;
    const allowed = isCompleted || percentWatched >= 70;

    if (allowed) {
      res.json({
        success: true,
        allowed: true,
        percentWatched,
        message: isCompleted 
          ? 'Video completed! You can proceed to the exam.' 
          : `You have watched ${Math.round(percentWatched)}% of the video. You can proceed to the exam.`
      });
    } else {
      res.json({
        success: true,
        allowed: false,
        percentWatched,
        message: `You have watched only ${Math.round(percentWatched)}% of the video. Complete it first for better exam performance, or confirm to proceed anyway.`
      });
    }

  } catch (error) {
    console.error('Error checking exam access:', error);
    res.status(500).json({ error: 'Failed to check exam access' });
  }
});

// POST /api/exam/override - Log exam override and return exam access

router.post('/override', authenticateToken, async (req, res) => {
  try {
    const { 
      studentId, 
      courseId, 
      videoId, 
      examId, 
      clientPercent,
      userAgent,
      ipAddress
    } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !videoId || !examId) {
      return res.status(400).json({ 
        error: 'Missing required fields: studentId, courseId, videoId, examId' 
      });
    }

    // Get current video progress
    const progress = await VideoProgress.findOne({
      studentId,
      courseId,
      videoId
    });

    const serverPercent = progress?.percent || 0;
    const actualPercent = clientPercent !== undefined ? clientPercent : serverPercent;

    // Create exam override log
    const examOverride = new ExamOverride({
      studentId,
      courseId,
      videoId,
      examId,
      percentWatched: actualPercent,
      serverPercent,
      clientPercent,
      userAgent: userAgent || req.get('User-Agent'),
      ipAddress: ipAddress || req.ip || req.connection.remoteAddress,
      timestamp: new Date()
    });

    await examOverride.save();

    // Generate exam token/URL (you can customize this based on your exam system)
    const examToken = generateExamToken(studentId, courseId, examId);
    const examUrl = `/exam/${examId}?token=${examToken}&student=${studentId}`;

    res.json({
      success: true,
      examAccess: {
        token: examToken,
        url: examUrl,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      },
      override: {
        id: examOverride._id,
        percentWatched: actualPercent,
        timestamp: examOverride.timestamp
      }
    });

  } catch (error) {
    console.error('Error processing exam override:', error);
    res.status(500).json({ error: 'Failed to process exam override' });
  }
});

// GET /api/exam/overrides/:courseId - Get exam overrides for a course (instructor view)
router.get('/overrides/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const overrides = await ExamOverride.find({ courseId })
      .populate('studentId', 'firstName secondName email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ExamOverride.countDocuments({ courseId });

    res.json({
      success: true,
      overrides: overrides.map(override => ({
        id: override._id,
        student: {
          id: override.studentId._id,
          name: `${override.studentId.firstName} ${override.studentId.secondName}`,
          email: override.studentId.email
        },
        videoId: override.videoId,
        examId: override.examId,
        percentWatched: override.percentWatched,
        serverPercent: override.serverPercent,
        clientPercent: override.clientPercent,
        timestamp: override.timestamp,
        userAgent: override.userAgent,
        ipAddress: override.ipAddress
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching exam overrides:', error);
    res.status(500).json({ error: 'Failed to fetch exam overrides' });
  }
});

// GET /api/exam/overrides/student/:studentId - Get exam overrides for a specific student
router.get('/overrides/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const overrides = await ExamOverride.find({ studentId })
      .populate('courseId', 'title subject')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      overrides: overrides.map(override => ({
        id: override._id,
        course: {
          id: override.courseId._id,
          title: override.courseId.title,
          subject: override.courseId.subject
        },
        videoId: override.videoId,
        examId: override.examId,
        percentWatched: override.percentWatched,
        timestamp: override.timestamp
      }))
    });

  } catch (error) {
    console.error('Error fetching student exam overrides:', error);
    res.status(500).json({ error: 'Failed to fetch student exam overrides' });
  }
});

// Helper function to generate exam token
function generateExamToken(studentId, courseId, examId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${studentId}-${courseId}-${examId}-${timestamp}-${random}`).toString('base64');
}

module.exports = router;
