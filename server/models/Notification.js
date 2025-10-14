const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'confirmation',           // OTP/confirmation codes
      'payment_submitted',      // Student submits payment
      'payment_approved',       // Admin approves payment
      'payment_rejected',       // Admin rejects payment
      'course_enrolled',        // Student enrolled in course
      'course_activated',       // Course activated for student
      'new_video_added',        // New video added to course
      'new_exam_added',         // New exam added to course
      'course_updated',         // Course content updated
      'system_announcement',    // System-wide announcement
      'general',                // General notification
      'alert'                   // Urgent alerts
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['payment', 'course', 'system', 'announcement', 'confirmation'],
    default: 'system'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Course', 'Payment', 'User', 'OTP']
  },
  // Additional fields for confirmation codes
  confirmationCode: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  // For tracking notification delivery
  deliveredAt: {
    type: Date,
    default: null
  },
  deliveryMethod: {
    type: String,
    enum: ['socket', 'polling', 'both'],
    default: 'socket'
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ confirmationCode: 1, expiresAt: 1 });
NotificationSchema.index({ userId: 1, type: 1, read: 1 });
NotificationSchema.index({ category: 1, createdAt: -1 });

// Virtual for status
NotificationSchema.virtual('status').get(function() {
  if (this.read) return 'read';
  if (this.isExpired) return 'expired';
  return 'unread';
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to check if notification is expired
NotificationSchema.methods.checkExpiration = function() {
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.isExpired = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to create confirmation notification
NotificationSchema.statics.createConfirmationNotification = async function(userId, code, expiresAt, relatedData = {}) {
  const notification = new this({
    userId,
    type: 'confirmation',
    title: 'رمز التحقق',
    message: `رمز التحقق الخاص بك هو: ${code}. هذا الرمز صالح لمدة 10 دقائق.`,
    confirmationCode: code,
    expiresAt,
    priority: 'high',
    category: 'confirmation',
    data: {
      code,
      expiresAt,
      ...relatedData
    }
  });

  return await notification.save();
};

// Static method to get user notifications with pagination
NotificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = 'all',
    read = 'all',
    category = 'all'
  } = options;

  console.log('🔔 getUserNotifications called with:', { userId, options });

  const query = { userId };

  // Add filters
  if (type !== 'all') query.type = type;
  if (read !== 'all') query.read = read === 'read';
  if (category !== 'all') query.category = category;

  const skip = (page - 1) * limit;

  try {
    const notifications = await this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.countDocuments(query);

    console.log('📊 Query results:', { notificationsCount: notifications.length, total });

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('❌ Error in getUserNotifications:', error);
    throw error;
  }
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ 
    userId, 
    read: false,
    isExpired: false 
  });
};

// Static method to mark all as read
NotificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, read: false },
    { 
      read: true, 
      readAt: new Date() 
    }
  );
};

// Static method to create notification
NotificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Pre-save middleware to check expiration
NotificationSchema.pre('save', function(next) {
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.isExpired = true;
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);