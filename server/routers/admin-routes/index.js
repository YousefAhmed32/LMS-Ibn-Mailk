const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin-controller');
const createCourse = require('../../controllers/admin-controller/createCourse');
const updateCourse = require('../../controllers/admin-controller/updateCourse');
const adminPaymentController = require('../../controllers/payment-controller/adminPaymentController');
const videoManagementController = require('../../controllers/admin-controller/videoManagementController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');
const { validateCourseCreation, handleValidationErrors } = require('../../middleware/courseValidation');
const { uploadSingle } = require('../../utils/unifiedGridfsUpload');
const Course = require('../../models/Course');

// Apply authentication and admin role middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== ANALYTICS ROUTES ====================

// Get comprehensive analytics
router.get('/analytics', adminController.getAnalytics);

// Get dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Get notifications
router.get('/notifications', adminController.getNotifications);

// Get specific analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/courses', adminController.getCourseAnalytics);
router.get('/analytics/payments', adminController.getPaymentAnalytics);
router.get('/analytics/activity', adminController.getActivityAnalytics);

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users with filters and pagination
router.get('/users', adminController.getAllUsers);

// Get single user details
router.get('/users/:id', adminController.getUserById);

// Create new user
router.post('/users', adminController.createUser);

// Update existing user
router.put('/users/:id', adminController.updateUser);

// Update user role
router.put('/users/:id/role', adminController.updateUserRole);

// Delete user
router.delete('/users/:id', adminController.deleteUser);

// Parent account approval
router.put('/users/:userId/approve', adminController.approveParentAccount);
router.put('/users/:userId/reject', adminController.rejectParentAccount);

// Export users to CSV
router.get('/users/export', adminController.exportUsers);

// Get user courses
router.get('/users/:id/courses', adminController.getUserCourses);

// Get user grades
router.get('/users/:id/grades', adminController.getUserGrades);

// Get user activities
router.get('/users/:id/activities', adminController.getUserActivities);

// ==================== COURSE MANAGEMENT ROUTES ====================

// Get all courses with enrollment data
router.get('/courses', adminController.getAllCourses);

// Get course details with enrolled students
router.get('/courses/:id', adminController.getCourseById);

// Create new course
router.post('/courses', 
  authenticateToken, 
  requireAdmin, 
  uploadSingle, 
  validateCourseCreation, 
  handleValidationErrors, 
  createCourse
);

// Update existing course
router.patch('/courses/:id', 
  authenticateToken, 
  requireAdmin, 
  uploadSingle, 
  validateCourseCreation, 
  handleValidationErrors, 
  updateCourse
);

// Toggle course status (simplified endpoint)
router.patch('/courses/:id/status', 
  authenticateToken, 
  requireAdmin, 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Validate isActive
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const course = await Course.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: isActive ? 'Course activated successfully' : 'Course deactivated successfully',
        data: { isActive: course.isActive }
      });
    } catch (error) {
      console.error('Error toggling course status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle course status',
        error: error.message
      });
    }
  }
);

// Delete course
router.delete('/courses/:id', adminController.deleteCourse);

// ==================== EXAM DRAFT ROUTES ====================

const examDraftController = require('../../controllers/admin-controller/examDraftController');

// Save exam as draft (with examId)
router.patch('/courses/:courseId/exams/:examId/draft', examDraftController.saveExamDraft);

// Create new exam as draft (no examId)
router.patch('/courses/:courseId/exams/draft', examDraftController.saveExamDraft);

// Publish exam (with examId)
router.patch('/courses/:courseId/exams/:examId/publish', examDraftController.publishExam);

// Publish new exam (no examId)
router.patch('/courses/:courseId/exams/publish', examDraftController.publishExam);

// ==================== VIDEO MANAGEMENT ROUTES ====================

// Reorder videos (Drag & Drop)
router.put('/courses/:courseId/videos/reorder', videoManagementController.reorderVideos);

// Schedule video
router.put('/courses/:courseId/videos/:videoId/schedule', videoManagementController.scheduleVideo);

// Change video status
router.put('/courses/:courseId/videos/:videoId/status', videoManagementController.changeVideoStatus);

// Bulk actions on videos
router.put('/courses/:courseId/videos/bulk-action', videoManagementController.bulkActionVideos);

// Publish scheduled video immediately
router.post('/courses/:courseId/videos/:videoId/publish-now', videoManagementController.publishVideoNow);

// Cancel schedule
router.delete('/courses/:courseId/videos/:videoId/schedule', videoManagementController.cancelSchedule);

// ==================== LEGACY VIDEO MANAGEMENT ROUTES ====================

// Get course videos
router.get('/courses/:courseId/videos', adminController.getCourseVideos);

// Add video to course
router.post('/courses/:courseId/videos', adminController.addVideoToCourse);


// Update content order
router.patch('/courses/:courseId/content-order', adminController.updateContentOrder);

// Update video in course
router.patch('/courses/:courseId/videos/:videoId', uploadSingle, adminController.updateVideoInCourse);

// Delete video from course
router.delete('/courses/:courseId/videos/:videoId', adminController.deleteVideoFromCourse);

// Reorder videos in course
router.put('/courses/:courseId/videos/reorder', adminController.reorderVideosInCourse);

// ==================== PAYMENT MANAGEMENT ROUTES ====================

// Get all payments with filters and pagination
router.get('/payments', adminPaymentController.getAllPayments);

// Get payment statistics (must be before /:id route to avoid conflicts)
router.get('/payments/statistics', adminPaymentController.getPaymentStatistics);

// Get payment details
router.get('/payments/:id', adminController.getPaymentById);

// Confirm payment
router.put('/payments/:id/confirm', adminController.confirmPayment);

// Reject payment
router.put('/payments/:id/reject', adminController.rejectPayment);

// ==================== REPORTS & EXPORTS ====================

// Export payments report
router.get('/payments/export', adminController.exportPayments);

// Export courses report
router.get('/courses/export', adminController.exportCourses);

// Generate dashboard report
router.post('/reports/dashboard', adminController.generateDashboardReport);

// Payment proof management routes
router.get("/payment-proofs/pending", authenticateToken, requireAdmin, adminController.getPendingPaymentProofs);
router.patch("/payment-proofs/:id/approve", authenticateToken, requireAdmin, adminController.approvePaymentProof);
router.patch("/payment-proofs/:id/reject", authenticateToken, requireAdmin, adminController.rejectPaymentProof);
router.get("/enrollment-stats", authenticateToken, requireAdmin, adminController.getCourseEnrollmentStats);

// Student course access routes
router.get("/students/:studentId/enrolled-courses", authenticateToken, requireAdmin, adminController.getStudentEnrolledCourses);
router.get("/courses/:courseId/access", authenticateToken, adminController.checkCourseAccess);

// New course approval route
router.post("/approve-payment/:userId/:courseId", authenticateToken, requireAdmin, adminController.approveCourseAccess);

// New order approval route with transaction support
router.post("/orders/:orderId/approve", authenticateToken, requireAdmin, adminController.approveOrder);

// Temporary: Log when old POST endpoint is called (should be removed after debugging)
router.post("/payment-proofs/approve", (req, res) => {
  console.log('🚨 OLD POST ENDPOINT CALLED! This should not happen.');
  console.log('Request body:', req.body);
  console.log('This endpoint should be removed. Use PATCH /payment-proofs/:id/approve instead.');
  res.status(410).json({
    success: false,
    error: "This endpoint has been deprecated. Use PATCH /payment-proofs/:id/approve instead.",
    newEndpoint: "PATCH /api/admin/payment-proofs/:id/approve"
  });
});

router.post("/payment-proofs/reject", (req, res) => {
  console.log('🚨 OLD POST ENDPOINT CALLED! This should not happen.');
  console.log('Request body:', req.body);
  console.log('This endpoint should be removed. Use PATCH /payment-proofs/:id/reject instead.');
  res.status(410).json({
    success: false,
    error: "This endpoint has been deprecated. Use PATCH /payment-proofs/:id/reject instead.",
    newEndpoint: "PATCH /api/admin/payment-proofs/:id/reject"
  });
});

module.exports = router;
