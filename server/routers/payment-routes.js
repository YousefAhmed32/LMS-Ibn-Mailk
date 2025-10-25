const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadSingle } = require('../utils/simpleGridfsUpload');
const {
  submitPayment,
  getAllPayments,
  acceptPayment,
  rejectPayment,
  getPaymentStats,
  getStudentPayments
} = require('../controllers/payment-controller/vodafonePaymentController');

// Student routes
router.post('/submit', 
  authenticateToken,
  uploadSingle,
  submitPayment
);

router.get('/my-payments', 
  authenticateToken,
  getStudentPayments
);

// Admin routes
router.get('/admin/all', 
  authenticateToken,
  requireAdmin,
  getAllPayments
);

router.patch('/admin/:paymentId/accept', 
  authenticateToken,
  requireAdmin,
  acceptPayment
);

router.patch('/admin/:paymentId/reject', 
  authenticateToken,
  requireAdmin,
  rejectPayment
);

router.get('/admin/stats', 
  authenticateToken,
  requireAdmin,
  getPaymentStats
);

module.exports = router;
