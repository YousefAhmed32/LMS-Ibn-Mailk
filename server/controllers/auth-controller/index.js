const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRoleBasedRegistration } = require("../../middleware/roleValidation");
const { normalizeForStorage } = require("../../utils/phoneUtils");

// Generate JWT Token with longer expiry
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '14d' });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    console.log('🚀 Registration request received');
    console.log('📥 Incoming body:', JSON.stringify(req.body, null, 2));
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📱 Phone number field:', req.body.phoneNumber);
    
    const {
      firstName,
      secondName,
      thirdName,
      fourthName,
      phoneNumber,
      password,
      phoneStudent,
      phoneFather,
      phoneMother,
      guardianPhone,
      governorate,
      grade,
      relation,
      role = 'student'
    } = req.body;

    console.log('🔍 Extracted fields:', {
      firstName, secondName, thirdName, fourthName,
      phoneNumber, role, phoneStudent, guardianPhone, governorate, grade, relation
    });

    // Normalize to E.164 for storage and lookup (any country)
    const normalizedPhone = normalizeForStorage(phoneNumber) || phoneNumber.trim().replace(/\s+/g, '');
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      console.log('❌ User already exists with phone number:', normalizedPhone);
      return res.status(400).json({
        success: false,
        error: "User with this phone number already exists"
      });
    }

    // Prepare user data based on role
    const userData = {
      firstName,
      secondName,
      thirdName,
      fourthName,
      phoneNumber: normalizedPhone,
      password, // Will be hashed by pre-save middleware
      role,
      phoneFather,
      phoneMother,
      guardianPhone
    };

    // Add role-specific fields (E.164 for all phone fields)
    if (role === 'student') {
      if (phoneStudent) userData.phoneStudent = normalizeForStorage(phoneStudent) || phoneStudent.trim().replace(/\s+/g, '');
      if (guardianPhone) userData.guardianPhone = normalizeForStorage(guardianPhone) || guardianPhone.trim().replace(/\s+/g, '');
      
      userData.governorate = governorate?.trim();
      userData.grade = grade?.trim();
      
      // Generate unique student ID for students
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      userData.studentId = 'STU' + timestamp + random;
      console.log('📚 Student data prepared:', { 
        phoneStudent: userData.phoneStudent, 
        guardianPhone: userData.guardianPhone,
        governorate: userData.governorate, 
        grade: userData.grade, 
        studentId: userData.studentId 
      });
    } else if (role === 'parent') {
      userData.relation = relation?.trim();
      // Parents don't get studentId
      console.log('👨‍👩‍👧‍👦 Parent data prepared:', { phoneNumber: normalizedPhone, relation: userData.relation });
    }

    console.log('💾 User data to create:', JSON.stringify(userData, null, 2));

    // Create new user
    const newUser = new User(userData);
    await newUser.save();

    console.log('✅ User created successfully with ID:', newUser._id);

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      token
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    
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
        error: "Validation failed",
        message: "Please check the following fields and try again",
        details: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log('❌ Duplicate key error:', field);
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
        details: [{ field, message: `${field} must be unique` }]
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error during registration",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔐 Login attempt started:', {
      timestamp: new Date().toISOString(),
      requestBody: {
        phoneNumber: req.body.phoneNumber ? req.body.phoneNumber.substring(0, 4) + '***' : 'missing',
        password: req.body.password ? '[PROVIDED]' : '[MISSING]',
        passwordLength: req.body.password ? req.body.password.length : 0,
        allFields: Object.keys(req.body),
        hasOtherFields: Object.keys(req.body).filter(k => !['phoneNumber', 'password'].includes(k))
      },
      headers: {
        contentType: req.headers['content-type'],
        userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
      }
    });

    const { phoneNumber, password } = req.body;

    // Validate input
    if (!phoneNumber || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({
        success: false,
        error: "Phone number and password are required",
        details: {
          missingPhoneNumber: !phoneNumber,
          missingPassword: !password
        }
      });
    }

    console.log('🔍 Searching for user with phone number:', phoneNumber);
    
    // Normalize to E.164 for lookup (any country)
    const normalizedPhone = normalizeForStorage(phoneNumber) || phoneNumber.trim().replace(/\s+/g, '');
    const user = await User.findOne({ phoneNumber: normalizedPhone });
    
    if (!user) {
      console.log('❌ Login failed: User not found for phone number:', phoneNumber);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    console.log('✅ User found:', {
      userId: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    // Check password
    console.log('🔐 Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password for user:', phoneNumber);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    console.log('✅ Password valid, generating tokens...');
    
    // Generate access token and refresh token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log('✅ Tokens generated successfully');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    const duration = Date.now() - startTime;
    console.log('🎉 Login successful:', {
      userId: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      duration: `${duration}ms`
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('💥 Login error:', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      requestBody: req.body ? Object.keys(req.body) : 'no body'
    });
    
    // Provide more specific error messages
    if (error.message === 'JWT_SECRET is not configured') {
      return res.status(500).json({
        success: false,
        error: "Server configuration error - JWT secret not set"
      });
    }
    
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({
        success: false,
        error: "Database connection error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Internal server error during login",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current logged-in user
const getCurrentUser = async (req, res) => {
  try {
    console.log('👤 GetCurrentUser: Starting request...');
    
    // Validate that user exists from middleware
    if (!req.user) {
      console.log('❌ GetCurrentUser: No user attached to request');
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    if (!req.userId) {
      console.log('❌ GetCurrentUser: No userId attached to request');
      return res.status(401).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    console.log('✅ GetCurrentUser: User validated:', {
      userId: req.user._id,
      role: req.user.role,
      phoneNumber: req.user.phoneNumber
    });
    
    // User is already fetched by middleware, but let's populate additional data if needed
    let populatedUser = req.user;
    
    // Only populate if user has enrolledCourses or allowedCourses
    if (req.user.enrolledCourses && req.user.enrolledCourses.length > 0) {
      console.log('📚 GetCurrentUser: Populating enrolled courses...');
      populatedUser = await User.findById(req.user._id)
        .populate({
          path: 'enrolledCourses.course',
          select: '_id title slug thumbnail subject grade price'
        })
        .populate({
          path: 'allowedCourses',
          select: '_id title slug thumbnail subject grade price'
        })
        .select('-password'); // Exclude password from response
    }
    
    console.log('✅ GetCurrentUser: Successfully retrieved user data');
    
    return res.status(200).json({
      success: true,
      user: populatedUser
    });

  } catch (error) {
    console.error('💥 GetCurrentUser: Error occurred:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      userId: req.userId,
      hasUser: !!req.user
    });
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'User data validation failed'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.password;
    delete updateData.phoneNumber;
    delete updateData.role;
    delete updateData.enrolledCourses;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error while updating profile"
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching user"
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, grade, governorate } = req.query;
    
    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (grade) filter.grade = grade;
    if (governorate) filter.governorate = governorate;

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching users"
    });
  }
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify the existing token (even if expired, we can still decode it)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Token is expired but we can still decode it
        decoded = jwt.decode(token);
        if (!decoded) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user account is active
    if (user.status && user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        secondName: user.secondName,
        thirdName: user.thirdName,
        fourthName: user.fourthName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        studentId: user.studentId,
        phoneStudent: user.phoneStudent,
        governorate: user.governorate,
        grade: user.grade,
        relation: user.relation,
        linkedStudents: user.linkedStudents,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during token refresh'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  getUserById,
  getAllUsers,
  refreshToken
};