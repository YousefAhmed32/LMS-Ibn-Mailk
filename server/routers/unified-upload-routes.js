const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { uploadSingle, uploadMultiple } = require("../utils/unifiedGridfsUpload");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/upload/image - Upload single image
router.post("/image", authenticateToken, (req, res) => {
  console.log("📤 GridFS upload request:", {
    method: req.method,
    url: req.originalUrl,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
  });
  
  uploadSingle(req, res, function (err) {
    if (err) {
      console.error("❌ GridFS upload error:", err);
      
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ 
          success: false, 
          message: "File too large. Maximum 5MB allowed.",
          errorType: "FILE_TOO_LARGE"
        });
      }
      
      if (err.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid file type. Only jpg, jpeg, png, and webp are allowed.",
          errorType: "INVALID_FILE_TYPE"
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Upload error",
        errorType: "UPLOAD_ERROR"
      });
    }
    
    if (!req.file) {
      console.log("❌ No file provided in upload");
      return res.status(400).json({ 
        success: false, 
        message: "No file provided.",
        errorType: "NO_FILE"
      });
    }
    
    // req.file now has disk storage properties
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('📤 Image uploaded successfully:', {
      url: imageUrl,
      baseUrl: baseUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
    
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        id: req.file.filename,
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        contentType: req.file.mimetype
      }
    });
  });
});

// POST /api/upload/images - Upload multiple images
router.post("/images", (req, res) => {
  console.log("📤 GridFS multiple upload request:", {
    method: req.method,
    url: req.originalUrl,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });
  
  uploadMultiple(req, res, function (err) {
    if (err) {
      console.error("❌ GridFS multiple upload error:", err);
      
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ 
          success: false, 
          message: "One or more files are too large. Maximum 5MB per file.",
          errorType: "FILE_TOO_LARGE"
        });
      }
      
      if (err.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid file type. Only jpg, jpeg, png, and webp are allowed.",
          errorType: "INVALID_FILE_TYPE"
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Upload error",
        errorType: "UPLOAD_ERROR"
      });
    }
    
    if (!req.files || req.files.length === 0) {
      console.log("❌ No files provided in GridFS multiple upload");
      return res.status(400).json({ 
        success: false, 
        message: "No files provided.",
        errorType: "NO_FILES"
      });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedFiles = req.files.map(file => {
      const fileId = file.id || file._id || file.gridFsFileId;
      return {
        id: fileId.toString(),
        url: `${baseUrl}/api/uploads/${fileId.toString()}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        contentType: file.contentType
      };
    });
    
    console.log('📤 GridFS multiple images uploaded successfully:', {
      count: uploadedFiles.length,
      files: uploadedFiles.map(f => ({ id: f.id, filename: f.filename }))
    });
    
    return res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} images uploaded successfully`,
      data: uploadedFiles
    });
  });
});

// GET /api/uploads/:id - Serve image by ID or filename
router.get("/:id", async (req, res) => {
  try {
    console.log('🖼️ Requesting image:', req.params.id);
    console.log('🖼️ Request details:', {
      id: req.params.id,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    });

    // Ensure MongoDB connection is ready
    if (!mongoose.connection.db) {
      console.log('❌ MongoDB connection not available');
      return res.status(500).json({ 
        success: false, 
        message: "Database connection not available",
        errorType: "DATABASE_ERROR"
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { 
      bucketName: "uploads" 
    });
    
    let files;
    let downloadStream;
    
    // Check if it's a valid ObjectId
    if (ObjectId.isValid(req.params.id)) {
      // Try to find by ObjectId
      const id = new ObjectId(req.params.id);
      
      console.log('🔍 Searching for image by ObjectId:', {
        id: req.params.id,
        objectId: id,
        bucketName: "uploads"
      });
      
      files = await mongoose.connection.db.collection("uploads.files").findOne({ _id: id });
      
      if (files) {
        downloadStream = bucket.openDownloadStream(id);
      }
    }
    
    // If not found by ObjectId, try to find by filename
    if (!files) {
      console.log('🔍 Searching for image by filename:', {
        filename: req.params.id,
        bucketName: "uploads"
      });
      
      files = await mongoose.connection.db.collection("uploads.files").findOne({ filename: req.params.id });
      
      if (files) {
        downloadStream = bucket.openDownloadStreamByName(req.params.id);
      }
    }
    
    if (!files || !downloadStream) {
      console.log('❌ Image not found in database:', req.params.id);
      
      // Log available files for debugging
      const allFiles = await mongoose.connection.db.collection("uploads.files").find({}).limit(5).toArray();
      console.log('📁 Sample files in uploads.files collection:', 
        allFiles.map(f => ({ id: f._id, filename: f.filename }))
      );
      
      return res.status(404).json({ 
        success: false, 
        message: "File not found",
        errorType: "FILE_NOT_FOUND"
      });
    }

    console.log('✅ Image found in database:', {
      id: req.params.id,
      fileId: files._id,
      filename: files.filename,
      contentType: files.contentType,
      size: files.length,
      uploadDate: files.uploadDate
    });

    // Set appropriate headers
    res.setHeader("Content-Type", files.contentType || "application/octet-stream");
    res.setHeader("Content-Length", files.length);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    res.setHeader("ETag", `"${files._id}"`);
    
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    downloadStream.on("error", (error) => {
      console.error("❌ Download stream error:", error);
      if (!res.headersSent) {
        res.status(404).json({ 
          success: false, 
          message: "File not found",
          errorType: "DOWNLOAD_ERROR"
        });
      }
    });
    
    downloadStream.on("end", () => {
      console.log('✅ Image download completed:', req.params.id);
    });
    
    downloadStream.pipe(res);
    
  } catch (err) {
    console.error("❌ Image retrieval error:", err);
    console.error("❌ Error stack:", err.stack);
    
    if (!res.headersSent) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file ID or server error",
        errorType: "SERVER_ERROR"
      });
    }
  }
});

// Handle OPTIONS requests for CORS
router.options("/:id", (req, res) => {
  console.log('🔄 OPTIONS request for image:', req.params.id);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(200).end();
});

module.exports = router;
