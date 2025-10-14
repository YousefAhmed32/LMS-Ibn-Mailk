const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [ip, requests] of rateLimitStore.entries()) {
      const validRequests = requests.filter(time => time > windowStart);
      if (validRequests.length === 0) {
        rateLimitStore.delete(ip);
      } else {
        rateLimitStore.set(ip, validRequests);
      }
    }
    
    // Check current IP
    const requests = rateLimitStore.get(key) || [];
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }
    
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    next();
  };
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware: Starting token verification...');
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth Middleware: Token check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });

    if (!token) {
      console.log('❌ Auth Middleware: No token provided');
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    // Verify token
    console.log('🔐 Auth Middleware: Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('✅ Auth Middleware: Token verified:', {
      userId: decoded.userId,
      tokenType: decoded.type || 'access'
    });
    
    // Validate userId exists and is a valid ObjectId
    if (!decoded.userId) {
      console.log('❌ Auth Middleware: No userId in token payload');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token - missing user ID' 
      });
    }
    
    // Check if user exists and is active
    console.log('🔍 Auth Middleware: Fetching user from database...');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Auth Middleware: User not found:', decoded.userId);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token - user not found' 
      });
    }

    console.log('✅ Auth Middleware: User found:', {
      userId: user._id,
      role: user.role,
      email: user.userEmail || user.email
    });

    // Check if user account is active
    if (user.status && user.status !== 'active') {
      console.log('❌ Auth Middleware: User account deactivated');
      return res.status(401).json({ 
        success: false, 
        error: 'Account is deactivated' 
      });
    }

    // Add user info to request
    req.user = user;
    req.userId = user._id;
    
    console.log('✅ Auth Middleware: Authentication successful');
    next();
  } catch (error) {
    console.error('💥 Auth Middleware: Error occurred:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token format' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired - please login again' 
      });
    }
    if (error.name === 'CastError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid user ID format' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Token verification failed' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is student
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false, 
      error: 'Student access required' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStudent,
  rateLimit
};
