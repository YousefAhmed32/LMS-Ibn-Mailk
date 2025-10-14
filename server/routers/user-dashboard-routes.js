const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getRecentCourses,
  getUserProgressOverTime,
  getUserScoreDistribution
} = require('../controllers/user-dashboard-controller');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get user statistics
router.get('/:id/stats', getUserStats);

// Get user's recent courses
router.get('/:id/courses/recent', getRecentCourses);

// Get user's progress over time (for charts)
router.get('/:id/progress-over-time', getUserProgressOverTime);

// Get user's score distribution (for pie chart)
router.get('/:id/score-distribution', getUserScoreDistribution);

module.exports = router;
