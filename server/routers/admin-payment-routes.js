const express = require('express');
const router = express.Router();
const adminPaymentController = require('../controllers/payment-controller/adminPaymentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Admin Payment Management Routes
 * All routes require admin authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with pagination, filtering, and sorting
 * @access  Admin only
 * @query   page, limit, status, search, sortBy, sortOrder, startDate, endDate
 */
router.get('/', adminPaymentController.getAllPayments);

/**
 * @route   GET /api/admin/payments/statistics
 * @desc    Get payment statistics
 * @access  Admin only
 * @query   period (today, week, month, year, all)
 */
router.get('/statistics', adminPaymentController.getPaymentStatistics);

/**
 * @route   GET /api/admin/payments/export
 * @desc    Export payments data
 * @access  Admin only
 * @query   format (json, csv), status, startDate, endDate
 */
router.get('/export', adminPaymentController.exportPayments);

/**
 * @route   GET /api/admin/payments/:paymentId
 * @desc    Get payment by ID
 * @access  Admin only
 */
router.get('/:paymentId', adminPaymentController.getPaymentById);

/**
 * @route   PUT /api/admin/payments/:paymentId/status
 * @desc    Update payment status (accept/reject)
 * @access  Admin only
 * @body    { status: 'accepted'|'rejected', reason?: string }
 */
router.put('/:paymentId/status', adminPaymentController.updatePaymentStatus);

/**
 * @route   PUT /api/admin/payments/bulk-status
 * @desc    Bulk update payment statuses
 * @access  Admin only
 * @body    { paymentIds: string[], status: 'accepted'|'rejected', reason?: string }
 */
router.put('/bulk-status', adminPaymentController.bulkUpdatePaymentStatuses);

/**
 * @route   DELETE /api/admin/payments/:paymentId
 * @desc    Delete payment (all statuses can be deleted)
 * @access  Admin only
 */
router.delete('/:paymentId', adminPaymentController.deletePayment);

module.exports = router;

