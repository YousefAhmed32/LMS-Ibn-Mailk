const mongoose = require('mongoose');
const User = require('../../models/User');
const Course = require('../../models/Course');
const Payment = require('../../models/Payment');
const Notification = require('../../models/Notification');
const { getStudentEnrolledCourses, checkCourseAccess } = require('./courseAccess');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinaryUpload');
const NotificationService = require('../../services/notificationService');

// ==================== ANALYTICS CONTROLLERS ====================

// Get comprehensive analytics with time period support
const getAnalytics = async (req, res) => {
  try {
    const { timePeriod = 'all' } = req.query;
    
    // Calculate date range based on time period
    const dateRange = getDateRange(timePeriod);
    
    // Get users analytics
    const usersAnalytics = await getUserAnalytics(dateRange);
    
    // Get courses analytics
    const coursesAnalytics = await getCourseAnalytics(dateRange);
    
    // Get payments analytics
    const paymentsAnalytics = await getPaymentAnalytics(dateRange);
    
    // Get activity analytics
    const activityAnalytics = await getActivityAnalytics(dateRange);

    // Get recent payment requests
    const recentPaymentRequests = await getRecentPaymentRequests(dateRange);
    
    // Get recent messages
    const recentMessages = await getRecentMessages(dateRange);

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(dateRange);

    const analytics = {
      users: usersAnalytics,
      courses: coursesAnalytics,
      payments: paymentsAnalytics,
      activity: activityAnalytics,
      recentPayments: recentPaymentRequests,
      recentMessages: recentMessages,
      performance: performanceMetrics,
      timePeriod: timePeriod,
      dateRange: dateRange
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Helper function to calculate date range based on time period
const getDateRange = (timePeriod) => {
  const now = new Date();
  let startDate = null;
  
  switch (timePeriod) {
    case '1hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24hours':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      startDate = null;
      break;
  }
  
  return {
    startDate,
    endDate: now,
    timePeriod
  };
};

// Get users analytics with date range support
const getUserAnalytics = async (dateRange) => {
  try {
    let query = {};
    if (dateRange && dateRange.startDate) {
      query.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    
    const totalUsers = await User.countDocuments(query);
    
    // Users by grade
    const usersByGrade = await User.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Users by governorate
    const usersByGovernorate = await User.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$governorate', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // New users trend (last 7 days)
    const newUsersTrend = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return {
      total: totalUsers,
      byGrade: usersByGrade,
      byGovernorate: usersByGovernorate,
      byRole: usersByRole,
      newUsersTrend: newUsersTrend,
      dateRange: dateRange
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

// Get courses analytics with date range support
const getCourseAnalytics = async (dateRange) => {
  try {
    let query = {};
    if (dateRange && dateRange.startDate) {
      query.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    
    const totalCourses = await Course.countDocuments(query);
    
    // Top courses by enrollment (real data)
    const topCourses = await Course.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'enrolledCourses.courseId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          price: 1,
          grade: 1,
          subject: 1,
          enrollmentCount: { $size: '$enrollments' },
          createdAt: 1
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 }
    ]);

    // Courses by grade
    const coursesByGrade = await Course.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Courses by subject
    const coursesBySubject = await Course.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Course creation trend (last 30 days)
    const courseCreationTrend = await Course.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return {
      total: totalCourses,
      topCourses: topCourses,
      byGrade: coursesByGrade,
      bySubject: coursesBySubject,
      creationTrend: courseCreationTrend,
      dateRange: dateRange
    };
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

// Get payments analytics with date range support
const getPaymentAnalytics = async (dateRange) => {
  try {
    let query = {};
    if (dateRange && dateRange.startDate) {
      query.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    
    const totalPayments = await Payment.countDocuments(query);
    
    // Payments by status
    const paymentsByStatus = await Payment.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Total revenue (approved payments only)
    const totalRevenue = await Payment.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Daily revenue trend (last 30 days)
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Payment.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
      { $sort: { count: -1 } }
    ]);

    const pending = paymentsByStatus.find(p => p._id === 'pending')?.count || 0;
    const approved = paymentsByStatus.find(p => p._id === 'approved')?.count || 0;
    const rejected = paymentsByStatus.find(p => p._id === 'rejected')?.count || 0;
    const revenue = totalRevenue[0]?.total || 0;

    return {
      total: totalPayments,
      pending,
      approved,
      rejected,
      revenue,
      monthlyRevenue,
      dailyRevenue,
      paymentMethodDistribution,
      dateRange: dateRange
    };
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    throw error;
  }
};

// Get activity analytics with date range support
const getActivityAnalytics = async (dateRange) => {
  try {
    // Get real activity data from VideoProgress model
    const VideoProgress = require('../../models/VideoProgress');
    
    let query = {};
    if (dateRange && dateRange.startDate) {
      query.lastWatchedAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    
    // Total video views
    const totalViews = await VideoProgress.countDocuments(query);
    
    // Total watch time in hours
    const watchTimeData = await VideoProgress.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { lastWatchedAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      {
        $group: {
          _id: null,
          totalWatchTime: { $sum: '$watchTime' }
        }
      }
    ]);
    
    const watchTime = watchTimeData[0]?.totalWatchTime || 0;
    const watchTimeHours = Math.round(watchTime / 60); // Convert minutes to hours
    
    // Most watched videos
    const mostWatchedVideos = await VideoProgress.aggregate([
      ...(dateRange && dateRange.startDate ? [{ $match: { lastWatchedAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } }] : []),
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$courseId',
          courseTitle: { $first: '$course.title' },
          totalViews: { $sum: 1 },
          totalWatchTime: { $sum: '$watchTime' }
        }
      },
      { $sort: { totalViews: -1 } },
      { $limit: 10 }
    ]);
    
    // Activity trend (last 7 days)
    const activityTrend = await VideoProgress.aggregate([
      {
        $match: {
          lastWatchedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            $lte: new Date()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$lastWatchedAt' },
            month: { $month: '$lastWatchedAt' },
            day: { $dayOfMonth: '$lastWatchedAt' }
          },
          views: { $sum: 1 },
          watchTime: { $sum: '$watchTime' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Recent activity logs
    const recentLogs = await VideoProgress.find(query)
      .populate('userId', 'firstName secondName')
      .populate('courseId', 'title')
      .sort({ lastWatchedAt: -1 })
      .limit(10)
      .lean();
    
    const formattedRecentLogs = recentLogs.map(log => ({
      action: 'Video View',
      course: log.courseId?.title || 'Unknown Course',
      user: log.userId ? `${log.userId.firstName} ${log.userId.secondName}` : 'Unknown User',
      time: log.lastWatchedAt,
      watchTime: log.watchTime
    }));

    return {
      totalViews,
      watchTime: watchTimeHours,
      mostWatchedVideos,
      activityTrend,
      recentLogs: formattedRecentLogs,
      dateRange: dateRange
    };
  } catch (error) {
    console.error('Error fetching activity analytics:', error);
    throw error;
  }
};

// Get performance metrics
const getPerformanceMetrics = async (dateRange) => {
  try {
    // Calculate conversion rate (payments / total users)
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const conversionRate = totalUsers > 0 ? (totalPayments / totalUsers * 100).toFixed(2) : 0;
    
    // Calculate average revenue per user
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const avgRevenuePerUser = totalUsers > 0 ? (totalRevenue[0]?.total || 0) / totalUsers : 0;
    
    // Calculate course completion rate
    const UserCourseProgress = require('../../models/UserCourseProgress');
    const totalEnrollments = await UserCourseProgress.countDocuments();
    const completedCourses = await UserCourseProgress.countDocuments({ isCompleted: true });
    const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments * 100).toFixed(2) : 0;
    
    // Calculate average session duration
    const VideoProgress = require('../../models/VideoProgress');
    const sessionData = await VideoProgress.aggregate([
      {
        $group: {
          _id: '$userId',
          avgSessionTime: { $avg: '$watchTime' }
        }
      },
      {
        $group: {
          _id: null,
          overallAvgSession: { $avg: '$avgSessionTime' }
        }
      }
    ]);
    const avgSessionDuration = sessionData[0]?.overallAvgSession || 0;
    
    // Calculate growth metrics
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lte: now }
    });
    
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { 
        $gte: new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000), 
        $lte: lastMonth 
      }
    });
    
    const userGrowthRate = newUsersLastMonth > 0 ? 
      ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(2) : 0;
    
    return {
      conversionRate: parseFloat(conversionRate),
      avgRevenuePerUser: Math.round(avgRevenuePerUser),
      completionRate: parseFloat(completionRate),
      avgSessionDuration: Math.round(avgSessionDuration),
      userGrowthRate: parseFloat(userGrowthRate),
      totalEnrollments,
      completedCourses,
      dateRange: dateRange
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
};

// Get recent payment requests with date range support
const getRecentPaymentRequests = async (dateRange) => {
  try {
    let query = {};
    if (dateRange && dateRange.startDate) {
      query.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    
    // Get recent payment proofs from user enrollments
    const recentPayments = await User.aggregate([
      {
        $unwind: '$enrolledCourses'
      },
      {
        $match: {
          'enrolledCourses.paymentStatus': { $in: ['pending', 'approved', 'rejected'] },
          ...(dateRange && dateRange.startDate ? { 'enrolledCourses.enrolledAt': { $gte: dateRange.startDate, $lte: dateRange.endDate } } : {})
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          id: '$_id',
          student: { $concat: ['$firstName', ' ', '$secondName'] },
          course: '$course.title',
          amount: '$course.price',
          status: '$enrolledCourses.paymentStatus',
          date: '$enrolledCourses.enrolledAt',
          proofImage: '$enrolledCourses.proofImage'
        }
      },
      {
        $sort: { date: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return recentPayments;
  } catch (error) {
    console.error('Error fetching recent payment requests:', error);
    return [];
  }
};

// Get recent messages with date range support
const getRecentMessages = async (dateRange) => {
  try {
    // In a real application, this would come from a messages/conversations collection
    // For now, returning mock data with date filtering
    const mockMessages = [
      {
        id: 1,
        student: 'أحمد علي',
        message: 'هل يمكنني تغيير موعد الاختبار؟',
        course: 'الرياضيات الصف 7',
        time: new Date().toISOString()
      },
      {
        id: 2,
        student: 'فاطمة حسن',
        message: 'محتوى الدرس الثالث غير واضح',
        course: 'الفيزياء الصف 10',
        time: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        student: 'عمر خليل',
        message: 'أريد إضافة دورة جديدة',
        course: 'الكيمياء الصف 11',
        time: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 4,
        student: 'سارة محمد',
        message: 'مشكلة في تحميل الفيديو',
        course: 'الأحياء الصف 9',
        time: new Date(Date.now() - 10800000).toISOString()
      },
      {
        id: 5,
        student: 'محمد أحمد',
        message: 'استفسار عن الامتحان النهائي',
        course: 'الرياضيات الصف 8',
        time: new Date(Date.now() - 14400000).toISOString()
      }
    ];

    // Filter messages by date range if specified
    if (dateRange && dateRange.startDate) {
      return mockMessages.filter(msg => {
        const msgDate = new Date(msg.time);
        return msgDate >= dateRange.startDate && msgDate <= dateRange.endDate;
      });
    }

    return mockMessages;
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return [];
  }
};

// Get notifications for admin dashboard
const getNotifications = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get notifications from database or generate mock data
    let notifications = [];
    
    try {
      // Try to get real notifications from database
      notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('userId', 'firstName secondName userEmail')
        .lean();
      
      // Format notifications
      notifications = notifications.map(notification => ({
        id: notification._id,
        type: notification.type || 'info',
        title: notification.title || 'إشعار جديد',
        message: notification.message || 'رسالة إشعار',
        userId: notification.userId,
        isRead: notification.isRead || false,
        createdAt: notification.createdAt,
        data: notification.data || {}
      }));
    } catch (dbError) {
      console.warn('Could not fetch notifications from database, using mock data:', dbError.message);
      
      // Fallback to mock data
      notifications = [
        {
          id: 1,
          type: 'payment',
          title: 'طلب دفع جديد',
          message: 'طلب دفع جديد من أحمد علي لمبلغ 200 جنيه',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { amount: 200, student: 'أحمد علي' }
        },
        {
          id: 2,
          type: 'enrollment',
          title: 'اشتراك جديد',
          message: 'اشتراك جديد في دورة الرياضيات من فاطمة حسن',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          data: { course: 'الرياضيات', student: 'فاطمة حسن' }
        },
        {
          id: 3,
          type: 'message',
          title: 'رسالة جديدة',
          message: 'رسالة جديدة من عمر خليل بخصوص دورة الفيزياء',
          isRead: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          data: { course: 'الفيزياء', student: 'عمر خليل' }
        },
        {
          id: 4,
          type: 'system',
          title: 'تحديث النظام',
          message: 'تم تحديث النظام بنجاح - إصدار 2.1',
          isRead: true,
          createdAt: new Date(Date.now() - 10800000).toISOString(),
          data: { version: '2.1' }
        },
        {
          id: 5,
          type: 'course',
          title: 'دورة جديدة',
          message: 'تم إنشاء دورة جديدة: الكيمياء الصف 11',
          isRead: false,
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          data: { course: 'الكيمياء الصف 11' }
        }
      ].slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { grade, governorate, role, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (grade) query.grade = grade;
    if (governorate) query.governorate = governorate;
    if (role) query.role = role;
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { secondName: { $regex: search, $options: 'i' } },
        { thirdName: { $regex: search, $options: 'i' } },
        { fourthName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { phoneStudent: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Debug logging
    console.log(`📊 Admin Users API: Found ${users.length} users (total: ${total})`);
    console.log(`🔍 Query:`, JSON.stringify(query, null, 2));

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get single user details
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ userEmail: userData.userEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user (without password for now, they can set it later)
    const user = new User({
      ...userData,
      password: 'temporary123' // You might want to generate a random password
    });
    
    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// Update existing user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if present
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin or student'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ==================== COURSE MANAGEMENT ====================

// Get all courses with enrollment data
const getAllCourses = async (req, res) => {
  try {
    const { grade, subject, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    // Add video and test counts to each course
    const coursesWithStats = courses.map(course => {
      const videos = course.videos || [];
      const videoCount = videos.length;
      const testCount = 0; // No internal tests, only external exam links
      
      return {
        ...course,
        videoCount,
        testCount,
        totalContent: videoCount + testCount
      };
    });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Get course details with enrolled students
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== ADMIN GET COURSE REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Course ID:', id);
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('================================');
    
    const course = await Course.findById(id);
    console.log('📋 Course found:', course ? 'Yes' : 'No');
    
    if (!course) {
      console.log('❌ Course not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('📊 Course data:', {
      id: course._id,
      title: course.title,
      videosCount: course.videos?.length || 0,
      examsCount: course.exams?.length || 0,
      videos: course.videos?.map(v => ({ title: v.title, url: v.url })) || [],
      exams: course.exams?.map(e => ({ title: e.title, url: e.url })) || []
    });

    // Get enrolled students (mock data for now)
    const enrolledStudents = [];

    const responseData = {
      success: true,
      data: {
        course,
        enrolledStudents
      }
    };

    console.log('✅ Sending course data to frontend');
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching course:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// Create new course
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    // Enhanced logging for debugging
    console.log('=== COURSE CREATION DEBUG ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request file (single):', req.file);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('User from auth:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('================================');
    
    // Handle image upload if present
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        courseData.imageUrl = result.secure_url;
        console.log('Image uploaded to Cloudinary:', result.secure_url);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        // Fallback to local storage
        courseData.imageUrl = `/uploads/${req.file.filename}`;
      }
    }
    
    // Enhanced validation with detailed error messages
    const validationErrors = [];
    
    if (!courseData.title || courseData.title.trim() === '') {
      validationErrors.push('Course title is required');
    }
    
    if (!courseData.subject || courseData.subject.trim() === '') {
      validationErrors.push('Subject is required');
    }
    
    if (!courseData.grade || courseData.grade.trim() === '') {
      validationErrors.push('Grade is required');
    }
    
    if (!courseData.price || isNaN(parseFloat(courseData.price)) || parseFloat(courseData.price) < 0) {
      validationErrors.push('Valid price is required (must be a number >= 0)');
    }
    
    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        receivedData: {
          title: courseData.title,
          subject: courseData.subject,
          grade: courseData.grade,
          price: courseData.price
        }
      });
    }
    
    // Set default values for optional fields
    if (!courseData.description) courseData.description = '';
    if (!courseData.level) courseData.level = 'beginner';
    if (!courseData.duration) courseData.duration = 0;
    
    // Convert price to number
    if (courseData.price) {
      courseData.price = parseFloat(courseData.price);
    }
    
    // Convert duration to number if present
    if (courseData.duration) {
      courseData.duration = parseFloat(courseData.duration);
    }
    
    // Handle cover image
    if (req.file) {
      // Upload cover image to Cloudinary
      const result = await uploadToCloudinary(req.file.path);
      courseData.coverImage = result.secure_url;
      courseData.imageUrl = result.secure_url; // Also set imageUrl for backward compatibility
    }

    // Handle videos - could be array or JSON string from FormData
    if (courseData.videos) {
      let videosArray = [];
      
      // If it's a JSON string (from FormData), parse it
      if (typeof courseData.videos === 'string') {
        try {
          videosArray = JSON.parse(courseData.videos);
        } catch (parseError) {
          console.error('Error parsing videos JSON:', parseError);
          videosArray = [];
        }
      } else if (Array.isArray(courseData.videos)) {
        videosArray = courseData.videos;
      }
      
      // Format videos array
      courseData.videos = videosArray.map((video, index) => ({
        title: video.title || `Video ${index + 1}`,
        url: video.url || '',
        order: video.order !== undefined ? parseInt(video.order) : index,
        duration: video.duration ? Math.max(1, parseInt(video.duration)) : 1, // Minimum 1 minute
        thumbnail: video.thumbnail || '',
      }));
    } else {
      courseData.videos = [];
    }

    // Handle exams - could be array or JSON string from FormData
    if (courseData.exams) {
      let examsArray = [];
      
      // If it's a JSON string (from FormData), parse it
      if (typeof courseData.exams === 'string') {
        try {
          examsArray = JSON.parse(courseData.exams);
        } catch (parseError) {
          console.error('Error parsing exams JSON:', parseError);
          examsArray = [];
        }
      } else if (Array.isArray(courseData.exams)) {
        examsArray = courseData.exams;
      }
      
      // Format exams array with validation for new internal structure
      courseData.exams = examsArray.map((exam, index) => {
        // Validate exam structure
        if (!exam.title || exam.title.trim() === '') {
          throw new Error(`Exam ${index + 1}: Title is required`);
        }
        
        if (!exam.questions || !Array.isArray(exam.questions) || exam.questions.length === 0) {
          throw new Error(`Exam ${index + 1}: At least one question is required`);
        }
        
        // Validate questions
        exam.questions.forEach((question, qIndex) => {
          if (!question.questionText || question.questionText.trim() === '') {
            throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Question text is required`);
          }
          
          if (!question.type || !['mcq', 'true_false', 'essay'].includes(question.type)) {
            throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Invalid question type`);
          }
          
          if (question.type === 'mcq') {
            if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
              throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: MCQ must have at least 2 options`);
            }
            
            if (!question.correctAnswer) {
              throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Correct answer is required for MCQ`);
            }
          }
          
          if (question.type === 'true_false') {
            if (typeof question.correctAnswer !== 'boolean') {
              throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: True/False must have boolean correct answer`);
            }
          }
        });
        
        return {
          id: exam.id || `exam_${Date.now()}_${index}`,
          title: exam.title.trim(),
          totalMarks: parseInt(exam.totalMarks) || 100,
          questions: exam.questions,
          totalQuestions: exam.questions.length,
          createdAt: exam.createdAt || new Date().toISOString()
        };
      });
    } else {
      courseData.exams = [];
    }
    
    console.log('Processed course data:', courseData);
    
    // Set the creator - handle case where req.user might be undefined
    if (req.user && req.user._id) {
      courseData.createdBy = req.user._id;
      console.log('Setting createdBy to:', req.user._id);
    } else {
      console.log('Warning: req.user is undefined, setting createdBy to null');
      console.log('req.user:', req.user);
      console.log('req.headers.authorization:', req.headers.authorization);
      courseData.createdBy = null;
    }
    
    // Create and save course
    console.log('Creating course with data:', courseData);
    
    // Validate course data before creating
    try {
      console.log('Attempting to create Course model with data:', JSON.stringify(courseData, null, 2));
      
      const course = new Course(courseData);
      console.log('Course model created successfully');
      
      // Validate the course
      const validationError = course.validateSync();
      if (validationError) {
        console.error('Course validation failed:', validationError);
        return res.status(400).json({
          success: false,
          error: 'Course validation failed',
          details: validationError.errors || validationError.message
        });
      }
      
      await course.save();
      console.log('Course saved successfully:', course._id);
      
      res.status(201).json({
        success: true,
        data: course,
        message: 'Course created successfully'
      });
      return;
    } catch (saveError) {
      console.error('Error saving course to database:', saveError);
      console.error('Save error details:', {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        errors: saveError.errors
      });
      throw saveError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('=== COURSE CREATION ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors
    });
    console.error('Request data that caused error:', req.body);
    console.error('================================');
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Database validation error',
        errors: validationErrors,
        errorType: 'validation'
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        error: 'A course with this information already exists',
        duplicateField: error.keyPattern ? Object.keys(error.keyPattern)[0] : 'unknown',
        errorType: 'duplicate'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: `Invalid ${error.path}: ${error.value}`,
        errorType: 'cast'
      });
    }
    
    // Handle authentication errors
    if (error.message && error.message.includes('jwt')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication error',
        error: 'Invalid or expired token',
        errorType: 'auth'
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      errorType: 'server',
      timestamp: new Date().toISOString()
    });
  }
};

// Update existing course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Log the received data for debugging
    console.log('=== COURSE UPDATE DEBUG ===');
    console.log('Course ID:', id);
    console.log('Update data:', updateData);
    console.log('Request files:', req.files);
    console.log('Request file (single):', req.file);
    console.log('================================');
    
    // Handle image upload if present
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        updateData.imageUrl = result.secure_url;
        console.log('Image uploaded to Cloudinary:', result.secure_url);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        // Fallback to local storage
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }
    }
    
    // Convert price to number if present
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    
    // Convert duration to number if present
    if (updateData.duration) {
      updateData.duration = parseFloat(updateData.duration);
    }
    
    console.log('Processed update data:', updateData);
    
    const course = await Course.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    console.log('Course updated successfully:', course._id);

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// ==================== PAYMENT MANAGEMENT ====================

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id)
      .populate('userId', 'firstName secondName thirdName fourthName userEmail')
      .populate('courseId', 'title price');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const { status, courseId, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;
    
    // Search functionality
    if (search) {
      query.$or = [
        { 'studentId.firstName': { $regex: search, $options: 'i' } },
        { 'studentId.secondName': { $regex: search, $options: 'i' } },
        { 'courseId.title': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(query)
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending'
      });
    }

    // Update payment status
    payment.status = 'accepted';
    payment.acceptedAt = new Date();
    payment.acceptedBy = req.user.id;
    
    await payment.save();

    // Add course to student's enrolled courses
    const student = await User.findById(payment.studentId);
    if (student) {
      // Check if student is already enrolled in this course
      const existingEnrollment = student.enrolledCourses.find(
        enrollment => enrollment.course.toString() === payment.courseId.toString()
      );

      if (!existingEnrollment) {
        // Add new enrollment
        student.enrolledCourses.push({
          course: payment.courseId,
          enrolledAt: new Date(),
          paymentStatus: 'approved',
          paymentApprovedAt: new Date(),
          paymentId: payment._id
        });
        await student.save();
        console.log(`✅ Added course ${payment.courseId} to student ${payment.studentId} enrolled courses`);
      } else {
        // Update existing enrollment status
        existingEnrollment.paymentStatus = 'approved';
        existingEnrollment.paymentApprovedAt = new Date();
        existingEnrollment.paymentId = payment._id;
        await student.save();
        console.log(`✅ Updated enrollment status for student ${payment.studentId} in course ${payment.courseId}`);
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully and student enrolled in course',
      data: payment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// Reject payment
const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not pending'
      });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user.id;
    payment.rejectionReason = reason || 'Payment rejected by admin';
    
    await payment.save();

    // Here you would typically:
    // 1. Send rejection email with reason
    // 2. Refund if necessary

    res.json({
      success: true,
      message: 'Payment rejected successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment',
      error: error.message
    });
  }
};

// ==================== EXPORT FUNCTIONS ====================

// Export users to CSV
const exportUsers = async (req, res) => {
  try {
    const { grade, governorate, role } = req.query;
    
    let query = {};
    if (grade) query.grade = grade;
    if (governorate) query.governorate = governorate;
    if (role) query.role = role;

    const users = await User.find(query).select('-password');

    // Convert to CSV format
    const csvData = users.map(user => {
      return `${user.firstName || ''},${user.secondName || ''},${user.thirdName || ''},${user.fourthName || ''},${user.userEmail},${user.role},${user.grade || ''},${user.governorate || ''},${user.phoneStudent || ''}`;
    });

    const csvHeader = 'FirstName,SecondName,ThirdName,FourthName,Email,Role,Grade,Governorate,Phone\n';
    const csvContent = csvHeader + csvData.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
};

// Get user courses
const getUserCourses = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's course progress
    const UserCourseProgress = require('../../models/UserCourseProgress');
    
    const progressEntries = await UserCourseProgress.find({ userId: id })
      .populate('courseId', 'title subject grade description image')
      .sort({ createdAt: -1 });
    
    const courses = progressEntries.map(entry => ({
      _id: entry.courseId._id,
      title: entry.courseId.title,
      subject: entry.courseId.subject,
      grade: entry.courseId.grade,
      description: entry.courseId.description,
      image: entry.courseId.image,
      progressPercentage: entry.overallProgress,
      isCompleted: entry.isCompleted,
      enrolledAt: entry.enrolledAt,
      completedAt: entry.completedAt,
      lastActivityAt: entry.lastActivityAt
    }));
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user courses',
      error: error.message
    });
  }
};

// Get user grades
const getUserGrades = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ExamResult = require('../../models/ExamResult');
    
    const grades = await ExamResult.find({ studentId: id })
      .populate('courseId', 'title subject')
      .sort({ submittedAt: -1 });
    
    const formattedGrades = grades.map(grade => ({
      _id: grade._id,
      courseTitle: grade.courseId?.title || grade.examTitle,
      subject: grade.courseId?.subject || 'غير محدد',
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: grade.percentage,
      grade: grade.grade,
      level: grade.level,
      submittedAt: grade.submittedAt,
      examTitle: grade.examTitle
    }));
    
    res.json({
      success: true,
      data: formattedGrades
    });
  } catch (error) {
    console.error('Error fetching user grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user grades',
      error: error.message
    });
  }
};

// Get user activities
const getUserActivities = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get various user activities
    const UserCourseProgress = require('../../models/UserCourseProgress');
    const ExamResult = require('../../models/ExamResult');
    
    const [progressActivities, examActivities] = await Promise.all([
      UserCourseProgress.find({ userId: id })
        .populate('courseId', 'title')
        .sort({ lastActivityAt: -1 })
        .limit(20),
      ExamResult.find({ studentId: id })
        .populate('courseId', 'title')
        .sort({ submittedAt: -1 })
        .limit(20)
    ]);
    
    const activities = [];
    
    // Add progress activities
    progressActivities.forEach(progress => {
      if (progress.lastActivityAt) {
        activities.push({
          type: 'course',
          description: `آخر نشاط في كورس ${progress.courseId?.title || 'غير محدد'}`,
          timestamp: progress.lastActivityAt,
          details: {
            progressPercentage: progress.overallProgress,
            completedVideos: progress.completedVideos.length,
            completedExams: progress.completedExams.length
          }
        });
      }
    });
    
    // Add exam activities
    examActivities.forEach(exam => {
      activities.push({
        type: 'exam',
        description: `أكمل امتحان ${exam.examTitle} في كورس ${exam.courseId?.title || 'غير محدد'}`,
        timestamp: exam.submittedAt,
        details: {
          score: exam.score,
          maxScore: exam.maxScore,
          percentage: exam.percentage,
          grade: exam.grade
        }
      });
    });
    
    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      data: activities.slice(0, 50) // Limit to 50 most recent activities
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
};

// Export payments report
const exportPayments = async (req, res) => {
  try {
    const { status, courseId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;

    const payments = await Payment.find(query)
      .populate('userId', 'firstName secondName userEmail')
      .populate('courseId', 'title price');

    // Convert to CSV format
    const csvData = payments.map(payment => {
      return `${payment.userId?.firstName || ''},${payment.userId?.secondName || ''},${payment.courseId?.title || ''},${payment.amount},${payment.status},${payment.createdAt}`;
    });

    const csvHeader = 'FirstName,SecondName,CourseTitle,Amount,Status,CreatedAt\n';
    const csvContent = csvHeader + csvData.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export payments',
      error: error.message
    });
  }
};

// Export courses report
const exportCourses = async (req, res) => {
  try {
    const { grade, subject } = req.query;
    
    let query = {};
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;

    const courses = await Course.find(query);

    // Convert to CSV format
    const csvData = courses.map(course => {
      return `${course.title},${course.subject},${course.grade},${course.price},${course.createdAt}`;
    });

    const csvHeader = 'Title,Subject,Grade,Price,CreatedAt\n';
    const csvContent = csvHeader + csvData.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=courses_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export courses',
      error: error.message
    });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object for easier access
    const roleCounts = userCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get active enrollments count
    const activeEnrollments = await User.aggregate([
      {
        $unwind: '$enrolledCourses'
      },
      {
        $match: {
          'enrolledCourses.paymentStatus': 'approved'
        }
      },
      {
        $count: 'total'
      }
    ]);

    // No internal quiz stats - only external exam links

    const stats = {
      totalUsers: await User.countDocuments(),
      totalStudents: roleCounts.student || 0,
      totalTeachers: roleCounts.teacher || 0,
      totalAdmins: roleCounts.admin || 0,
      totalCourses: await Course.countDocuments(),
      totalPayments: await Payment.countDocuments(),
      pendingPayments: await Payment.countDocuments({ status: 'pending' }),
      approvedPayments: await Payment.countDocuments({ status: 'approved' }),
      rejectedPayments: await Payment.countDocuments({ status: 'rejected' }),
      totalRevenue: await Payment.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      activeEnrollments: activeEnrollments[0]?.total || 0,
      completedQuizzes: 0, // No internal quizzes
      averageQuizScore: 0 // No internal quizzes
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// Generate dashboard report
const generateDashboardReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    // Generate comprehensive report based on date range
    const report = {
      period: { startDate, endDate },
      generatedAt: new Date(),
      summary: {
        totalUsers: await User.countDocuments(),
        totalCourses: await Course.countDocuments(),
        totalPayments: await Payment.countDocuments(),
        totalRevenue: await Payment.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0)
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating dashboard report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard report',
      error: error.message
    });
  }
};

// ==================== VIDEO MANAGEMENT CONTROLLERS ====================

// Add video to course
const addVideoToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, url, order, duration } = req.body;
    
    // Debug logging
    console.log('=== ADD VIDEO DEBUG ===');
    console.log('Course ID:', courseId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('========================');
    
    // Validate required fields
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required'
      });
    }
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Import video utilities
    const { getVideoThumbnail, isYouTubeUrl } = require('../../utils/videoUtils');

    // Handle thumbnail - either from file upload or from request body
    let thumbnailUrl = null;
    if (req.file) {
      // Upload file to Cloudinary
      const result = await uploadToCloudinary(req.file.path);
      thumbnailUrl = result.secure_url;
    } else if (req.body.thumbnail) {
      // Use thumbnail URL from request body
      thumbnailUrl = req.body.thumbnail;
    } else if (isYouTubeUrl(url)) {
      // Auto-generate YouTube thumbnail
      thumbnailUrl = getVideoThumbnail(url);
    }

    // Create new video object
    const newVideo = {
      title: title.trim(),
      url: url.trim(),
      order: order !== undefined ? parseInt(order) : course.videos.length,
      duration: duration ? parseInt(duration) : 0,
      thumbnail: thumbnailUrl
    };


    // Add video to course
    course.videos.push(newVideo);
    
    // Sort videos by order
    course.videos.sort((a, b) => a.order - b.order);
    
    await course.save();

    // Notify enrolled students about new video
    await NotificationService.notifyNewVideoAdded(courseId, newVideo.title);

    res.json({
      success: true,
      message: 'Video added successfully',
      data: {
        ...newVideo,
        _id: course.videos[course.videos.length - 1]._id
      }
    });
  } catch (error) {
    console.error('Error adding video to course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add video to course',
      error: error.message
    });
  }
};

// Update video in course
const updateVideoInCourse = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { title, url, order, duration } = req.body;
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find video in course
    const videoIndex = course.videos.findIndex(video => video._id.toString() === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Video not found in course'
      });
    }

    // Upload new thumbnail to Cloudinary if provided
    if (req.file) {
      // Delete old thumbnail from Cloudinary if it exists
      if (course.videos[videoIndex].thumbnail) {
        await deleteFromCloudinary(course.videos[videoIndex].thumbnail);
      }
      
      // Upload new thumbnail
      const result = await uploadToCloudinary(req.file.path);
      course.videos[videoIndex].thumbnail = result.secure_url;
    }

    // Update other video fields
    if (title) course.videos[videoIndex].title = title;
    if (url) course.videos[videoIndex].url = url;
    if (order !== undefined) course.videos[videoIndex].order = order;
    if (duration) course.videos[videoIndex].duration = duration;


    // Sort videos by order
    course.videos.sort((a, b) => a.order - b.order);
    
    await course.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      data: course.videos[videoIndex]
    });
  } catch (error) {
    console.error('Error updating video in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video in course',
      error: error.message
    });
  }
};

// Delete video from course
const deleteVideoFromCourse = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find and remove video from course
    const videoIndex = course.videos.findIndex(video => video._id.toString() === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Video not found in course'
      });
    }

    // Delete thumbnail from Cloudinary if it exists
    if (course.videos[videoIndex].thumbnail) {
      await deleteFromCloudinary(course.videos[videoIndex].thumbnail);
    }

    const deletedVideo = course.videos.splice(videoIndex, 1)[0];
    
    // Reorder remaining videos
    course.videos.forEach((video, index) => {
      video.order = index;
    });
    
    await course.save();

    res.json({
      success: true,
      message: 'Video deleted successfully',
      data: deletedVideo
    });
  } catch (error) {
    console.error('Error deleting video from course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video from course',
      error: error.message
    });
  }
};

// Reorder videos in course
const reorderVideosInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoOrder } = req.body; // Array of video IDs in new order

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update video order
    videoOrder.forEach((videoId, newOrder) => {
      const video = course.videos.find(v => v._id.toString() === videoId);
      if (video) {
        video.order = newOrder;
      }
    });

    // Sort videos by new order
    course.videos.sort((a, b) => a.order - b.order);
    
    await course.save();

    res.json({
      success: true,
      message: 'Videos reordered successfully',
      data: course.videos
    });
  } catch (error) {
    console.error('Error reordering videos in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder videos in course',
      error: error.message
    });
  }
};

// Get course videos
const getCourseVideos = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Sort videos by order
    const sortedVideos = course.videos.sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      data: sortedVideos
    });
  } catch (error) {
    console.error('Error fetching course videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course videos',
      error: error.message
    });
  }
};

// Get all pending payment proofs for admin review
const getPendingPaymentProofs = async (req, res) => {
  try {
    console.log('Fetching pending payment proofs...');
    
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('studentId', 'firstName secondName userEmail phoneStudent governorate')
      .populate('courseId', 'title subject grade term price')
      .sort({ submittedAt: -1 });

    console.log(`Found ${pendingPayments.length} pending payments`);

    const pendingProofs = pendingPayments
      .filter(payment => payment.studentId) // Only filter out payments with missing studentId
      .map(payment => {
        console.log('Payment data for frontend:', {
          _id: payment._id,
          userPhone: payment.studentPhone,
          senderPhone: payment.senderPhone,
          studentName: payment.studentId ? `${payment.studentId.firstName} ${payment.studentId.secondName}` : 'Unknown',
          hasCourse: !!payment.courseId
        });
        
        return {
          _id: payment._id,
          userId: payment.studentId._id,
          userName: payment.studentId ? `${payment.studentId.firstName} ${payment.studentId.secondName}` : 'Unknown Student',
          userEmail: payment.studentId?.userEmail || '',
          userPhone: payment.studentPhone,
          userGovernorate: payment.studentId?.governorate || '',
          courseId: payment.courseId?._id || null,
          courseTitle: payment.courseId?.title || 'Standalone Payment',
          courseSubject: payment.courseId?.subject || '',
          courseGrade: payment.courseId?.grade || '',
          courseTerm: payment.courseId?.term || '',
          coursePrice: payment.courseId?.price || 0,
          amount: payment.amount,
          currency: payment.currency,
          transactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          proofImage: payment.proofImage,
          senderPhone: payment.senderPhone,
          studentPhone: payment.studentPhone,
          parentPhone: payment.parentPhone,
          guardianPhone: payment.metadata?.guardianPhone,
          studentId: payment.metadata?.studentId,
          transferTime: payment.transferTime,
          submittedAt: payment.submittedAt,
          paymentDate: payment.paymentDate,
          createdAt: payment.createdAt
        };
      });

    return res.status(200).json({
      success: true,
      pendingProofs: pendingProofs
    });

  } catch (error) {
    console.error('Get pending payment proofs error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching pending payment proofs",
      details: error.message
    });
  }
};

// Approve payment proof - Robust implementation with error handling
const approvePaymentProof = async (req, res) => {
  const startTime = new Date();
  
  try {
    console.log('=== Approve Payment Proof Request ===');
    console.log('Timestamp:', startTime.toISOString());
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { id: paymentId } = req.params; // Get ID from URL parameters
    const adminId = req.user._id;
    
    console.log('Payment ID from params:', paymentId);
    console.log('Admin ID:', adminId);

    // Validate paymentId format
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      console.log('Invalid payment ID format:', paymentId);
      return res.status(400).json({
        success: false,
        error: "Invalid payment ID format"
      });
    }

    // Find the payment with all necessary data
    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName secondName userEmail enrolledCourses')
      .populate('courseId', 'title subject grade price');
    
    console.log('Payment found:', {
      _id: payment?._id,
      status: payment?.status,
      hasStudentId: !!payment?.studentId,
      hasCourseId: !!payment?.courseId,
      studentId: payment?.studentId?._id,
      courseId: payment?.courseId?._id,
      courseTitle: payment?.courseId?.title
    });

    if (!payment) {
      console.log('Payment not found for ID:', paymentId);
      return res.status(404).json({
        success: false,
        error: "Payment not found"
      });
    }

    // Validate that student exists
    if (!payment.studentId) {
      console.log('Student not found for payment ID:', paymentId);
      return res.status(404).json({
        success: false,
        error: "Student not found for this payment"
      });
    }

    // Check if already approved (idempotent)
    if (payment.status === 'approved') {
      console.log('Payment already approved, returning success (idempotent)');
      return res.status(200).json({
        success: true,
        message: "Payment already approved",
        payment: payment,
        alreadyApproved: true
      });
    }

    if (payment.status !== 'pending') {
      console.log('Payment is not pending, status:', payment.status);
      return res.status(400).json({
        success: false,
        error: `Payment is not pending. Current status: ${payment.status}`
      });
    }

    // Update payment status
    console.log('Updating payment status to approved...');
    payment.status = 'approved';
    payment.confirmedAt = new Date();
    payment.confirmedBy = adminId;
    await payment.save();
    console.log('Payment status updated successfully');

    // Update user enrollment status (only if courseId exists)
    if (payment.courseId && payment.studentId && payment.studentId._id) {
      console.log('Updating course enrollment status...');
      
      const user = await User.findById(payment.studentId._id);
      if (!user) {
        console.log('User not found for ID:', payment.studentId._id);
        return res.status(404).json({
          success: false,
          error: "Student not found"
        });
      }

      // Check if course is already enrolled (prevent duplicates)
      const existingEnrollment = user.enrolledCourses.find(
        enrollment => enrollment.course.toString() === payment.courseId._id.toString()
      );
      
      if (existingEnrollment) {
        // Update existing enrollment
        existingEnrollment.paymentStatus = "approved";
        existingEnrollment.paymentApprovedAt = new Date();
        existingEnrollment.paymentId = payment._id;
        existingEnrollment.proofImage = payment.proofImage; // Store proof image
        console.log('Updated existing enrollment');
      } else {
        // Add new enrollment
        user.enrolledCourses.push({
          course: payment.courseId._id,
          enrolledAt: new Date(),
          paymentStatus: "approved",
          paymentApprovedAt: new Date(),
          paymentId: payment._id,
          proofImage: payment.proofImage // Store proof image
        });
        console.log('Added new enrollment');
      }

      // Add course to user's allowedCourses if not already present
      if (!user.allowedCourses.includes(payment.courseId._id)) {
        user.allowedCourses.push(payment.courseId._id);
        console.log('Added course to allowedCourses');
      }
      
      await user.save();
      console.log('Course enrollment status updated successfully');
    } else {
      console.log('Skipping course enrollment update - no courseId or studentId');
    }

    // Create notification for student (non-blocking)
    try {
      if (payment.studentId && payment.courseId) {
        // Use NotificationService for proper real-time delivery
        await NotificationService.createNotification(payment.studentId._id, {
          type: 'course_activated',
          title: 'Course Activated',
          message: '✅ Your course has been successfully activated. You can now start learning.',
          data: {
            paymentId: payment._id,
            courseId: payment.courseId._id,
            courseTitle: payment.courseId.title
          },
          priority: 'high',
          category: 'course'
        });
        console.log('✅ Real-time course activation notification sent to student');
      }
    } catch (notificationError) {
      console.error('Failed to create notification (non-critical):', notificationError);
      // Don't fail the main operation for notification errors
    }

    const endTime = new Date();
    const duration = endTime - startTime;
    console.log(`Payment approval completed successfully in ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: "تم تفعيل الكورس للطالب بنجاح.",
      payment: {
        _id: payment._id,
        status: payment.status,
        confirmedAt: payment.confirmedAt,
        confirmedBy: payment.confirmedBy
      },
      course: payment.courseId ? {
        _id: payment.courseId._id,
        title: payment.courseId.title
      } : null,
      student: {
        _id: payment.studentId._id,
        name: `${payment.studentId.firstName} ${payment.studentId.secondName}`
      },
      duration: duration
    });

  } catch (error) {
    console.error('=== Approve Payment Proof Error ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Payment ID:', req.params?.id);
    console.error('Admin ID:', req.user?._id);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);

    return res.status(500).json({
      success: false,
      error: "Internal server error while approving payment proof",
      timestamp: new Date().toISOString(),
      paymentId: req.params?.id,
      adminId: req.user?._id,
      details: error.message
    });
  }
};

// Reject payment proof - Robust implementation with error handling
const rejectPaymentProof = async (req, res) => {
  const startTime = new Date();
  
  try {
    console.log('=== Reject Payment Proof Request ===');
    console.log('Timestamp:', startTime.toISOString());
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { id: paymentId } = req.params; // Get ID from URL parameters
    const { rejectionReason } = req.body; // Get rejection reason from body
    const adminId = req.user._id;
    
    console.log('Payment ID from params:', paymentId);
    console.log('Admin ID:', adminId);
    console.log('Rejection Reason:', rejectionReason);

    // Validate paymentId format
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      console.log('Invalid payment ID format:', paymentId);
      return res.status(400).json({
        success: false,
        error: "Invalid payment ID format"
      });
    }

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      console.log('Rejection reason is required');
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required"
      });
    }

    // Find the payment with all necessary data
    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName secondName userEmail enrolledCourses')
      .populate('courseId', 'title subject grade price');
    
    console.log('Payment found:', {
      _id: payment?._id,
      status: payment?.status,
      hasStudentId: !!payment?.studentId,
      hasCourseId: !!payment?.courseId,
      studentId: payment?.studentId?._id,
      courseId: payment?.courseId?._id,
      courseTitle: payment?.courseId?.title
    });

    if (!payment) {
      console.log('Payment not found for ID:', paymentId);
      return res.status(404).json({
        success: false,
        error: "Payment not found"
      });
    }

    // Validate that student exists
    if (!payment.studentId) {
      console.log('Student not found for payment ID:', paymentId);
      return res.status(404).json({
        success: false,
        error: "Student not found for this payment"
      });
    }

    // Check if already rejected (idempotent)
    if (payment.status === 'rejected') {
      console.log('Payment already rejected, returning success (idempotent)');
      return res.status(200).json({
        success: true,
        message: "Payment already rejected",
        payment: payment,
        alreadyRejected: true
      });
    }

    if (payment.status !== 'pending') {
      console.log('Payment is not pending, status:', payment.status);
      return res.status(400).json({
        success: false,
        error: `Payment is not pending. Current status: ${payment.status}`
      });
    }

    // Update payment status
    console.log('Updating payment status to rejected...');
    payment.status = 'rejected';
    payment.rejectedAt = new Date();
    payment.rejectedBy = adminId;
    payment.rejectionReason = rejectionReason.trim();
    await payment.save();
    console.log('Payment status updated successfully');

    // Update user enrollment status (only if courseId exists)
    if (payment.courseId && payment.studentId && payment.studentId._id) {
      console.log('Updating course enrollment status...');
      
      const user = await User.findById(payment.studentId._id);
      if (!user) {
        console.log('User not found for ID:', payment.studentId._id);
        return res.status(404).json({
          success: false,
          error: "Student not found"
        });
      }

      // Check if course is already enrolled
      const existingEnrollment = user.enrolledCourses.find(
        enrollment => enrollment.courseId.toString() === payment.courseId._id.toString()
      );
      
      if (existingEnrollment) {
        // Update existing enrollment
        existingEnrollment.paymentStatus = "rejected";
        existingEnrollment.paymentRejectedAt = new Date();
        existingEnrollment.rejectionReason = rejectionReason.trim();
        console.log('Updated existing enrollment to rejected');
      } else {
        // Add new enrollment with rejected status
        user.enrolledCourses.push({
          courseId: payment.courseId._id,
          enrolledAt: new Date(),
          paymentStatus: "rejected",
          paymentRejectedAt: new Date(),
          rejectionReason: rejectionReason.trim()
        });
        console.log('Added new enrollment with rejected status');
      }
      
      await user.save();
      console.log('Course enrollment status updated successfully');
    } else {
      console.log('Skipping course enrollment update - no courseId or studentId');
    }

    // Create notification for student (non-blocking)
    try {
      if (payment.studentId && payment.courseId) {
        // Use NotificationService for proper real-time delivery
        await NotificationService.createNotification(payment.studentId._id, {
          type: 'payment_rejected',
          title: 'تم رفض إثبات الدفع',
          message: `تم رفض إثبات دفعك لدورة "${payment.courseId.title}". السبب: ${rejectionReason.trim()}`,
          data: {
            paymentId: payment._id,
            courseId: payment.courseId._id,
            courseTitle: payment.courseId.title,
            rejectionReason: rejectionReason.trim()
          },
          priority: 'high',
          category: 'payment'
        });
        console.log('✅ Real-time notification sent to student');
      }
    } catch (notificationError) {
      console.error('Failed to create notification (non-critical):', notificationError);
      // Don't fail the main operation for notification errors
    }

    const endTime = new Date();
    const duration = endTime - startTime;
    console.log(`Payment rejection completed successfully in ${duration}ms`);

    return res.status(200).json({
      success: true,
      message: "تم رفض إثبات الدفع وإشعار الطالب بالسبب",
      payment: {
        _id: payment._id,
        status: payment.status,
        rejectedAt: payment.rejectedAt,
        rejectedBy: payment.rejectedBy,
        rejectionReason: payment.rejectionReason
      },
      course: payment.courseId ? {
        _id: payment.courseId._id,
        title: payment.courseId.title
      } : null,
      student: {
        _id: payment.studentId._id,
        name: `${payment.studentId.firstName} ${payment.studentId.secondName}`
      },
      duration: duration
    });

  } catch (error) {
    console.error('=== Reject Payment Proof Error ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Payment ID:', req.body?.paymentId);
    console.error('Admin ID:', req.user?._id);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', error);

    return res.status(500).json({
      success: false,
      error: "Internal server error while rejecting payment proof",
      timestamp: new Date().toISOString(),
      paymentId: req.body?.paymentId,
      adminId: req.user?._id,
      details: error.message
    });
  }
};

// Get course enrollment statistics
const getCourseEnrollmentStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $unwind: '$enrolledCourses'
      },
      {
        $group: {
          _id: '$enrolledCourses.courseId',
          totalEnrollments: { $sum: 1 },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.paymentStatus', 'pending'] }, 1, 0] }
          },
          approvedPayments: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.paymentStatus', 'approved'] }, 1, 0] }
          },
          rejectedPayments: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.paymentStatus', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          courseSubject: '$course.subject',
          totalEnrollments: 1,
          pendingPayments: 1,
          approvedPayments: 1,
          rejectedPayments: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      enrollmentStats: stats
    });

  } catch (error) {
    console.error('Get enrollment stats error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching enrollment statistics"
    });
  }
};

// Approve course access for student
const approveCourseAccess = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const adminId = req.user._id;

    console.log('=== Approve Course Access Request ===');
    console.log('User ID:', userId);
    console.log('Course ID:', courseId);
    console.log('Admin ID:', adminId);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID or course ID format"
      });
    }

    // Find user and course
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if user already has access to this course
    if (user.allowedCourses.includes(courseId)) {
      return res.status(200).json({
        success: true,
        message: "User already has access to this course",
        alreadyApproved: true
      });
    }

    // Add course to user's allowedCourses
    user.allowedCourses.push(courseId);
    await user.save();

    // Update course enrollment count
    course.totalEnrollments = (course.totalEnrollments || 0) + 1;
    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
    }
    await course.save();

    // Create notification for student
    try {
      await NotificationService.createNotification(userId, {
        type: 'course_approved',
        title: 'تم تفعيل الدورة',
        message: `تم تفعيل دورة "${course.title}" ويمكنك الآن الوصول للمحتوى`,
        data: {
          courseId: courseId,
          courseTitle: course.title
        },
        priority: 'high',
        category: 'course'
      });
      console.log('✅ Real-time notification sent to student');
    } catch (notificationError) {
      console.error('Failed to create notification (non-critical):', notificationError);
    }

    console.log('Course access approved successfully');

    res.status(200).json({
      success: true,
      message: "تم تفعيل الدورة للطالب بنجاح",
      data: {
        userId: userId,
        courseId: courseId,
        courseTitle: course.title,
        studentName: `${user.firstName} ${user.secondName}`
      }
    });

  } catch (error) {
    console.error('Error approving course access:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while approving course access",
      details: error.message
    });
  }
};

// Approve order with transaction support and socket.io notification
const approveOrder = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { orderId } = req.params;
    const adminId = req.user._id;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format"
      });
    }

    await session.withTransaction(async () => {
      // Find the payment/order
      const payment = await Payment.findById(orderId)
        .populate('studentId', 'firstName secondName userEmail enrolledCourses allowedCourses')
        .populate('courseId', 'title subject grade price students')
        .session(session);

      if (!payment) {
        throw new Error("Payment not found");
      }

      // Check if already approved (idempotent)
      if (payment.status === 'approved') {
        return res.status(200).json({
          success: true,
          message: "Payment already approved",
          orderId: payment._id,
          courseId: payment.courseId._id,
          userId: payment.studentId._id,
          alreadyApproved: true
        });
      }

      if (payment.status !== 'pending') {
        throw new Error(`Payment is not pending. Current status: ${payment.status}`);
      }

      // Update payment status
      payment.status = 'approved';
      payment.confirmedAt = new Date();
      payment.confirmedBy = adminId;
      await payment.save({ session });

      // Update user enrollment
      const user = payment.studentId;
      const course = payment.courseId;

      // Check if course is already enrolled (prevent duplicates)
      const existingEnrollment = user.enrolledCourses.find(
        enrollment => enrollment.course.toString() === course._id.toString()
      );
      
      if (existingEnrollment) {
        // Update existing enrollment
        existingEnrollment.paymentStatus = "approved";
        existingEnrollment.paymentApprovedAt = new Date();
        existingEnrollment.paymentId = payment._id;
        existingEnrollment.proofImage = payment.proofImage;
      } else {
        // Add new enrollment
        user.enrolledCourses.push({
          course: course._id,
          enrolledAt: new Date(),
          paymentStatus: "approved",
          paymentApprovedAt: new Date(),
          paymentId: payment._id,
          proofImage: payment.proofImage
        });
      }

      // Add course to user's allowedCourses if not already present
      if (!user.allowedCourses.includes(course._id)) {
        user.allowedCourses.push(course._id);
      }
      
      await user.save({ session });

      // Add user to course students if not already present
      if (!course.students.includes(user._id)) {
        course.students.push(user._id);
        await course.save({ session });
      }

      // Create notification for student
      await NotificationService.createNotification(user._id, {
        type: 'payment_approved',
        title: 'تم الموافقة على الدفع',
        message: `تم الموافقة على دفعك لدورة "${course.title}" ويمكنك الآن الوصول للمحتوى`,
        data: {
          paymentId: payment._id,
          courseId: course._id,
          courseTitle: course.title
        },
        priority: 'high',
        category: 'payment'
      });

      // Emit socket.io event to student's room
      if (req.app.get('io')) {
        const io = req.app.get('io');
        io.to(`user_${user._id}`).emit('course:enrolled', {
          courseId: course._id,
          orderId: payment._id,
          courseTitle: course.title,
          message: 'تم تفعيل الدورة بنجاح'
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment approved successfully",
        orderId: payment._id,
        courseId: course._id,
        userId: user._id
      });
    });

  } catch (error) {
    console.error('Error approving order:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while approving order",
      details: error.message
    });
  } finally {
    await session.endSession();
  }
};


// Update content order
const updateContentOrder = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { order } = req.body;
    
    // Validate required fields
    if (!order || !Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        message: 'Order array is required'
      });
    }
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update video orders
    for (const item of order) {
      if (item.type === 'video') {
        const video = course.videos.find(v => v._id.toString() === item.id);
        if (video) {
          video.order = item.order;
        }
      }
    }

    // Sort videos by order
    course.videos.sort((a, b) => a.order - b.order);
    
    await course.save();

    res.json({
      success: true,
      message: 'Content order updated successfully',
      data: {
        videos: course.videos.map(video => ({
          _id: video._id,
          title: video.title,
          order: video.order,
          type: 'video'
        }))
      }
    });
  } catch (error) {
    console.error('Error updating content order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content order',
      error: error.message
    });
  }
};

// Approve parent account
const approveParentAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    console.log('=== Approve Parent Account Request ===');
    console.log('User ID:', userId);
    console.log('Admin ID:', adminId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format"
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is a parent
    if (user.role !== 'parent') {
      return res.status(400).json({
        success: false,
        error: "Only parent accounts can be approved"
      });
    }

    // Check if already approved
    if (user.isActive && user.approvedAt) {
      return res.status(200).json({
        success: true,
        message: "Parent account already approved",
        alreadyApproved: true
      });
    }

    // Approve the parent account
    user.isActive = true;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    await user.save();

    // Create notification for parent
    await Notification.create({
      userId: user._id,
      type: 'account_approved',
      title: 'تم الموافقة على حسابك',
      message: 'تم الموافقة على حسابك كولي أمر ويمكنك الآن الوصول للمنصة',
      data: {
        approvedBy: adminId,
        approvedAt: user.approvedAt
      },
      read: false
    });

    console.log('Parent account approved successfully:', user._id);

    res.json({
      success: true,
      message: "Parent account approved successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        secondName: user.secondName,
        userEmail: user.userEmail,
        role: user.role,
        isActive: user.isActive,
        approvedAt: user.approvedAt,
        approvedBy: user.approvedBy
      }
    });

  } catch (error) {
    console.error('Error approving parent account:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while approving parent account",
      details: error.message
    });
  }
};

// Reject parent account
const rejectParentAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    console.log('=== Reject Parent Account Request ===');
    console.log('User ID:', userId);
    console.log('Admin ID:', adminId);
    console.log('Reason:', reason);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID format"
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user is a parent
    if (user.role !== 'parent') {
      return res.status(400).json({
        success: false,
        error: "Only parent accounts can be rejected"
      });
    }

    // Reject the parent account
    user.isActive = false;
    user.approvedAt = null;
    user.approvedBy = null;
    await user.save();

    // Create notification for parent
    await Notification.create({
      userId: user._id,
      type: 'account_rejected',
      title: 'تم رفض حسابك',
      message: reason || 'تم رفض حسابك كولي أمر. يرجى التواصل مع الإدارة لمزيد من المعلومات.',
      data: {
        rejectedBy: adminId,
        rejectedAt: new Date(),
        reason: reason
      },
      read: false
    });

    console.log('Parent account rejected successfully:', user._id);

    res.json({
      success: true,
      message: "Parent account rejected successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        secondName: user.secondName,
        userEmail: user.userEmail,
        role: user.role,
        isActive: user.isActive,
        approvedAt: user.approvedAt,
        approvedBy: user.approvedBy
      }
    });

  } catch (error) {
    console.error('Error rejecting parent account:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error while rejecting parent account",
      details: error.message
    });
  }
};

module.exports = {
  // Analytics
  getAnalytics,
  getUserAnalytics,
  getCourseAnalytics,
  getPaymentAnalytics,
  getActivityAnalytics,
  getRecentPaymentRequests,
  getRecentMessages,
  getNotifications,
  getDashboardStats,
  
  // User Management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  exportUsers,
  getUserCourses,
  getUserGrades,
  getUserActivities,
  
  // Course Management
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  
  // Payment Management
  getAllPayments,
  getPaymentById,
  confirmPayment,
  rejectPayment,
  
  // Export Functions
  exportPayments,
  exportCourses,
  generateDashboardReport,

  // Video Management
  addVideoToCourse,
  updateVideoInCourse,
  deleteVideoFromCourse,
  reorderVideosInCourse,
  updateContentOrder,
  getCourseVideos,
  getPendingPaymentProofs,
  approvePaymentProof,
  rejectPaymentProof,
  getCourseEnrollmentStats,

  // Student Course Access
  getStudentEnrolledCourses,
  checkCourseAccess,
  approveCourseAccess,
  approveOrder,

  // Parent Account Management
  approveParentAccount,
  rejectParentAccount
};



