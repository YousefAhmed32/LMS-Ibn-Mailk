const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadSingle, uploadImageToGridFS, getImageFromGridFS, deleteImageFromGridFS } = require('../utils/simpleGridfsUpload');
const mongoose = require('mongoose');

// Upload single image
router.post('/image', authenticateToken, uploadSingle, async (req, res) => {
  try {
    console.log('=== IMAGE UPLOAD REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');
    console.log('================================');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to GridFS
    const result = await uploadImageToGridFS(req.file, req.user?._id);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        filename: result.filename,
        fileId: result.fileId,
        size: result.size,
        originalName: result.originalName
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// Get image by filename
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('=== IMAGE RETRIEVAL REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Filename:', filename);
    console.log('================================');

    // Get image stream from GridFS
    const downloadStream = await getImageFromGridFS(filename);
    
    // Set appropriate headers
    res.set({
      'Content-Type': downloadStream.options?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': `"${filename}"`
    });

    // Pipe the stream to response
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('GridFS stream error:', error);
      if (!res.headersSent) {
        res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }
    });

  } catch (error) {
    console.error('Image retrieval error:', error);
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: 'Image not found',
        error: error.message
      });
    }
  }
});

// Delete image by filename
router.delete('/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('=== IMAGE DELETE REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Filename:', filename);
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('================================');

    // Delete image from GridFS
    await deleteImageFromGridFS(filename);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// Get image info by filename
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not established'
      });
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });

    // Find the file by filename
    const files = await bucket.find({ filename }).toArray();
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const fileInfo = files[0];
    
    res.status(200).json({
      success: true,
      data: {
        filename: fileInfo.filename,
        originalName: fileInfo.metadata?.originalName,
        size: fileInfo.length,
        uploadDate: fileInfo.uploadDate,
        contentType: fileInfo.metadata?.contentType,
        uploadedBy: fileInfo.metadata?.uploadedBy,
        url: `/api/uploads/${filename}`
      }
    });

  } catch (error) {
    console.error('Image info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image info',
      error: error.message
    });
  }
});

module.exports = router;