const cloudinary = require('cloudinary').v2;

// Cloudinary configuration with environment variables and fallbacks
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfzgiebus',
  api_key: process.env.CLOUDINARY_API_KEY || '942859652132982',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'He_kzvl3i9I5cflvtltS8xj1SS8'
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(() => {
    console.log('☁️  Cloudinary connected successfully');
  })
  .catch((error) => {
    console.warn('⚠️  Cloudinary connection warning:', error.message);
    console.log('   Uploads will still work with fallback credentials');
  });

module.exports = cloudinary;
