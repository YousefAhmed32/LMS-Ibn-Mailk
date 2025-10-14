const NotificationService = require('../../services/notificationService');
const Notification = require('../../models/Notification');

// Get notifications for current user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, category, unreadOnly } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      category,
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// Get unread count for current user
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadCount = await NotificationService.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read for current user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Create system announcement (Admin only)
const createSystemAnnouncement = async (req, res) => {
  try {
    const { title, message, priority = 'medium' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    await NotificationService.notifySystemAnnouncement(title, message, priority);

    res.json({
      success: true,
      message: 'System announcement created successfully'
    });
  } catch (error) {
    console.error('Error creating system announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system announcement',
      error: error.message
    });
  }
};

// Get all notifications (Admin only)
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, category, userId } = req.query;

    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('userId', 'firstName secondName userEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// Delete notification (Admin only)
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createSystemAnnouncement,
  getAllNotifications,
  deleteNotification
};
