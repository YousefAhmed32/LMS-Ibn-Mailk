const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../../middleware/auth');

// Import controllers
const {
  uploadPaymentProof,
  getStudentPaymentProofs,
  getPaymentProofById,
  getStudentPaymentStats
} = require('../../controllers/payment-controller/enhancedPaymentController');

const {
  createPayPalPayment,
  createStripePayment,
  handlePayPalWebhook,
  handleStripeWebhook,
  getPaymentMethods,
  verifyPaymentStatus
} = require('../../controllers/payment-controller/paymentGatewayController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit - زيادة الحد لحل مشكلة 413
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ==================== STUDENT PAYMENT ROUTES ====================

// Upload payment proof
router.post('/upload-proof', auth, upload.single('proofImage'), uploadPaymentProof);

// Get student's payment proofs
router.get('/my-payments', auth, getStudentPaymentProofs);

// Get specific payment proof
router.get('/my-payments/:id', auth, getPaymentProofById);

// Get student payment statistics
router.get('/my-stats', auth, getStudentPaymentStats);

// ==================== PAYMENT GATEWAY ROUTES ====================

// Get available payment methods
router.get('/methods', getPaymentMethods);

// Create PayPal payment
router.post('/paypal/create', auth, createPayPalPayment);

// Create Stripe payment
router.post('/stripe/create', auth, createStripePayment);

// Verify payment status
router.get('/verify/:paymentId', auth, verifyPaymentStatus);

// ==================== WEBHOOK ROUTES ====================

// PayPal webhook
router.post('/webhooks/paypal', handlePayPalWebhook);

// Stripe webhook
router.post('/webhooks/stripe', handleStripeWebhook);

module.exports = router;
