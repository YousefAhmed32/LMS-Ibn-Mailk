const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { 
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseContent,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrollmentStatus,
  getMyEnrolledCourses,
  getAllCoursesWithEnrollmentStatus,
  markVideoCompleted,
  getExamDetails
} = require("../../controllers/course-controller");

const { 
  authenticateToken, 
  requireAdmin 
} = require("../../middleware/auth");

const {
  checkEnrollment,
  checkEnrollmentStatus
} = require("../../middleware/enrollment");

const {
  validateCourseCreation,
  validateCourseUpdate,
  handleCourseValidationErrors
} = require("../../middleware/course-validation");

// Configure multer for payment proof uploads (using memory storage for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit - زيادة الحد لحل مشكلة 413
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes (accessible to all authenticated users)
router.get("/", authenticateToken, getAllCourses);
router.get("/with-enrollment-status", authenticateToken, getAllCoursesWithEnrollmentStatus);
router.get("/:id", authenticateToken, getCourseById);
router.get("/:id/content", authenticateToken, checkEnrollment, getCourseContent);

// Student enrollment routes
router.post("/:courseId/enroll", authenticateToken, enrollInCourse);
router.get("/:courseId/enrollment-status", authenticateToken, getEnrollmentStatus);
router.get("/my/enrolled", authenticateToken, getMyEnrolledCourses);

// Video progress routes
router.post("/:courseId/videos/:videoId/complete", authenticateToken, markVideoCompleted);

// Exam routes
router.get("/:courseId/exams/:examId", authenticateToken, getExamDetails);

// Admin only routes
router.post("/", authenticateToken, requireAdmin, createCourse);
router.patch("/:id", authenticateToken, requireAdmin, updateCourse);
router.delete("/:id", authenticateToken, requireAdmin, deleteCourse);

module.exports = router;
