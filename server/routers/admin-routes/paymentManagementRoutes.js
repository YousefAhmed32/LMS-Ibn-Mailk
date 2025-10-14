const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Import controllers
const {
  getAllPaymentProofs,
  getPaymentProofById,
  approvePaymentProof,
  rejectPaymentProof,
  getPaymentStatistics,
  bulkApprovePayments
} = require('../../controllers/admin-controller/paymentManagementController');

// ==================== ADMIN PAYMENT MANAGEMENT ROUTES ====================

// Get all payment proofs with filters
router.get('/payment-proofs', auth, getAllPaymentProofs);

// Get specific payment proof
router.get('/payment-proofs/:id', auth, getPaymentProofById);

// Approve payment proof
router.patch('/payment-proofs/:id/approve', auth, approvePaymentProof);

// Reject payment proof
router.patch('/payment-proofs/:id/reject', auth, rejectPaymentProof);

// Bulk approve payments
router.patch('/payment-proofs/bulk-approve', auth, bulkApprovePayments);

// Get payment statistics
router.get('/payment-statistics', auth, getPaymentStatistics);

module.exports = router;
