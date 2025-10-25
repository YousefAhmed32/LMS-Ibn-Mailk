const Payment = require('../../models/Payment');
const Course = require('../../models/Course');
const User = require('../../models/User');
const { uploadImageToGridFS } = require('../../utils/simpleGridfsUpload');
const NotificationService = require('../../services/notificationService');
const MongoDBErrorHandler = require('../../utils/mongoErrorHandler');

// Submit payment proof for course enrollment
const submitPayment = async (req, res) => {
  try {
    console.log('Payment submission request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? 'File present' : 'No file');
    console.log('Request file details:', req.file);
    console.log('User ID:', req.user._id);
    console.log('User object:', req.user);
    
    const { courseId, studentName, studentPhone, amount, transactionId } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!courseId || !studentName || !studentPhone || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, studentName, studentPhone, amount'
      });
    }

    // Validate phone number format
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(studentPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Egyptian phone number (e.g., 01012345678)'
      });
    }

    // Check if course exists and get its price
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Validate amount matches course price
    if (parseFloat(amount) !== course.price) {
      return res.status(400).json({
        success: false,
        error: `Amount must match course price: ${course.price} EGP`
      });
    }

    // Check if user is already enrolled in this course
    const user = await User.findById(studentId);
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === courseId
    );

    if (existingEnrollment && existingEnrollment.paymentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'You are already enrolled in this course'
      });
    }

    // Check for duplicate pending payment
    const existingPayment = await Payment.findOne({
      studentId,
      courseId,
      status: 'pending'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending payment for this course',
        code: 'DUPLICATE_PENDING_PAYMENT',
        details: {
          existingPaymentId: existingPayment._id,
          submittedAt: existingPayment.createdAt,
          suggestion: 'Please wait for admin approval or contact support if this is an error'
        }
      });
    }

    // Check for duplicate transaction ID if provided
    if (transactionId) {
      const transactionExists = await MongoDBErrorHandler.checkTransactionIdExists(
        transactionId.trim(), 
        Payment
      );
      
      if (transactionExists) {
        return res.status(409).json({
          success: false,
          error: 'Payment already submitted',
          message: `A payment with transaction ID "${transactionId}" already exists. Please use a different transaction ID or contact support if this is an error.`,
          code: 'DUPLICATE_TRANSACTION_ID',
          details: {
            field: 'transactionId',
            value: transactionId,
            suggestion: 'Use a unique transaction ID from your payment app'
          }
        });
      }
    }

    // Handle file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Payment screenshot is required'
      });
    }

    let screenshotUrl;
    try {
      const result = await uploadImageToGridFS(req.file, req.user?._id);
      screenshotUrl = result.url;
    } catch (uploadError) {
      console.error('GridFS upload error:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload payment screenshot'
      });
    }

    // Create payment record
    const payment = new Payment({
      studentId,
      courseId,
      studentName: studentName.trim(),
      studentPhone,
      amount: parseFloat(amount),
      transactionId: transactionId ? transactionId.trim() : undefined,
      screenshot: screenshotUrl,
      status: 'pending'
    });

    await payment.save();

    // Update user enrollment status to pending
    if (existingEnrollment) {
      existingEnrollment.paymentStatus = 'pending';
      existingEnrollment.proofImage = screenshotUrl;
      existingEnrollment.paymentId = payment._id;
    } else {
      user.enrolledCourses.push({
        course: courseId,
        paymentStatus: 'pending',
        proofImage: screenshotUrl,
        paymentId: payment._id,
        enrolledAt: new Date()
      });
    }

    await user.save();

    // Create notification for payment submission
    await NotificationService.notifyPaymentSubmitted(payment._id);

    // Populate the response with course and student details
    await payment.populate([
      { path: 'courseId', select: 'title price' },
      { path: 'studentId', select: 'firstName secondName thirdName fourthName userEmail' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment details submitted successfully. Please wait for admin approval.',
      data: payment,
      redirectUrl: "/"
    });

  } catch (error) {
    console.error('Submit payment error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle MongoDB errors gracefully
    const errorResponse = MongoDBErrorHandler.handle(error, 'payment submission');
    
    // If it's a MongoDB error, return the formatted response
    if (errorResponse.status !== 500) {
      return res.status(errorResponse.status).json(errorResponse);
    }
    
    // For non-MongoDB errors, return generic error
    res.status(500).json({
      success: false,
      error: 'Internal server error while submitting payment',
      message: 'An unexpected error occurred. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all payments (Admin only)
const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('courseId', 'title price subject grade')
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail phoneStudent')
      .populate('acceptedBy', 'firstName secondName thirdName fourthName')
      .populate('rejectedBy', 'firstName secondName thirdName fourthName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching payments'
    });
  }
};

// Accept payment (Admin only)
const acceptPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const adminId = req.user._id;

    const payment = await Payment.findById(paymentId)
      .populate('courseId')
      .populate('studentId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending payments can be accepted'
      });
    }

    // Accept the payment
    await payment.accept(adminId);

    // Update user enrollment status
    const user = await User.findById(payment.studentId._id);
    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === payment.courseId._id.toString()
    );

    if (enrollment) {
      enrollment.paymentStatus = 'approved';
      enrollment.paymentApprovedAt = new Date();
      enrollment.paymentId = payment._id;
    } else {
      user.enrolledCourses.push({
        course: payment.courseId._id,
        paymentStatus: 'approved',
        paymentApprovedAt: new Date(),
        paymentId: payment._id,
        proofImage: payment.screenshot,
        enrolledAt: new Date()
      });
    }

    // Add course to user's allowedCourses if not already present
    if (!user.allowedCourses.includes(payment.courseId._id)) {
      user.allowedCourses.push(payment.courseId._id);
    }

    await user.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(payment.courseId._id, {
      $inc: { totalEnrollments: 1 },
      $addToSet: { enrolledStudents: payment.studentId._id }
    });

    // Create notification for payment approval
    await NotificationService.notifyPaymentApproved(payment._id);
    
    // Notify course activation
    await NotificationService.notifyCourseActivated(payment.studentId._id, payment.courseId._id);

    // Populate the updated payment
    await payment.populate([
      { path: 'courseId', select: 'title price' },
      { path: 'studentId', select: 'firstName secondName thirdName fourthName userEmail' },
      { path: 'acceptedBy', select: 'firstName secondName thirdName fourthName' }
    ]);

    res.json({
      success: true,
      message: 'Payment accepted successfully. Student has been enrolled in the course.',
      data: payment,
      redirectUrl: "/"
    });

  } catch (error) {
    console.error('Accept payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while accepting payment'
    });
  }
};

// Reject payment (Admin only)
const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user._id;

    const payment = await Payment.findById(paymentId)
      .populate('courseId')
      .populate('studentId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending payments can be rejected'
      });
    }

    // Reject the payment
    await payment.reject(adminId, rejectionReason);

    // Update user enrollment status
    const user = await User.findById(payment.studentId._id);
    const enrollment = user.enrolledCourses.find(
      enrollment => enrollment.course && enrollment.course.toString() === payment.courseId._id.toString()
    );

    if (enrollment) {
      enrollment.paymentStatus = 'rejected';
      enrollment.paymentRejectedAt = new Date();
      enrollment.rejectionReason = rejectionReason;
    }

    await user.save();

    // Create notification for payment rejection
    await NotificationService.notifyPaymentRejected(payment._id, rejectionReason);

    // Populate the updated payment
    await payment.populate([
      { path: 'courseId', select: 'title price' },
      { path: 'studentId', select: 'firstName secondName thirdName fourthName userEmail' },
      { path: 'rejectedBy', select: 'firstName secondName thirdName fourthName' }
    ]);

    res.json({
      success: true,
      message: 'Payment rejected successfully.',
      data: payment
    });

  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while rejecting payment'
    });
  }
};

// Get payment statistics (Admin only)
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getPaymentStats();
    const result = stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      acceptedAmount: 0,
      pendingAmount: 0,
      rejectedAmount: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching payment statistics'
    });
  }
};

// Get student's payment history
const getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status } = req.query;
    const filter = { studentId };

    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('courseId', 'title price subject grade')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get student payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching student payments'
    });
  }
};

module.exports = {
  submitPayment,
  getAllPayments,
  acceptPayment,
  rejectPayment,
  getPaymentStats,
  getStudentPayments
};
