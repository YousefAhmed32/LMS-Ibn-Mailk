const { body, validationResult } = require('express-validator');

// Validation rules for course creation
const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    // ✅ No character limit - users can write as much as they want
,
  
  body('grade')
    .isIn(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'])
    .withMessage('Please select a valid grade'),
  
  body('term')
    .isIn(['Term 1', 'Term 2'])
    .withMessage('Term must be either "Term 1" or "Term 2"'),
  
  body('subject')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject name must be between 2 and 50 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('videos')
    .isArray({ min: 1 })
    .withMessage('At least one video is required'),
  
  body('videos.*.title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Video title must be between 3 and 100 characters'),
  
  body('videos.*.url')
    .trim()
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  body('videos.*.duration')
    .isInt({ min: 1 })
    .withMessage('Video duration must be at least 1 minute')
];

// Validation rules for course update
const validateCourseUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    // ✅ No character limit - users can write as much as they want
,
  
  body('grade')
    .optional()
    .isIn(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'])
    .withMessage('Please select a valid grade'),
  
  body('term')
    .optional()
    .isIn(['Term 1', 'Term 2'])
    .withMessage('Term must be either "Term 1" or "Term 2"'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject name must be between 2 and 50 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('videos')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one video is required'),
  
  body('videos.*.title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Video title must be between 3 and 100 characters'),
  
  body('videos.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  body('videos.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Video duration must be at least 1 minute')
];

// Middleware to check for validation errors
const handleCourseValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Course validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateCourseCreation,
  validateCourseUpdate,
  handleCourseValidationErrors
};
