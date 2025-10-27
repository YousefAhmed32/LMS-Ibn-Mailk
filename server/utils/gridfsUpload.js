const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const path = require('path');

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URL || 'mongodb://localhost:27017/lms_media',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`,
      metadata: {
        originalName: file.originalname,
        uploadedBy: req.user?._id || 'anonymous',
        uploadDate: new Date(),
        contentType: file.mimetype
      }
    };
  }
});

// Configure multer with GridFS storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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

// Upload image utility function
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

    // Generate unique filename
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    
    // Create GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

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
        const imageUrl = `/api/uploads/${filename}`;
        
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
const deleteImageFromGridFS = async (filename) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Find the file by filename
    const files = await bucket.find({ filename }).toArray();
    
    if (files.length === 0) {
      throw new Error('File not found');
    }

    // Delete the file
    await bucket.delete(files[0]._id);
    
    console.log('✅ Image deleted from GridFS:', filename);
    return { success: true, message: 'File deleted successfully' };

  } catch (error) {
    console.error('GridFS delete error:', error);
    throw error;
  }
};

// Get image from GridFS
const getImageFromGridFS = async (filename) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Find the file by filename
    const files = await bucket.find({ filename }).toArray();
    
    if (files.length === 0) {
      throw new Error('File not found');
    }

    // Return the file stream
    return bucket.openDownloadStreamByName(filename);

  } catch (error) {
    console.error('GridFS get image error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadImageToGridFS,
  deleteImageFromGridFS,
  getImageFromGridFS
};
