const Joi = require('joi');
const { isValidPhone } = require('../utils/phoneUtils');

// E.164 / international phone validator
const phoneValidator = (value, helpers) => {
  if (!value || typeof value !== 'string') return value;
  if (isValidPhone(value.trim())) return value.trim();
  return helpers.error('any.custom');
};

// Common validation rules (global-ready; no Egypt-only)
const commonFields = {
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must not exceed 50 characters'
  }),
  secondName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Second name is required',
    'string.min': 'Second name must be at least 2 characters',
    'string.max': 'Second name must not exceed 50 characters'
  }),
  thirdName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Third name is required',
    'string.min': 'Third name must be at least 2 characters',
    'string.max': 'Third name must not exceed 50 characters'
  }),
  fourthName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Fourth name is required',
    'string.min': 'Fourth name must be at least 2 characters',
    'string.max': 'Fourth name must not exceed 50 characters'
  }),
  phoneNumber: Joi.string().trim().required().custom(phoneValidator).messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
    'any.custom': 'Please provide a valid international phone number (e.g. +201234567890 or +9665XXXXXXXX)'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  role: Joi.string().valid('student', 'parent', 'admin').default('student').messages({
    'any.only': 'Role must be either student, parent, or admin'
  })
};

// Student-specific validation schema (international phone)
const studentSchema = Joi.object({
  ...commonFields,
  phoneStudent: Joi.string().trim().required().custom(phoneValidator).messages({
    'string.empty': 'Phone number is required for students',
    'any.required': 'Phone number is required for students',
    'any.custom': 'Please provide a valid international phone number'
  }),
  guardianPhone: Joi.string().trim().required().custom(phoneValidator).messages({
    'string.empty': 'Guardian phone number is required for students',
    'any.required': 'Guardian phone number is required for students',
    'any.custom': 'Please provide a valid international guardian phone number'
  }),
  governorate: Joi.string().valid(
    "Cairo", "Giza", "Qalyubia", "Alexandria", "Port Said", "Ismailia",
    "Suez", "Damietta", "Dakahlia", "Sharqia", "Gharbia", "Monufia",
    "Kafr El-Sheikh", "Beheira", "Marsa Matrouh", "Fayoum", "Beni Suef",
    "Minya", "Assiut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea",
    "New Valley", "North Sinai", "South Sinai"
  ).required().messages({
    'string.empty': 'Governorate is required for students',
    'any.only': 'Please select a valid governorate'
  }),
  grade: Joi.string().valid(
    'أولى إعدادي', 'تانية إعدادي', 'تالتة إعدادي',
    'أولى ثانوي', 'تانية ثانوي', 'تالتة ثانوي'
  ).required().messages({
    'string.empty': 'Grade is required for students',
    'any.only': 'Please select a valid grade from the Egyptian school system'
  }),
  // Optional fields for students (international phone)
  phoneFather: Joi.string().trim().optional().allow('').custom((v, helpers) => !v ? v : phoneValidator(v, helpers)).messages({
    'any.custom': 'Please provide a valid international phone number'
  }),
  phoneMother: Joi.string().trim().optional().allow('').custom((v, helpers) => !v ? v : phoneValidator(v, helpers)).messages({
    'any.custom': 'Please provide a valid international phone number'
  })
});

// Parent-specific validation schema (international phone)
const parentSchema = Joi.object({
  ...commonFields,
  phoneNumber: Joi.string().trim().required().custom(phoneValidator).messages({
    'string.empty': 'Phone number is required for parents',
    'any.custom': 'Please provide a valid international phone number'
  }),
  relation: Joi.string().valid(
    'Father', 'Mother', 'Guardian', 'Other', 'father', 'mother', 'guardian', 
    'grandfather', 'grandmother', 'uncle', 'aunt'
  ).required().messages({
    'string.empty': 'Relation is required for parents',
    'any.only': 'Please select a valid relation'
  }),
  // Optional fields for parents (international phone)
  phoneFather: Joi.string().trim().optional().allow('').custom((v, helpers) => !v ? v : phoneValidator(v, helpers)).messages({
    'any.custom': 'Please provide a valid international phone number'
  }),
  phoneMother: Joi.string().trim().optional().allow('').custom((v, helpers) => !v ? v : phoneValidator(v, helpers)).messages({
    'any.custom': 'Please provide a valid international phone number'
  })
});

// Role-aware validation middleware
const validateRoleBasedRegistration = (req, res, next) => {
  console.log('🔍 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
  console.log('📋 Request keys:', Object.keys(req.body));
  console.log('🎭 Role:', req.body.role);
  console.log('📱 PhoneNumber:', req.body.phoneNumber, '| Type:', typeof req.body.phoneNumber);
  console.log('📞 PhoneStudent:', req.body.phoneStudent, '| Type:', typeof req.body.phoneStudent);
  console.log('👨‍👩‍👧 GuardianPhone:', req.body.guardianPhone, '| Type:', typeof req.body.guardianPhone);
  console.log('📍 Governorate:', req.body.governorate, '| Type:', typeof req.body.governorate);
  console.log('📚 Grade:', req.body.grade, '| Type:', typeof req.body.grade, '| Length:', req.body.grade?.length);
  
  const { role } = req.body;
  
  if (!role) {
    return res.status(400).json({
      success: false,
      error: 'Role is required',
      details: [{ field: 'role', message: 'Role must be specified' }]
    });
  }

  let schema;
  let schemaName;
  
  switch (role) {
    case 'student':
      schema = studentSchema;
      schemaName = 'student';
      break;
    case 'parent':
      schema = parentSchema;
      schemaName = 'parent';
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
        details: [{ field: 'role', message: 'Role must be either student or parent' }]
      });
  }

  console.log(`📋 Validating ${schemaName} registration schema`);

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false, // Get all validation errors
    stripUnknown: true // Remove unknown fields
  });

  if (error) {
    console.log('❌ Validation errors:', JSON.stringify(error.details, null, 2));
    
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value || null,
      type: detail.type,
      code: detail.type
    }));

    // Create a more descriptive error message
    const fieldErrors = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
    const errorMessage = `Validation failed for ${schemaName} registration: ${fieldErrors}`;

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: errorMessage,
      details: validationErrors,
      schema: schemaName,
      receivedData: {
        role: req.body.role,
        hasPhoneNumber: !!req.body.phoneNumber,
        phoneNumberValue: req.body.phoneNumber,
        hasGrade: !!req.body.grade,
        gradeValue: req.body.grade,
        hasGovernorate: !!req.body.governorate,
        governorateValue: req.body.governorate,
        hasPhoneStudent: !!req.body.phoneStudent,
        hasGuardianPhone: !!req.body.guardianPhone
      }
    });
  }

  console.log('✅ Validation passed, cleaned data:', JSON.stringify(value, null, 2));
  
  // Replace req.body with validated and cleaned data
  req.body = value;
  next();
};

module.exports = {
  validateRoleBasedRegistration,
  studentSchema,
  parentSchema
};
