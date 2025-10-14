/**
 * Video Routes - Simplified version
 * Handles course video management with URL and iframe inputs
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  createCourseWithVideos,
  updateCourseWithVideos,
  previewVideo
} = require('../../controllers/course-controller/videoController');

const { 
  authenticateToken, 
  requireAdmin 
} = require('../../middleware/auth');

const {
  configureRateLimit,
  sanitizeInput,
  auditLogger
} = require('../../middleware/security');

// Configure multer for file uploads (for course images)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get rate limiters
const rateLimiters = configureRateLimit();

// Apply security middleware
router.use(sanitizeInput);
router.use(auditLogger);

// Public routes (authenticated users)
router.post('/preview', 
  authenticateToken, 
  rateLimiters.general,
  previewVideo
);

// Admin only routes
router.post('/courses', 
  authenticateToken, 
  requireAdmin,
  rateLimiters.courseCreation,
  upload.single('image'),
  createCourseWithVideos
);

router.put('/courses/:id', 
  authenticateToken, 
  requireAdmin,
  rateLimiters.admin,
  upload.single('image'),
  updateCourseWithVideos
);

module.exports = router;
