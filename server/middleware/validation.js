const { body, validationResult } = require('express-validator');
const { isValidPhone } = require('../utils/phoneUtils');

const PHONE_MSG = 'Please enter a valid international phone number (e.g. +201234567890)';

// Custom phone validator (E.164 / any country)
const phoneCustom = (value) => {
  if (!value || typeof value !== 'string') return true;
  if (isValidPhone(value.trim())) return true;
  throw new Error(PHONE_MSG);
};

// Validation rules for user registration
const validateRegistration = [
  // Common required fields for all roles
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('secondName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Second name must be between 2 and 50 characters'),
  
  body('thirdName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Third name must be between 2 and 50 characters'),
  
  body('fourthName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Fourth name must be between 2 and 50 characters'),
  
  body('phoneNumber')
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['student', 'admin', 'parent'])
    .withMessage('Role must be either student, admin, or parent'),
  
  // Student-specific fields
  body('phoneStudent')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('governorate')
    .optional()
    .isIn([
      "Cairo", "Giza", "Qalyubia", "Alexandria", "Port Said", "Ismailia",
      "Suez", "Damietta", "Dakahlia", "Sharqia", "Gharbia", "Monufia",
      "Kafr El-Sheikh", "Beheira", "Marsa Matrouh", "Fayoum", "Beni Suef",
      "Minya", "Assiut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea",
      "New Valley", "North Sinai", "South Sinai"
    ])
    .withMessage('Please select a valid governorate'),
  
  body('grade')
    .optional()
    .isIn(['grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12'])
    .withMessage('Please select a valid grade'),
  
  // Parent-specific fields
  body('phoneNumber')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('relation')
    .optional()
    .isIn(['Father', 'Mother', 'Guardian', 'Other', 'father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt'])
    .withMessage('Please select a valid relation'),
  
  // Optional fields
  body('phoneFather')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('phoneMother')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG)
];

// Validation rules for user login
const validateLogin = [
  body('phoneNumber')
    .custom((value) => {
      if (!value || typeof value !== 'string') throw new Error(PHONE_MSG);
      if (isValidPhone(value.trim())) return true;
      throw new Error(PHONE_MSG);
    })
    .withMessage(PHONE_MSG),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for user update
const validateUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('secondName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Second name must be between 2 and 50 characters'),
  
  body('thirdName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Third name must be between 2 and 50 characters'),
  
  body('fourthName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Fourth name must be between 2 and 50 characters'),
  
  body('phoneStudent')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('phoneFather')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('phoneMother')
    .optional()
    .custom(phoneCustom)
    .withMessage(PHONE_MSG),
  
  body('governorate')
    .optional()
    .isIn([
      "Cairo", "Giza", "Qalyubia", "Alexandria", "Port Said", "Ismailia",
      "Suez", "Damietta", "Dakahlia", "Sharqia", "Gharbia", "Monufia",
      "Kafr El-Sheikh", "Beheira", "Marsa Matrouh", "Fayoum", "Beni Suef",
      "Minya", "Assiut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea",
      "New Valley", "North Sinai", "South Sinai"
    ])
    .withMessage('Please select a valid governorate'),
  
  body('grade')
    .optional()
    .isIn(['grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12'])
    .withMessage('Please select a valid grade')
];

// Custom role-based validation middleware
const validateRoleBasedFields = (req, res, next) => {
  const { role } = req.body;
  const errors = [];

  // Student-specific validation
  if (role === 'student') {
    if (!req.body.phoneStudent) {
      errors.push({
        field: 'phoneStudent',
        message: 'Phone number is required for students'
      });
    }
    if (!req.body.governorate) {
      errors.push({
        field: 'governorate',
        message: 'Governorate is required for students'
      });
    }
    if (!req.body.grade) {
      errors.push({
        field: 'grade',
        message: 'Grade is required for students'
      });
    }
  }

  // Parent-specific validation
  if (role === 'parent') {
    if (!req.body.phoneNumber) {
      errors.push({
        field: 'phoneNumber',
        message: 'Phone number is required for parents'
      });
    }
    if (!req.body.relation) {
      errors.push({
        field: 'relation',
        message: 'Relation is required for parents'
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Role-based validation failed',
      details: errors
    });
  }

  next();
};

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateUpdate,
  validateRoleBasedFields,
  handleValidationErrors
};
