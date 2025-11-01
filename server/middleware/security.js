/**
 * Security Middleware
 * Implements Content Security Policy and other security headers for YouTube embedding
 */

const helmet = require('helmet');

/**
 * Configure Content Security Policy for YouTube embedding
 */
function configureCSP() {
  return helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some UI components
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://i.ytimg.com", // YouTube thumbnails
        "https://img.youtube.com", // YouTube thumbnails
        "http://localhost:5000/api/uploads" // GridFS images
      ],
      mediaSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com"
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com"
      ],
      connectSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://www.youtube-nocookie.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  });
}

/**
 * Configure additional security headers
 */
function configureSecurityHeaders() {
  return helmet({
    crossOriginEmbedderPolicy: false, // Allow YouTube iframes
    crossOriginOpenerPolicy: false, // Allow YouTube iframes
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow YouTube resources
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  });
}

/**
 * Rate limiting configuration based on user role
 */
function configureRateLimit() {
  const rateLimit = require('express-rate-limit');
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Create limiters for each role (reused for performance)
  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 5000 : 3000,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
        return true;
      }
      return false;
    }
  });
  
  const studentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 500,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
        return true;
      }
      return false;
    }
  });
  
  const otherRoleLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 300,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
        return true;
      }
      return false;
    }
  });
  
  // Create a middleware function that applies role-based rate limiting
  const createRoleBasedLimiter = () => {
    return (req, res, next) => {
      // Only apply if user is authenticated
      if (!req.user || !req.user.role) {
        return next();
      }
      
      const role = req.user.role.toLowerCase();
      
      if (role === 'admin') {
        return adminLimiter(req, res, next);
      } else if (role === 'student') {
        return studentLimiter(req, res, next);
      } else {
        return otherRoleLimiter(req, res, next);
      }
    };
  };
  
  return {
    // General rate limit - applies to all routes
    general: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 2000 : 300, // Default: 300 requests per 15 min
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for localhost in development
        if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
          return true;
        }
        return false;
      }
    }),
    
    // Role-based rate limit - middleware that applies limits based on user role
    roleBased: createRoleBasedLimiter(),
    
    // Admin rate limit - high limit for admin operations
    admin: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 5000 : 3000, // Admin: 3000 requests per 15 min
      message: {
        success: false,
        error: 'Too many admin requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for localhost in development
        if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
          return true;
        }
        return false;
      }
    }),
    
    // Student rate limit - moderate limit for students
    student: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 1000 : 500, // Student: 500 requests per 15 min
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for localhost in development
        if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
          return true;
        }
        return false;
      }
    }),
    
    // Very strict rate limit for course creation
    courseCreation: rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: isDevelopment ? 100 : 10, // Limit each IP to 10 course creations per hour
      message: {
        success: false,
        error: 'Too many course creation attempts from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    })
  };
}

/**
 * Input sanitization middleware
 */
function sanitizeInput(req, res, next) {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

/**
 * YouTube domain validation middleware
 */
function validateYouTubeDomain(req, res, next) {
  const { videos } = req.body;
  
  if (videos && Array.isArray(videos)) {
    const allowedDomains = [
      'www.youtube.com',
      'youtube.com',
      'youtu.be',
      'www.youtube-nocookie.com',
      'youtube-nocookie.com'
    ];

    for (const video of videos) {
      if (video.input && typeof video.input === 'string') {
        // Check if input contains any disallowed domains
        const hasDisallowedDomain = !allowedDomains.some(domain => 
          video.input.includes(domain)
        );
        
        if (hasDisallowedDomain && (video.input.includes('youtube') || video.input.includes('iframe'))) {
          return res.status(400).json({
            success: false,
            error: 'Only YouTube videos are allowed. Please use YouTube URLs or embed codes.'
          });
        }
      }
    }
  }

  next();
}

/**
 * Audit logging middleware for admin actions
 */
function auditLogger(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log admin actions
    if (req.user && req.user.role === 'admin') {
      const action = {
        userId: req.user._id,
        userEmail: req.user.userEmail,
        action: `${req.method} ${req.originalUrl}`,
        timestamp: new Date(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400
      };

      // Log to console (in production, use proper logging service)
      console.log('🔍 Admin Action:', JSON.stringify(action, null, 2));
      
      // TODO: Store in audit log collection in production
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  configureCSP,
  configureSecurityHeaders,
  configureRateLimit,
  sanitizeInput,
  validateYouTubeDomain,
  auditLogger
};
