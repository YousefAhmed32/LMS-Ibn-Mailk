const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use disk storage instead of GridFS for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomSuffix}${extension}`;
    cb(null, filename);
  }
});

// Configure multer with disk storage
const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("📁 File received:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    // Additional validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
    }
  }
});

// Upload single image
const uploadSingle = upload.single('image');

// Upload multiple images
const uploadMultiple = upload.array('images', 10);

// Utility function to upload image to GridFS (for programmatic use)
const uploadImageToGridFS = async (file, userId = null) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only jpg, jpeg, png, webp are allowed');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size too large. Maximum 5MB allowed');
    }

    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    // Create GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomSuffix}${extension}`;

    // Create upload stream
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        uploadedBy: userId || 'anonymous',
        uploadDate: new Date(),
        contentType: file.mimetype
      }
    });

    // Handle upload events
    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('GridFS upload error:', error);
        reject(error);
      });

      uploadStream.on('finish', () => {
        const fileId = uploadStream.id;
        // Use consistent URL format
        const baseUrl = process.env.BASE_URL || process.env.CLIENT_URL || '';
        const imageUrl = baseUrl ? `${baseUrl}/api/uploads/${fileId}` : `/api/uploads/${fileId}`;
        
        console.log('✅ Image uploaded to GridFS:', {
          fileId: fileId,
          filename: filename,
          url: imageUrl,
          size: file.size
        });

        resolve({
          success: true,
          fileId: fileId,
          filename: filename,
          url: imageUrl,
          size: file.size,
          originalName: file.originalname
        });
      });

      // Write file buffer to GridFS
      uploadStream.end(file.buffer);
    });

  } catch (error) {
    console.error('GridFS upload error:', error);
    throw error;
  }
};

// Delete image from GridFS
const deleteImageFromGridFS = async (fileId) => {
  try {
    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Convert string ID to ObjectId if needed
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    
    // Delete the file
    await bucket.delete(objectId);
    
    console.log('✅ Image deleted from GridFS:', fileId);
    return { success: true, message: 'File deleted successfully' };

  } catch (error) {
    console.error('GridFS delete error:', error);
    throw error;
  }
};

// Get image from GridFS
const getImageFromGridFS = async (fileId) => {
  try {
    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Convert string ID to ObjectId if needed
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;

    // Return the file stream
    return bucket.openDownloadStream(objectId);

  } catch (error) {
    console.error('GridFS get image error:', error);
    throw error;
  }
};

// Get image info from GridFS
const getImageInfoFromGridFS = async (fileId) => {
  try {
    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Convert string ID to ObjectId if needed
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;

    // Find the file metadata
    const files = await bucket.find({ _id: objectId }).toArray();
    
    if (files.length === 0) {
      throw new Error('File not found');
    }

    return files[0];

  } catch (error) {
    console.error('GridFS get image info error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadImageToGridFS,
  deleteImageFromGridFS,
  getImageFromGridFS,
  getImageInfoFromGridFS
};
