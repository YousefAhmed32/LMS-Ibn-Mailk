// server/controllers/authController.js - Production-ready registration controller
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Normalize incoming payload - handles both userEmail and email
const normalizeRegistrationData = (reqBody) => {
  const normalized = { ...reqBody };
  
  // Map userEmail to email if present (backward compatibility)
  if (normalized.userEmail && !normalized.email) {
    normalized.email = normalized.userEmail;
    delete normalized.userEmail;
  }
  
  // Ensure email is lowercase and trimmed
  if (normalized.email) {
    normalized.email = normalized.email.toLowerCase().trim();
  }
  
  return normalized;
};

// Validate required fields
const validateRequiredFields = (data, role) => {
  const errors = [];
  
  // Common required fields
  const commonRequired = ['firstName', 'secondName', 'thirdName', 'fourthName', 'email', 'password'];
  commonRequired.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Role-specific validation
  if (role === 'student') {
    if (!data.guardianPhone || data.guardianPhone.trim() === '') {
      errors.push('Guardian phone is required for students');
    }
    if (!data.governorate || data.governorate.trim() === '') {
      errors.push('Governorate is required for students');
    }
    if (!data.grade || data.grade.trim() === '') {
      errors.push('Grade is required for students');
    }
  } else if (role === 'parent') {
    if (!data.phoneNumber || data.phoneNumber.trim() === '') {
      errors.push('Phone number is required for parents');
    }
    if (!data.relation || data.relation.trim() === '') {
      errors.push('Relation is required for parents');
    }
  }
  
  return errors;
};

// Register a new user
const registerUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Registration request received:', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });

    // Step 1: Normalize incoming data
    const normalizedData = normalizeRegistrationData(req.body);
    console.log('📥 Normalized data:', {
      email: normalizedData.email ? normalizedData.email.substring(0, 3) + '***@' + normalizedData.email.split('@')[1] : 'missing',
      role: normalizedData.role,
      hasPassword: !!normalizedData.password
    });

    // Step 2: Extract and validate data
    const {
      firstName,
      secondName,
      thirdName,
      fourthName,
      email,
      password,
      phoneStudent,
      phoneNumber,
      phoneFather,
      phoneMother,
      guardianPhone,
      governorate,
      grade,
      relation,
      role = 'student'
    } = normalizedData;

    // Step 3: Validate required fields
    const validationErrors = validateRequiredFields(normalizedData, role);
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check the following fields and try again',
        details: validationErrors.map(error => ({ message: error }))
      });
    }

    // Step 4: Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please enter a valid email address'
      });
    }

    // Step 5: Check for existing user BEFORE attempting to save
    console.log('🔍 Checking for existing user with email:', email);
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      console.log('❌ User already exists:', {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role
      });
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Step 6: Prepare user data
    const userData = {
      firstName: firstName.trim(),
      secondName: secondName.trim(),
      thirdName: thirdName.trim(),
      fourthName: fourthName.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      role,
      phoneFather: phoneFather?.trim(),
      phoneMother: phoneMother?.trim(),
      guardianPhone: guardianPhone?.trim()
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.phoneStudent = phoneStudent?.trim();
      userData.governorate = governorate?.trim();
      userData.grade = grade?.trim();
    } else if (role === 'parent') {
      userData.phoneNumber = phoneNumber?.trim();
      userData.relation = relation?.trim();
    }

    console.log('💾 Creating user with data:', {
      email: userData.email,
      role: userData.role,
      firstName: userData.firstName,
      hasStudentId: !!userData.studentId
    });

    // Step 7: Create and save user
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    console.log('✅ User created successfully:', {
      id: savedUser._id,
      email: savedUser.email,
      role: savedUser.role,
      executionTime: Date.now() - startTime + 'ms'
    });

    // Step 8: Generate token
    const token = generateToken(savedUser._id);

    // Step 9: Prepare response (remove sensitive data)
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
      token,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('💥 Registration error:', {
      error: error.message,
      stack: error.stack,
      executionTime: executionTime + 'ms'
    });

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.log('❌ Mongoose validation errors:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check the following fields and try again',
        details: validationErrors
      });
    }
    
    // Handle duplicate key errors (MongoDB unique constraint violations)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log('❌ Duplicate key error:', field);
      
      let message = 'This value already exists';
      if (field === 'email') {
        message = 'An account with this email already exists';
      } else if (field === 'studentId') {
        message = 'Student ID already exists';
      }
      
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
        message: message,
        details: [{ field, message: `${field} must be unique` }]
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { registerUser };

