const Joi = require('joi');

// Common validation rules
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
  phoneNumber: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid Egyptian phone number (format: 01234567890 or +201234567890)'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  role: Joi.string().valid('student', 'parent', 'admin').default('student').messages({
    'any.only': 'Role must be either student, parent, or admin'
  })
};

// Student-specific validation schema
const studentSchema = Joi.object({
  ...commonFields,
  phoneStudent: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).required().messages({
    'string.empty': 'Phone number is required for students',
    'any.required': 'Phone number is required for students',
    'string.pattern.base': 'Please provide a valid Egyptian phone number (format: 01234567890 or +201234567890)'
  }),
  guardianPhone: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).required().messages({
    'string.empty': 'Guardian phone number is required for students',
    'any.required': 'Guardian phone number is required for students',
    'string.pattern.base': 'Please provide a valid Egyptian guardian phone number (format: 01234567890 or +201234567890)'
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
  // Optional fields for students
  phoneFather: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid Egyptian phone number'
  }),
  phoneMother: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid Egyptian phone number'
  })
});

// Parent-specific validation schema
const parentSchema = Joi.object({
  ...commonFields,
  phoneNumber: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).required().messages({
    'string.empty': 'Phone number is required for parents',
    'string.pattern.base': 'Please provide a valid Egyptian phone number'
  }),
  relation: Joi.string().valid(
    'Father', 'Mother', 'Guardian', 'Other', 'father', 'mother', 'guardian', 
    'grandfather', 'grandmother', 'uncle', 'aunt'
  ).required().messages({
    'string.empty': 'Relation is required for parents',
    'any.only': 'Please select a valid relation'
  }),
  // Optional fields for parents
  phoneFather: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid Egyptian phone number'
  }),
  phoneMother: Joi.string().pattern(/^(\+20|0)?1[0125][0-9]{8}$/).optional().allow('').messages({
    'string.pattern.base': 'Please provide a valid Egyptian phone number'
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
