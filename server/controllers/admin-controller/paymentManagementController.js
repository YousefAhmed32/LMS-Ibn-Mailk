const PaymentProof = require('../../models/PaymentProof');
const User = require('../../models/User');
const Course = require('../../models/Course');

// Get all payment proofs with filters
const getAllPaymentProofs = async (req, res) => {
  try {
    const { 
      status, 
      paymentMethod, 
      courseId, 
      studentId,
      startDate, 
      endDate,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    if (courseId) {
      query.courseId = courseId;
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const paymentProofs = await PaymentProof.find(query)
      .populate([
        { path: 'studentId', select: 'name email phone' },
        { path: 'courseId', select: 'title price thumbnail' },
        { path: 'approvedBy', select: 'name email' },
        { path: 'rejectedBy', select: 'name email' }
      ])
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PaymentProof.countDocuments(query);

    // Get statistics
    const stats = await PaymentProof.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          approvedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] }
          },
          rejectedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: paymentProofs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        approvedPayments: 0,
        approvedAmount: 0,
        pendingPayments: 0,
        pendingAmount: 0,
        rejectedPayments: 0
      }
    });
  } catch (error) {
    console.error('Get all payment proofs error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في جلب بيانات المدفوعات",
      details: error.message
    });
  }
};

// Get payment proof by ID (admin)
const getPaymentProofById = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentProof = await PaymentProof.findById(id)
      .populate([
        { path: 'studentId', select: 'name email phone createdAt' },
        { path: 'courseId', select: 'title price thumbnail description' },
        { path: 'approvedBy', select: 'name email' },
        { path: 'rejectedBy', select: 'name email' }
      ]);

    if (!paymentProof) {
      return res.status(404).json({
        success: false,
        error: "إثبات الدفع غير موجود"
      });
    }

    res.json({
      success: true,
      data: paymentProof
    });
  } catch (error) {
    console.error('Get payment proof error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في جلب بيانات إثبات الدفع",
      details: error.message
    });
  }
};

// Approve payment proof
const approvePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    const paymentProof = await PaymentProof.findById(id)
      .populate('studentId courseId');

    if (!paymentProof) {
      return res.status(404).json({
        success: false,
        error: "إثبات الدفع غير موجود"
      });
    }

    if (paymentProof.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: "لا يمكن الموافقة على هذا الدفع",
        alreadyProcessed: true
      });
    }

    // Approve the payment
    await paymentProof.approve(adminId);

    // 1. Enroll student in the course
    if (paymentProof.courseId && paymentProof.studentId) {
      const User = require('../../models/User');
      const user = await User.findById(paymentProof.studentId._id);
      
      if (user) {
        // Check if course is already enrolled (prevent duplicates)
        const existingEnrollment = user.enrolledCourses.find(
          enrollment => enrollment.courseId.toString() === paymentProof.courseId._id.toString()
        );
        
        if (existingEnrollment) {
          // Update existing enrollment
          existingEnrollment.paymentStatus = "approved";
          existingEnrollment.paymentApprovedAt = new Date();
        } else {
          // Add new enrollment
          user.enrolledCourses.push({
            courseId: paymentProof.courseId._id,
            enrolledAt: new Date(),
            paymentStatus: "approved",
            paymentApprovedAt: new Date()
          });
        }

        // Add course to user's allowedCourses if not already present
        if (!user.allowedCourses.includes(paymentProof.courseId._id)) {
          user.allowedCourses.push(paymentProof.courseId._id);
        }
        
        await user.save();
        console.log('Course enrollment status updated successfully');
      }
    }

    // 2. Send notification to student
    try {
      if (paymentProof.studentId && paymentProof.courseId) {
        const NotificationService = require('../../services/notificationService');
        await NotificationService.createNotification(paymentProof.studentId._id, {
          type: 'course_activated',
          title: 'Course Activated',
          message: '✅ Your course has been successfully activated. You can now start learning.',
          data: {
            paymentId: paymentProof._id,
            courseId: paymentProof.courseId._id,
            courseTitle: paymentProof.courseId.title
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

    res.json({
      success: true,
      message: "تم الموافقة على الدفع بنجاح",
      data: paymentProof,
      course: paymentProof.courseId,
      student: paymentProof.studentId
    });
  } catch (error) {
    console.error('Approve payment proof error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في الموافقة على الدفع",
      details: error.message
    });
  }
};

// Reject payment proof
const rejectPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    const paymentProof = await PaymentProof.findById(id)
      .populate('studentId courseId');

    if (!paymentProof) {
      return res.status(404).json({
        success: false,
        error: "إثبات الدفع غير موجود"
      });
    }

    if (paymentProof.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: "لا يمكن رفض هذا الدفع",
        alreadyProcessed: true
      });
    }

    // Reject the payment
    await paymentProof.reject(adminId, rejectionReason);

    // Here you would typically:
    // 1. Send rejection email to student
    // 2. Provide instructions for resubmission

    res.json({
      success: true,
      message: "تم رفض الدفع",
      data: paymentProof
    });
  } catch (error) {
    console.error('Reject payment proof error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في رفض الدفع",
      details: error.message
    });
  }
};

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overall statistics
    const overallStats = await PaymentProof.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          approvedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] }
          },
          rejectedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get period statistics
    const periodStats = await PaymentProof.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          periodPayments: { $sum: 1 },
          periodAmount: { $sum: "$amount" },
          periodApproved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          },
          periodApprovedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0] }
          }
        }
      }
    ]);

    // Get daily statistics for the period
    const dailyStats = await PaymentProof.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Get payment method statistics
    const methodStats = await PaymentProof.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          amount: { $sum: "$amount" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          approvedPayments: 0,
          approvedAmount: 0,
          pendingPayments: 0,
          pendingAmount: 0,
          rejectedPayments: 0
        },
        period: periodStats[0] || {
          periodPayments: 0,
          periodAmount: 0,
          periodApproved: 0,
          periodApprovedAmount: 0
        },
        daily: dailyStats,
        methods: methodStats
      }
    });
  } catch (error) {
    console.error('Get payment statistics error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في جلب إحصائيات المدفوعات",
      details: error.message
    });
  }
};

// Bulk approve payments
const bulkApprovePayments = async (req, res) => {
  try {
    const { paymentIds } = req.body;
    const adminId = req.user._id;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "يرجى تحديد المدفوعات للموافقة عليها"
      });
    }

    const results = [];
    const errors = [];

    for (const paymentId of paymentIds) {
      try {
        const paymentProof = await PaymentProof.findById(paymentId);
        
        if (!paymentProof) {
          errors.push({ paymentId, error: "إثبات الدفع غير موجود" });
          continue;
        }

        if (paymentProof.status !== 'pending') {
          errors.push({ paymentId, error: "الدفع غير معلق" });
          continue;
        }

        await paymentProof.approve(adminId);
        results.push(paymentProof);
      } catch (error) {
        errors.push({ paymentId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `تم الموافقة على ${results.length} من ${paymentIds.length} مدفوعات`,
      data: {
        approved: results,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Bulk approve payments error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في الموافقة الجماعية على المدفوعات",
      details: error.message
    });
  }
};

module.exports = {
  getAllPaymentProofs,
  getPaymentProofById,
  approvePaymentProof,
  rejectPaymentProof,
  getPaymentStatistics,
  bulkApprovePayments
};
