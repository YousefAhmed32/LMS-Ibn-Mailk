const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../../middleware/auth');
const { uploadPaymentProof } = require('../../controllers/payment-controller');

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit - زيادة الحد لحل مشكلة 413
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Payment proof upload endpoint
router.post('/payment-proof', authenticateToken, upload.single('paymentImage'), uploadPaymentProof);

module.exports = router;
