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
    conn = await mongoose.createConnection(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).asPromise();
    console.log("✅ GridFS connection established");
  } catch (error) {
    console.error("❌ GridFS connection error:", error.message);
  }
})();

// multer-gridfs-storage config
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    // Validate mime types
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return Promise.reject(new Error("INVALID_FILE_TYPE"));
    }
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "images",
      metadata: { 
        originalName: file.originalname,
        uploadDate: new Date(),
        contentType: file.mimetype
      },
    };
  },
  options: { useNewUrlParser: true, useUnifiedTopology: true },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB - زيادة الحد لحل مشكلة 413
}).single("image");

// POST upload (public endpoint for testing)
router.post("/image", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
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
      return res.status(400).json({ 
        success: false, 
        message: "No file provided." 
      });
    }
    
    // req.file.id is the ObjectId
    const fileId = req.file.id || req.file._id || req.file.gridFsFileId;
    const imageUrl = `http://localhost:${process.env.PORT || 5000}/api/image/${fileId.toString()}`;
    
    console.log('📤 GridFS image uploaded successfully:', {
      fileId: fileId.toString(),
      url: imageUrl,
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
    
    if (!conn) {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection not available" 
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "images" });
    const id = new ObjectId(req.params.id);
    const files = await conn.db.collection("images.files").findOne({ _id: id });
    
    if (!files) {
      console.log('❌ Image not found in database:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "File not found" 
      });
    }

    console.log('✅ Image found in database:', {
      id: req.params.id,
      filename: files.filename,
      contentType: files.contentType,
      size: files.length
    });

    res.setHeader("Content-Type", files.contentType || "application/octet-stream");
    const downloadStream = bucket.openDownloadStream(id);
    
    downloadStream.on("error", (error) => {
      console.error("❌ Download stream error:", error);
      res.status(404).json({ 
        success: false, 
        message: "File not found" 
      });
    });
    
    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ Image retrieval error:", err);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid file ID" 
    });
  }
});

module.exports = router;
