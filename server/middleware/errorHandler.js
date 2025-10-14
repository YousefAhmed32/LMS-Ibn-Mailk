/**
 * Centralized Error Handler Middleware
 * Handles all types of errors consistently across the application
 */

const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error Handler:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user',
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
      errorType: 'validation'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data format',
      error: `Invalid ${err.path}: ${err.value}`,
      errorType: 'cast'
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry error',
      error: `A record with this ${field} already exists`,
      errorType: 'duplicate'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      errorType: 'auth'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired - please login again',
      errorType: 'auth'
    });
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      error: 'Maximum file size is 5MB',
      errorType: 'file'
    });
  }

  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: 'Only image files are allowed (JPG, PNG, GIF)',
      errorType: 'file'
    });
  }

  // Handle network/database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: 'Database connection failed',
      errorType: 'connection'
    });
  }

  // Handle aggregation errors
  if (err.message && err.message.includes('aggregation')) {
    return res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: 'Error processing data aggregation',
      errorType: 'database'
    });
  }

  // Default server error
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: isDevelopment ? err.message : 'Something went wrong',
    errorType: 'server',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = errorHandler;
