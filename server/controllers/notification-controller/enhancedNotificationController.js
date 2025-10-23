const Notification = require('../../models/Notification');
const User = require('../../models/User');

/**
 * Enhanced Notification Controller
 * Handles all notification operations with real-time features
 */

// Get user notifications with pagination and filtering
const getUserNotifications = async (req, res) => {
  try {
    console.log('🔔 Getting user notifications...');
    console.log('User ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        message: 'Please log in to access notifications',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }
    
    const userId = req.user._id;
    const {
      page = 1,
      limit = 20,
      type = 'all',
      read = 'all',
      category = 'all'
    } = req.query;

    console.log('Query params:', { page, limit, type, read, category });

    const result = await Notification.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      read,
      category
    });

    console.log('✅ Notifications fetched successfully:', result.notifications.length);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching notifications',
      message: 'An error occurred while fetching notifications',
      code: 'FETCH_NOTIFICATIONS_ERROR',
      details: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    // console.log('🔔 Getting unread count...');
    // console.log('User ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
        message: 'Please log in to access notifications',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }
    
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    console.log('✅ Unread count fetched successfully:', count);

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching unread count',
      message: 'An error occurred while fetching unread count',
      code: 'FETCH_UNREAD_COUNT_ERROR',
      details: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        message: 'The requested notification does not exist',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while marking notification as read',
      message: 'An error occurred while updating notification',
      code: 'MARK_AS_READ_ERROR'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while marking all notifications as read',
      message: 'An error occurred while updating notifications',
      code: 'MARK_ALL_AS_READ_ERROR'
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        message: 'The requested notification does not exist',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting notification',
      message: 'An error occurred while deleting notification',
      code: 'DELETE_NOTIFICATION_ERROR'
    });
  }
};

// Create notification (for admin/system use)
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data = {},
      priority = 'medium',
      category = 'system',
      relatedId,
      relatedModel,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'userId, type, title, and message are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'The specified user does not exist',
        code: 'USER_NOT_FOUND'
      });
    }

    const notificationData = {
      userId,
      type,
      title,
      message,
      data,
      priority,
      category,
      expiresAt
    };

    if (relatedId) notificationData.relatedId = relatedId;
    if (relatedModel) notificationData.relatedModel = relatedModel;

    const notification = await Notification.createNotification(notificationData);

    // Emit real-time notification via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        category: notification.category,
        createdAt: notification.createdAt,
        data: notification.data,
        expiresAt: notification.expiresAt
      });
      console.log(`🔔 Notification emitted to user ${userId}:`, notification.title);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating notification',
      message: 'An error occurred while creating notification',
      code: 'CREATE_NOTIFICATION_ERROR'
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    }).populate('relatedId', 'title name firstName secondName');

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
        message: 'The requested notification does not exist',
        code: 'NOTIFICATION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Get notification by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching notification',
      message: 'An error occurred while fetching notification details',
      code: 'FETCH_NOTIFICATION_ERROR'
    });
  }
};

// Bulk operations
const bulkMarkAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification IDs',
        message: 'Notification IDs must be provided as an array',
        code: 'INVALID_NOTIFICATION_IDS'
      });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount,
        totalRequested: notificationIds.length
      }
    });

  } catch (error) {
    console.error('Bulk mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while bulk updating notifications',
      message: 'An error occurred while updating notifications',
      code: 'BULK_MARK_AS_READ_ERROR'
    });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification IDs',
        message: 'Notification IDs must be provided as an array',
        code: 'INVALID_NOTIFICATION_IDS'
      });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId
    });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      data: {
        deletedCount: result.deletedCount,
        totalRequested: notificationIds.length
      }
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while bulk deleting notifications',
      message: 'An error occurred while deleting notifications',
      code: 'BULK_DELETE_ERROR'
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ['$isExpired', true] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              read: '$read'
            }
          },
          byCategory: {
            $push: {
              category: '$category',
              read: '$read'
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      expired: 0,
      byType: [],
      byCategory: []
    };

    // Process type and category breakdowns
    const typeBreakdown = {};
    const categoryBreakdown = {};

    result.byType.forEach(item => {
      if (!typeBreakdown[item.type]) {
        typeBreakdown[item.type] = { total: 0, unread: 0 };
      }
      typeBreakdown[item.type].total++;
      if (!item.read) typeBreakdown[item.type].unread++;
    });

    result.byCategory.forEach(item => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { total: 0, unread: 0 };
      }
      categoryBreakdown[item.category].total++;
      if (!item.read) categoryBreakdown[item.category].unread++;
    });

    res.json({
      success: true,
      data: {
        total: result.total,
        unread: result.unread,
        read: result.read,
        expired: result.expired,
        typeBreakdown,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching notification statistics',
      message: 'An error occurred while fetching notification statistics',
      code: 'FETCH_NOTIFICATION_STATS_ERROR'
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationById,
  bulkMarkAsRead,
  bulkDelete,
  getNotificationStats
};

