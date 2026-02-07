const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

class NotificationService {
  // Create notification for a specific user
  static async createNotification(userId, notificationData) {
    try {
      const notification = await Notification.createNotification({
        userId,
        ...notificationData
      });

      // Emit real-time notification via Socket.IO
      this.emitNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notification for multiple users
  static async createBulkNotifications(userIds, notificationData) {
    try {
      const notifications = [];
      for (const userId of userIds) {
        const notification = await Notification.createNotification({
          userId,
          ...notificationData
        });
        notifications.push(notification);
        
        // Emit real-time notification
        this.emitNotification(userId, notification);
      }
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Create system-wide notification for all users
  static async createSystemNotification(notificationData) {
    try {
      const users = await User.find({}, '_id');
      const userIds = users.map(user => user._id);
      
      return await this.createBulkNotifications(userIds, {
        ...notificationData,
        category: 'system'
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  // Payment-related notifications
  static async notifyPaymentSubmitted(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('studentId', 'firstName secondName userEmail')
        .populate('courseId', 'title');

      if (!payment) return;

      // Notify student
      await this.createNotification(payment.studentId._id, {
        type: 'payment_submitted',
        title: 'تم إرسال طلب الدفع',
        message: `تم إرسال طلب دفعك لدورة "${payment.courseId.title}" بنجاح. يرجى انتظار موافقة الإدارة.`,
        category: 'payment',
        priority: 'medium',
        relatedId: paymentId,
        relatedModel: 'Payment',
        data: {
          paymentId: paymentId,
          courseId: payment.courseId._id,
          courseTitle: payment.courseId.title,
          amount: payment.amount
        }
      });

      // Notify all admins
      const admins = await User.find({ role: 'admin' }, '_id');
      const adminIds = admins.map(admin => admin._id);

      await this.createBulkNotifications(adminIds, {
        type: 'payment_submitted',
        title: 'طلب دفع جديد',
        message: `طلب دفع جديد من ${payment.studentId.firstName} ${payment.studentId.secondName} لدورة "${payment.courseId.title}"`,
        category: 'payment',
        priority: 'high',
        relatedId: paymentId,
        relatedModel: 'Payment',
        data: {
          paymentId: paymentId,
          studentId: payment.studentId._id,
          studentName: `${payment.studentId.firstName} ${payment.studentId.secondName}`,
          courseId: payment.courseId._id,
          courseTitle: payment.courseId.title,
          amount: payment.amount
        }
      });
    } catch (error) {
      console.error('Error notifying payment submission:', error);
    }
  }

  static async notifyPaymentApproved(paymentId) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('studentId', 'firstName secondName userEmail')
        .populate('courseId', 'title')
        .populate('acceptedBy', 'firstName secondName');

      if (!payment) return;

      await this.createNotification(payment.studentId._id, {
        type: 'payment_approved',
        title: 'تم الموافقة على الدفع',
        message: `تم الموافقة على دفعك لدورة "${payment.courseId.title}" ويمكنك الآن الوصول للمحتوى`,
        category: 'payment',
        priority: 'high',
        relatedId: paymentId,
        relatedModel: 'Payment',
        data: {
          paymentId: paymentId,
          courseId: payment.courseId._id,
          courseTitle: payment.courseId.title,
          amount: payment.amount,
          approvedBy: payment.acceptedBy ? `${payment.acceptedBy.firstName} ${payment.acceptedBy.secondName}` : 'الإدارة'
        }
      });
    } catch (error) {
      console.error('Error notifying payment approval:', error);
    }
  }

  static async notifyPaymentRejected(paymentId, reason = '') {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('studentId', 'firstName secondName userEmail')
        .populate('courseId', 'title')
        .populate('rejectedBy', 'firstName secondName');

      if (!payment) return;

      await this.createNotification(payment.studentId._id, {
        type: 'payment_rejected',
        title: 'تم رفض الدفع',
        message: `تم رفض طلب دفعك لدورة "${payment.courseId.title}". ${reason ? `السبب: ${reason}` : 'يرجى التواصل مع الإدارة'}`,
        category: 'payment',
        priority: 'high',
        relatedId: paymentId,
        relatedModel: 'Payment',
        data: {
          paymentId: paymentId,
          courseId: payment.courseId._id,
          courseTitle: payment.courseId.title,
          amount: payment.amount,
          reason: reason,
          rejectedBy: payment.rejectedBy ? `${payment.rejectedBy.firstName} ${payment.rejectedBy.secondName}` : 'الإدارة'
        }
      });
    } catch (error) {
      console.error('Error notifying payment rejection:', error);
    }
  }

  // Course-related notifications
  static async notifyNewVideoAdded(courseId, videoTitle) {
    try {
      const course = await Course.findById(courseId);
      if (!course) return;

      // Get all enrolled students
      const enrolledStudents = await User.find({
        'enrolledCourses.courseId': courseId,
        'enrolledCourses.paymentStatus': 'approved'
      }, '_id');

      const studentIds = enrolledStudents.map(student => student._id);

      if (studentIds.length > 0) {
        await this.createBulkNotifications(studentIds, {
          type: 'new_video_added',
          title: 'فيديو جديد',
          message: `تم إضافة فيديو جديد "${videoTitle}" إلى دورة "${course.title}"`,
          category: 'course',
          priority: 'medium',
          relatedId: courseId,
          relatedModel: 'Course',
          data: {
            courseId: courseId,
            courseTitle: course.title,
            videoTitle: videoTitle
          }
        });
      }
    } catch (error) {
      console.error('Error notifying new video:', error);
    }
  }

  static async notifyNewExamAdded(courseId, examTitle) {
    try {
      const course = await Course.findById(courseId);
      if (!course) return;

      // Get all enrolled students
      const enrolledStudents = await User.find({
        'enrolledCourses.courseId': courseId,
        'enrolledCourses.paymentStatus': 'approved'
      }, '_id');

      const studentIds = enrolledStudents.map(student => student._id);

      if (studentIds.length > 0) {
        await this.createBulkNotifications(studentIds, {
          type: 'new_exam_added',
          title: 'اختبار جديد',
          message: `تم إضافة اختبار جديد "${examTitle}" إلى دورة "${course.title}"`,
          category: 'course',
          priority: 'medium',
          relatedId: courseId,
          relatedModel: 'Course',
          data: {
            courseId: courseId,
            courseTitle: course.title,
            examTitle: examTitle
          }
        });
      }
    } catch (error) {
      console.error('Error notifying new exam:', error);
    }
  }

  static async notifyCourseActivated(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) return;

      await this.createNotification(userId, {
        type: 'course_activated',
        title: 'Course Activated',
        message: '✅ Your course has been successfully activated. You can now start learning.',
        category: 'course',
        priority: 'high',
        relatedId: courseId,
        relatedModel: 'Course',
        data: {
          courseId: courseId,
          courseTitle: course.title
        }
      });
    } catch (error) {
      console.error('Error notifying course activation:', error);
    }
  }

  // System notifications
  static async notifySystemAnnouncement(title, message, priority = 'medium') {
    try {
      await this.createSystemNotification({
        type: 'system_announcement',
        title: title,
        message: message,
        category: 'announcement',
        priority: priority,
        data: {
          announcement: true
        }
      });
    } catch (error) {
      console.error('Error creating system announcement:', error);
    }
  }

  // Emit real-time notification via Socket.IO (non-blocking: does not await save)
  static emitNotification(userId, notification) {
    try {
      const io = global.io;
      if (io) {
        const payload = {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          category: notification.category,
          createdAt: notification.createdAt,
          data: notification.data,
          confirmationCode: notification.confirmationCode,
          expiresAt: notification.expiresAt,
          read: notification.read
        };
        io.to(`user_${userId}`).emit('notification', payload);
        // Update deliveredAt in background so request is not blocked
        setImmediate(() => {
          notification.deliveredAt = new Date();
          notification.save().catch(err => console.error('Error updating deliveredAt:', err));
        });
      }
    } catch (error) {
      setImmediate(() => console.error('Error emitting notification:', error));
    }
  }

  // Emit notification to multiple users (non-blocking)
  static emitBulkNotification(userIds, notification) {
    try {
      const io = global.io;
      if (io) {
        const payload = {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          category: notification.category,
          createdAt: notification.createdAt,
          data: notification.data,
          confirmationCode: notification.confirmationCode,
          expiresAt: notification.expiresAt,
          read: notification.read
        };
        userIds.forEach(userId => io.to(`user_${userId}`).emit('notification', payload));
      }
    } catch (error) {
      setImmediate(() => console.error('Error emitting bulk notification:', error));
    }
  }

  // Emit system-wide announcement (non-blocking)
  static emitSystemAnnouncement(notification) {
    try {
      const io = global.io;
      if (io) {
        io.emit('system_announcement', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          category: notification.category,
          createdAt: notification.createdAt,
          data: notification.data
        });
      }
    } catch (error) {
      setImmediate(() => console.error('Error emitting system announcement:', error));
    }
  }

  // Get notifications for user
  static async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type, category, unreadOnly = false } = options;
      
      let query = { userId };
      
      if (type) query.type = type;
      if (category) query.category = category;
      if (unreadOnly) query.read = false;

      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(userId);

      return {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    try {
      return await Notification.markAllAsRead(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId) {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;
