const Payment = require('../../models/Payment');
const User = require('../../models/User');
const Course = require('../../models/Course');
const NotificationService = require('../../services/notificationService');

/**
 * Enhanced Admin Payment Controller
 * Handles all payment management operations for admin
 */

// Get all payments with pagination, filtering, and sorting
const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status !== 'all') {
      filter.status = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentPhone: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch payments with populated data
    const payments = await Payment.find(filter)
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail phoneStudent')
      .populate('courseId', 'title price subject grade')
      .populate('acceptedBy', 'firstName secondName thirdName fourthName')
      .populate('rejectedBy', 'firstName secondName thirdName fourthName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📋 Found payments:', payments.length);
    console.log('📋 Sample payment:', payments[0] ? {
      id: payments[0]._id,
      studentName: payments[0].studentName,
      status: payments[0].status,
      amount: payments[0].amount,
      course: payments[0].courseId?.title
    } : 'No payments found');

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    // Calculate statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          acceptedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$amount', 0] }
          },
          rejectedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      pendingCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      pendingAmount: 0,
      acceptedAmount: 0,
      rejectedAmount: 0
    };

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        },
        statistics,
        filters: {
          status,
          search,
          sortBy,
          sortOrder,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching payments',
      message: 'An error occurred while fetching payment data',
      code: 'FETCH_PAYMENTS_ERROR'
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    console.log('🔍 getPaymentById called with paymentId:', req.params.paymentId);
    
    // Validate authentication and admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Admin access only' 
      });
    }

    const { paymentId } = req.params;

    // Validate ObjectId format to prevent casting errors
    if (!paymentId || typeof paymentId !== 'string' || paymentId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID format',
        error: 'Payment ID must be a valid 24-character ObjectId'
      });
    }

    // Check if paymentId is a reserved word that shouldn't be treated as ObjectId
    const reservedWords = ['statistics', 'export', 'bulk-status'];
    if (reservedWords.includes(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
        error: `"${paymentId}" is a reserved word and cannot be used as a payment ID`
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail phoneStudent')
      .populate('courseId', 'title price subject grade description')
      .populate('acceptedBy', 'firstName secondName thirdName fourthName')
      .populate('rejectedBy', 'firstName secondName thirdName fourthName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'The requested payment does not exist',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching payment',
      message: 'An error occurred while fetching payment details',
      code: 'FETCH_PAYMENT_ERROR'
    });
  }
};

// Update payment status (accept/reject)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user._id;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be either "accepted" or "rejected"',
        code: 'INVALID_STATUS'
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId)
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail')
      .populate('courseId', 'title price');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'The requested payment does not exist',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    // Check if payment is already processed
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Payment already processed',
        message: `This payment has already been ${payment.status}`,
        code: 'PAYMENT_ALREADY_PROCESSED',
        details: {
          currentStatus: payment.status,
          processedAt: status === 'accepted' ? payment.acceptedAt : payment.rejectedAt
        }
      });
    }

    // Update payment status
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'accepted') {
      updateData.acceptedAt = new Date();
      updateData.acceptedBy = adminId;
    } else {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = adminId;
      if (reason) {
        updateData.rejectionReason = reason;
      }
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    ).populate('studentId', 'firstName secondName thirdName fourthName userEmail')
     .populate('courseId', 'title price')
     .populate('acceptedBy', 'firstName secondName thirdName fourthName')
     .populate('rejectedBy', 'firstName secondName thirdName fourthName');

    // Update user enrollment status
    const user = await User.findById(payment.studentId._id);
    if (user) {
      const enrollment = user.enrolledCourses.find(
        enrollment => enrollment.course && enrollment.course.toString() === payment.courseId._id.toString()
      );

      if (enrollment) {
        enrollment.paymentStatus = status === 'accepted' ? 'approved' : 'rejected';
        if (status === 'accepted') {
          enrollment.paymentApprovedAt = new Date();
          enrollment.paymentId = payment._id;
        } else {
          enrollment.paymentRejectedAt = new Date();
          if (reason) {
            enrollment.rejectionReason = reason;
          }
        }
      } else if (status === 'accepted') {
        // Add new enrollment if payment is accepted
        user.enrolledCourses.push({
          course: payment.courseId._id,
          paymentStatus: 'approved',
          paymentApprovedAt: new Date(),
          paymentId: payment._id,
          proofImage: payment.screenshot,
          enrolledAt: new Date()
        });
      }
      
      // Add course to allowedCourses for access control
      if (status === 'accepted' && !user.allowedCourses.includes(payment.courseId._id)) {
        user.allowedCourses.push(payment.courseId._id);
      }
      
      await user.save();
    }

    // Send notification to student
    try {
      if (status === 'accepted') {
        await NotificationService.notifyPaymentApproved(paymentId);
      } else {
        await NotificationService.notifyPaymentRejected(paymentId, reason);
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      data: updatedPayment
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while updating payment',
      message: 'An error occurred while updating payment status',
      code: 'UPDATE_PAYMENT_ERROR'
    });
  }
};

// Bulk update payment statuses
const bulkUpdatePaymentStatuses = async (req, res) => {
  try {
    const { paymentIds, status, reason } = req.body;
    const adminId = req.user._id;

    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment IDs',
        message: 'Payment IDs must be provided as an array',
        code: 'INVALID_PAYMENT_IDS'
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be either "accepted" or "rejected"',
        code: 'INVALID_STATUS'
      });
    }

    // Find all payments
    const payments = await Payment.find({
      _id: { $in: paymentIds },
      status: 'pending'
    }).populate('studentId', 'firstName secondName thirdName fourthName userEmail')
      .populate('courseId', 'title price');

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No pending payments found',
        message: 'No pending payments found with the provided IDs',
        code: 'NO_PENDING_PAYMENTS'
      });
    }

    // Update all payments
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'accepted') {
      updateData.acceptedAt = new Date();
      updateData.acceptedBy = adminId;
    } else {
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = adminId;
      if (reason) {
        updateData.rejectionReason = reason;
      }
    }

    const updatedPayments = await Payment.updateMany(
      { _id: { $in: paymentIds }, status: 'pending' },
      updateData
    );

    // Update user enrollments
    for (const payment of payments) {
      const user = await User.findById(payment.studentId._id);
      if (user) {
        const enrollment = user.enrolledCourses.find(
          course => course.courseId.toString() === payment.courseId._id.toString()
        );

        if (enrollment) {
          enrollment.paymentStatus = status === 'accepted' ? 'approved' : 'rejected';
          enrollment.processedAt = new Date();
          if (status === 'rejected' && reason) {
            enrollment.rejectionReason = reason;
          }
          await user.save();
        }
      }

      // Send notifications
      try {
        if (status === 'accepted') {
          await NotificationService.notifyPaymentAccepted(payment._id);
        } else {
          await NotificationService.notifyPaymentRejected(payment._id, reason);
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }
    }

    res.json({
      success: true,
      message: `${updatedPayments.modifiedCount} payments ${status} successfully`,
      data: {
        updatedCount: updatedPayments.modifiedCount,
        totalRequested: paymentIds.length
      }
    });

  } catch (error) {
    console.error('Bulk update payment statuses error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while bulk updating payments',
      message: 'An error occurred while updating payment statuses',
      code: 'BULK_UPDATE_PAYMENTS_ERROR'
    });
  }
};

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    console.log('📊 getPaymentStatistics called with params:', req.params, 'query:', req.query);
    
    // Validate authentication and admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Admin access only' 
      });
    }

    // Validate and sanitize query parameters
    const { period = 'all', from, to } = req.query;
    
    // Validate period parameter
    const validPeriods = ['all', 'today', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid period parameter. Must be one of: all, today, week, month, year' 
      });
    }

    // Validate date parameters if provided
    if (from && isNaN(Date.parse(from))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid from date format' 
      });
    }
    if (to && isNaN(Date.parse(to))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid to date format' 
      });
    }

    // Build date filter
    let dateFilter = {};
    
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case 'today':
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: weekAgo } };
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: monthAgo } };
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          dateFilter = { createdAt: { $gte: yearAgo } };
          break;
      }
    }

    // If custom date range is provided, use it instead
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to);
    }

    // Execute aggregation with error handling
    const stats = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          },
          acceptedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$amount', 0] }
          },
          rejectedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] }
          },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get daily statistics for the last 30 days with error handling
    let dailyStats = [];
    try {
      dailyStats = await Payment.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
            acceptedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$amount', 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    } catch (dailyStatsError) {
      console.error('Error fetching daily stats:', dailyStatsError);
      // Continue without daily stats rather than failing completely
      dailyStats = [];
    }

    // Ensure we have a valid result even if aggregation returns empty
    const result = stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      pendingCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,
      pendingAmount: 0,
      acceptedAmount: 0,
      rejectedAmount: 0,
      averageAmount: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        dailyStats: dailyStats || [],
        period
      }
    });

  } catch (error) {
    console.error('Error in /api/admin/payments/statistics:', error);
    console.error('Error stack:', error.stack);
    console.error('Request user:', req.user);
    console.error('Request query:', req.query);
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching payment statistics' 
    });
  }
};

// Export payment data
const exportPayments = async (req, res) => {
  try {
    const { format = 'json', status = 'all', startDate, endDate } = req.query;

    const filter = {};
    
    if (status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(filter)
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail phoneStudent')
      .populate('courseId', 'title price subject grade')
      .populate('acceptedBy', 'firstName secondName thirdName fourthName')
      .populate('rejectedBy', 'firstName secondName thirdName fourthName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = payments.map(payment => ({
        'Transaction ID': payment.transactionId || 'N/A',
        'Student Name': payment.studentName,
        'Student Email': payment.studentId?.userEmail || 'N/A',
        'Student Phone': payment.studentPhone,
        'Course': payment.courseId?.title || 'N/A',
        'Amount': payment.amount,
        'Status': payment.status,
        'Created At': payment.createdAt.toISOString(),
        'Processed At': payment.acceptedAt || payment.rejectedAt || 'N/A',
        'Processed By': payment.acceptedBy?.firstName || payment.rejectedBy?.firstName || 'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        success: true,
        data: payments,
        exportedAt: new Date().toISOString(),
        totalRecords: payments.length
      });
    }

  } catch (error) {
    console.error('Export payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while exporting payments',
      message: 'An error occurred while exporting payment data',
      code: 'EXPORT_PAYMENTS_ERROR'
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  bulkUpdatePaymentStatuses,
  getPaymentStatistics,
  exportPayments
};

