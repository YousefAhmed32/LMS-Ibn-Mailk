/**
 * YouTube Video Routes
 * Handles course creation and updates with YouTube video processing
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  createCourseWithVideos,
  updateCourseWithVideos,
  addVideoToCourse,
  removeVideoFromCourse,
  reorderCourseVideos,
  previewVideo
} = require('../../controllers/course-controller/youtubeVideoController');

const { 
  authenticateToken, 
  requireAdmin 
} = require('../../middleware/auth');

const {
  configureRateLimit,
  sanitizeInput,
  validateYouTubeDomain,
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
router.use(validateYouTubeDomain);
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

router.post('/courses/:id/videos', 
  authenticateToken, 
  requireAdmin,
  rateLimiters.admin,
  addVideoToCourse
);

router.delete('/courses/:id/videos/:videoId', 
  authenticateToken, 
  requireAdmin,
  rateLimiters.admin,
  removeVideoFromCourse
);

router.patch('/courses/:id/videos/reorder', 
  authenticateToken, 
  requireAdmin,
  rateLimiters.admin,
  reorderCourseVideos
);

module.exports = router;
