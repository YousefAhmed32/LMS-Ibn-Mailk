const { body, validationResult } = require('express-validator');

// Validation rules for course creation
const validateCourseCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Course title must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    // ✅ No character limit - users can write as much as they want
,

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject must be between 2 and 50 characters'),

  body('grade')
    .trim()
    .notEmpty()
    .withMessage('Grade is required')
    .isIn(['7', '8', '9', '10', '11', '12'])
    .withMessage('Grade must be one of: 7, 8, 9, 10, 11, 12'),

  body('price')
    .isNumeric()
    .withMessage('Price must be a valid number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a non-negative integer'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be one of: beginner, intermediate, advanced'),

  body('isActive')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value === true || value === 'true';
    })
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  body('videos')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Videos must be an array');
          }
          return true;
        } catch (error) {
          throw new Error('Invalid videos JSON format');
        }
      }
      if (Array.isArray(value)) {
        return true;
      }
      throw new Error('Videos must be an array or valid JSON string');
    }),

  body('exams')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Exams must be an array');
          }
          return true;
        } catch (error) {
          throw new Error('Invalid exams JSON format');
        }
      }
      if (Array.isArray(value)) {
        return true;
      }
      throw new Error('Exams must be an array or valid JSON string');
    })
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = {
  validateCourseCreation,
  handleValidationErrors
};
