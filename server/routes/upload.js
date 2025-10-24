const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const path = require("path");

const router = express.Router();
const mongoURI = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";

// Create connection for GridFSBucket usage
let conn;
(async () => {
  try {
    console.log("🔌 Connecting to GridFS...", mongoURI);
    conn = await mongoose.createConnection(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();
    console.log("✅ GridFS connection established");
    console.log("📊 GridFS connection details:", {
      host: conn.host,
      port: conn.port,
      name: conn.name,
      readyState: conn.readyState
    });
  } catch (error) {
    console.error("❌ GridFS connection error:", error.message);
    console.error("❌ GridFS connection stack:", error.stack);
  }
})();

// multer-gridfs-storage config
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    console.log("📁 GridFS file processing:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Validate mime types
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      console.log("❌ Invalid file type:", file.mimetype);
      return Promise.reject(new Error("INVALID_FILE_TYPE"));
    }
    
    const fileConfig = {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "images",
      metadata: { 
        originalName: file.originalname,
        uploadDate: new Date(),
        contentType: file.mimetype
      },
    };
    
    console.log("📁 GridFS file config:", fileConfig);
    return fileConfig;
  },
  options: { useNewUrlParser: true, useUnifiedTopology: true },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB - زيادة الحد لحل مشكلة 413
}).single("image");

// POST upload (public endpoint for testing)
router.post("/image", (req, res) => {
  console.log("📤 GridFS upload request:", {
    method: req.method,
    url: req.originalUrl,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });
  
  upload(req, res, function (err) {
    if (err) {
      console.error("❌ GridFS upload error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ 
          success: false, 
          message: "File too large. Max 10MB." 
        });
      }
      if (err.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid file type. Only jpg, jpeg, png, and webp are allowed." 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: err.message || "Upload error" 
      });
    }
    if (!req.file) {
      console.log("❌ No file provided in GridFS upload");
      return res.status(400).json({ 
        success: false, 
        message: "No file provided." 
      });
    }
    
    // req.file.id is the ObjectId
    const fileId = req.file.id || req.file._id || req.file.gridFsFileId;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/api/image/${fileId.toString()}`;
    
    console.log('📤 GridFS image uploaded successfully:', {
      fileId: fileId.toString(),
      url: imageUrl,
      baseUrl: baseUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
    
    return res.json({
      success: true,
      id: fileId.toString(),
      url: imageUrl,
    });
  });
});

// GET image by id
router.get("/image/:id", async (req, res) => {
  try {
    console.log('🖼️ Requesting image:', req.params.id);
    console.log('🖼️ Request details:', {
      id: req.params.id,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers
    });
    
    if (!conn) {
      console.log('❌ GridFS connection not available');
      return res.status(500).json({ 
        success: false, 
        message: "Database connection not available" 
      });
    }

    console.log('🔍 GridFS connection status:', {
      readyState: conn.readyState,
      host: conn.host,
      port: conn.port,
      name: conn.name
    });

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "images" });
    const id = new ObjectId(req.params.id);
    
    console.log('🔍 Searching for image in database:', {
      id: req.params.id,
      objectId: id,
      bucketName: "images"
    });
    
    const files = await conn.db.collection("images.files").findOne({ _id: id });
    
    if (!files) {
      console.log('❌ Image not found in database:', req.params.id);
      console.log('🔍 Available files in images.files collection:');
      const allFiles = await conn.db.collection("images.files").find({}).limit(5).toArray();
      console.log('📁 Sample files:', allFiles.map(f => ({ id: f._id, filename: f.filename })));
      return res.status(404).json({ 
        success: false, 
        message: "File not found" 
      });
    }

    console.log('✅ Image found in database:', {
      id: req.params.id,
      filename: files.filename,
      contentType: files.contentType,
      size: files.length,
      uploadDate: files.uploadDate
    });

    res.setHeader("Content-Type", files.contentType || "application/octet-stream");
    res.setHeader("Content-Length", files.length);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    
    const downloadStream = bucket.openDownloadStream(id);
    
    downloadStream.on("error", (error) => {
      console.error("❌ Download stream error:", error);
      res.status(404).json({ 
        success: false, 
        message: "File not found" 
      });
    });
    
    downloadStream.on("end", () => {
      console.log('✅ Image download completed:', req.params.id);
    });
    
    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ Image retrieval error:", err);
    console.error("❌ Error stack:", err.stack);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid file ID" 
    });
  }
});

module.exports = router;
