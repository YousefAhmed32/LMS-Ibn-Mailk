const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const notificationController = require('../controllers/notification-controller/enhancedNotificationController');

/**
 * Enhanced Notification Routes
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination and filtering
 * @access  Private
 * @query   page, limit, type, read, category
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
router.get('/stats', notificationController.getNotificationStats);

/**
 * @route   GET /api/notifications/:notificationId
 * @desc    Get notification by ID
 * @access  Private
 */
router.get('/:notificationId', notificationController.getNotificationById);

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:notificationId/read', notificationController.markAsRead);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/bulk-mark-read
 * @desc    Bulk mark notifications as read
 * @access  Private
 * @body    { notificationIds: string[] }
 */
router.patch('/bulk-mark-read', notificationController.bulkMarkAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/bulk-delete
 * @desc    Bulk delete notifications
 * @access  Private
 * @body    { notificationIds: string[] }
 */
router.delete('/bulk-delete', notificationController.bulkDelete);

// Admin-only routes
/**
 * @route   POST /api/notifications/admin/create
 * @desc    Create notification (admin only)
 * @access  Admin only
 * @body    { userId, type, title, message, data?, priority?, category?, relatedId?, relatedModel?, expiresAt? }
 */
router.post('/admin/create', requireAdmin, notificationController.createNotification);

module.exports = router;
