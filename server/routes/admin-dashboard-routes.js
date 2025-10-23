const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { authenticateToken } = require('../middleware/auth');

// Test route without authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Admin dashboard API is working!', timestamp: new Date() });
});

// Simple dashboard stats without authentication for testing
router.get('/dashboard-stats-simple', async (req, res) => {
  try {
    console.log('📊 Simple dashboard stats requested');
    console.log('📊 Request query:', req.query);
    console.log('📊 Request headers:', req.headers.authorization ? 'Has auth token' : 'No auth token');
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    // Get basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalCourses = await Course.countDocuments();
    const totalPayments = await Payment.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get payment statistics
    const pendingPayments = await Payment.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const acceptedPayments = await Payment.countDocuments({
      status: 'accepted',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const rejectedPayments = await Payment.countDocuments({
      status: 'rejected',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate revenue
    const revenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'accepted',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Calculate rejected payments amount
    const rejectedRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'rejected',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRejectedAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const rejectedAmount = rejectedRevenueResult.length > 0 ? rejectedRevenueResult[0].totalRejectedAmount : 0;

    // Calculate pending payments amount
    const pendingRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'pending',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const pendingAmount = pendingRevenueResult.length > 0 ? pendingRevenueResult[0].totalPendingAmount : 0;

    // Get users by grade
    const usersByGrade = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get courses by subject
    const coursesBySubject = await Course.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent payments
    const recentPayments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('studentId', 'firstName secondName thirdName fourthName email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Get top courses by enrollment
    const topCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'payments'
        }
      },
      {
        $addFields: {
          enrollmentCount: { $size: '$payments' },
          revenue: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: { $cond: [{ $eq: ['$$payment.status', 'accepted'] }, '$$payment.amount', 0] }
              }
            }
          }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 }
    ]);

    // Get recent students
    const recentStudents = await User.find({
      role: 'student',
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .select('firstName secondName thirdName fourthName email grade createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    const response = {
      success: true,
      stats: {
        overview: {
          totalStudents,
          totalParents,
          totalCourses,
          totalRevenue,
          totalPayments,
          revenueGrowthPercent: 0
        },
        paymentStats: {
          pending: pendingPayments,
          accepted: acceptedPayments,
          rejected: rejectedPayments,
          pendingAmount: pendingAmount,
          acceptedAmount: totalRevenue,
          rejectedAmount: rejectedAmount
        },
        charts: {
          revenueGrowth: [],
          usersByGrade: usersByGrade.map(item => ({
            grade: `الصف ${item._id}`,
            count: item.count
          })),
          courseDistribution: coursesBySubject.map((item, index) => ({
            subject: item._id,
            count: item.count,
            color: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
          }))
        },
        recentPayments: recentPayments.map(payment => ({
          id: payment._id,
          studentName: payment.studentId ? 
            `${payment.studentId.firstName || ''} ${payment.studentId.secondName || ''} ${payment.studentId.thirdName || ''} ${payment.studentId.fourthName || ''}`.trim() || 'غير محدد' : 'غير محدد',
          amount: payment.amount,
          status: payment.status,
          date: payment.createdAt,
          courseTitle: payment.courseId?.title || 'غير محدد'
        })),
        topCourses: topCourses.map(course => ({
          id: course._id,
          title: course.title,
          students: course.enrollmentCount,
          revenue: course.revenue,
          price: course.price || 0,
          enrollments: course.enrollmentCount,
          subject: course.subject
        })),
        recentStudents: recentStudents.map(student => ({
          id: student._id,
          name: `${student.firstName || ''} ${student.secondName || ''} ${student.thirdName || ''} ${student.fourthName || ''}`.trim() || 'غير محدد',
          email: student.email,
          grade: student.grade,
          joinDate: student.createdAt
        }))
      },
      coursePerformance: [],
      studentEngagement: []
    };
    
    console.log('✅ Simple dashboard data sent:', {
      hasStats: !!response.stats,
      hasRecentPayments: !!response.recentPayments,
      hasTopCourses: !!response.topCourses
    });
    res.json(response);
  } catch (error) {
    console.error('❌ Simple dashboard error:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب إحصائيات لوحة التحكم',
      details: error.message 
    });
  }
});

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // Very old date to get all data
      break;
  }

  return { startDate, endDate: now };
};

// Get dashboard statistics
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested with period:', req.query.period);
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);
    
    console.log('📅 Date range:', { startDate, endDate, period });

    // Get basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalParents = await User.countDocuments({ role: 'parent' });
    const totalCourses = await Course.countDocuments();
    
    // Get payment statistics
    const totalPayments = await Payment.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const pendingPayments = await Payment.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const acceptedPayments = await Payment.countDocuments({
      status: 'accepted',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const rejectedPayments = await Payment.countDocuments({
      status: 'rejected',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate revenue
    const revenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'accepted',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get users by grade
    const usersByGrade = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get courses by subject
    const coursesBySubject = await Course.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get monthly revenue for charts
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'accepted',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get recent payments
    const recentPayments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('studentId', 'firstName secondName thirdName fourthName email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Get top courses by enrollment
    const topCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'payments'
        }
      },
      {
        $addFields: {
          enrollmentCount: { $size: '$payments' },
          revenue: {
            $sum: {
              $map: {
                input: '$payments',
                as: 'payment',
                in: { $cond: [{ $eq: ['$$payment.status', 'accepted'] }, '$$payment.amount', 0] }
              }
            }
          }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 }
    ]);

    // Get recent students
    const recentStudents = await User.find({
      role: 'student',
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .select('firstName secondName thirdName fourthName email grade createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Calculate growth percentages (compare with previous period)
    const previousPeriod = getDateRange(period === 'today' ? 'week' : period === 'week' ? 'month' : 'year');
    const previousRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'accepted',
          createdAt: { $gte: previousPeriod.startDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const previousRevenueAmount = previousRevenue.length > 0 ? previousRevenue[0].totalRevenue : 0;
    const revenueGrowthPercent = previousRevenueAmount > 0 
      ? ((totalRevenue - previousRevenueAmount) / previousRevenueAmount) * 100 
      : 0;

    // Format response
    const response = {
      stats: {
        overview: {
          totalStudents,
          totalParents,
          totalCourses,
          totalRevenue,
          totalPayments,
          revenueGrowthPercent: Math.round(revenueGrowthPercent * 100) / 100
        },
        paymentStats: {
          pending: pendingPayments,
          accepted: acceptedPayments,
          rejected: rejectedPayments,
          pendingAmount: 0, // Calculate if needed
          acceptedAmount: totalRevenue,
          rejectedAmount: 0 // Calculate if needed
        },
        charts: {
          revenueGrowth: monthlyRevenue.map(item => ({
            month: `${item._id.month}/${item._id.year}`,
            revenue: item.revenue
          })),
          usersByGrade: usersByGrade.map(item => ({
            grade: `الصف ${item._id}`,
            count: item.count
          })),
          courseDistribution: coursesBySubject.map((item, index) => ({
            subject: item._id,
            count: item.count,
            color: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
          }))
        },
        recentPayments: recentPayments.map(payment => ({
          id: payment._id,
          studentName: payment.studentId ? 
            `${payment.studentId.firstName || ''} ${payment.studentId.secondName || ''} ${payment.studentId.thirdName || ''} ${payment.studentId.fourthName || ''}`.trim() || 'غير محدد' : 'غير محدد',
          amount: payment.amount,
          status: payment.status,
          date: payment.createdAt,
          courseTitle: payment.courseId?.title || 'غير محدد'
        })),
        topCourses: topCourses.map(course => ({
          id: course._id,
          title: course.title,
          students: course.enrollmentCount,
          revenue: course.revenue,
          price: course.price || 0,
          enrollments: course.enrollmentCount,
          subject: course.subject
        })),
        recentStudents: recentStudents.map(student => ({
          id: student._id,
          name: `${student.firstName || ''} ${student.secondName || ''} ${student.thirdName || ''} ${student.fourthName || ''}`.trim() || 'غير محدد',
          email: student.email,
          grade: student.grade,
          joinDate: student.createdAt
        }))
      },
      coursePerformance: [], // Add if needed
      studentEngagement: [] // Add if needed
    };

    res.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'خطأ في جلب إحصائيات لوحة التحكم',
      details: error.message 
    });
  }
});

module.exports = router;
