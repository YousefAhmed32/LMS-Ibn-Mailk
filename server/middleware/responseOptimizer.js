// Response optimization middleware
const responseOptimizer = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to optimize responses
  res.json = function(data) {
    // Remove unnecessary fields for better performance
    if (data && typeof data === 'object') {
      // Remove null/undefined values
      data = removeNullValues(data);
      
      // Limit array sizes for better performance
      if (Array.isArray(data)) {
        data = data.slice(0, 100); // Limit to 100 items max
      }
      
      // Optimize nested objects
      data = optimizeObject(data);
    }
    
    // Set cache headers for static content
    if (req.path.startsWith('/api/courses') && req.method === 'GET') {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else if (req.path.startsWith('/api/notifications') && req.method === 'GET') {
      res.set('Cache-Control', 'public, max-age=60'); // 1 minute
    } else if (req.path.startsWith('/uploads/')) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
    
    // Set ETag for better caching
    if (data && typeof data === 'object') {
      const etag = generateETag(JSON.stringify(data));
      res.set('ETag', etag);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

// Remove null/undefined values from object
function removeNullValues(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter(item => item !== null && item !== undefined);
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key] = removeNullValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

// Optimize object structure
function optimizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Remove empty arrays and objects
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length === 0) {
      delete obj[key];
    } else if (value && typeof value === 'object' && Object.keys(value).length === 0) {
      delete obj[key];
    } else if (typeof value === 'object') {
      obj[key] = optimizeObject(value);
    }
  }
  
  return obj;
}

// Generate ETag for caching
function generateETag(data) {
  const crypto = require('crypto');
  return `"${crypto.createHash('md5').update(data).digest('hex')}"`;
}

module.exports = responseOptimizer;

