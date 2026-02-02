const Payment = require('../../models/Payment');
const Course = require('../../models/Course');
const User = require('../../models/User');
const { uploadImageToGridFS } = require('../../utils/simpleGridfsUpload');
const NotificationService = require('../../services/notificationService');
const MongoDBErrorHandler = require('../../utils/mongoErrorHandler');
const TransactionIdGenerator = require('../../utils/transactionIdGenerator');
const { normalizeForStorage } = require('../../utils/phoneUtils');

/**
 * Enhanced Payment Controller with Best Practices
 * Handles payment submission with comprehensive error handling and duplicate prevention
 */

// Submit payment proof for course enrollment
const submitPayment = async (req, res) => {
  try {
    console.log('Payment submission request received');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user._id);
    
    const { courseId, studentName, studentPhone, amount, transactionId } = req.body;
    const studentId = req.user._id;

    // Step 1: Validate required fields
    const validationResult = validatePaymentData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validationResult.message,
        code: 'VALIDATION_ERROR',
        details: validationResult.details
      });
    }

    // Step 2: Check if course exists and validate amount
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
        message: 'The requested course does not exist',
        code: 'COURSE_NOT_FOUND'
      });
    }

    if (parseFloat(amount) !== course.price) {
      return res.status(400).json({
        success: false,
        error: 'Amount mismatch',
        message: `Amount must match course price: ${course.price} EGP`,
        code: 'AMOUNT_MISMATCH',
        details: {
          provided: parseFloat(amount),
          required: course.price
        }
      });
    }

    // Step 3: Check for existing enrollment
    const user = await User.findById(studentId);
    const existingEnrollment = user.enrolledCourses.find(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (existingEnrollment && existingEnrollment.paymentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled',
        message: 'You are already enrolled in this course',
        code: 'ALREADY_ENROLLED',
        details: {
          enrollmentDate: existingEnrollment.enrolledAt,
          paymentStatus: existingEnrollment.paymentStatus
        }
      });
    }

    // Step 4: Check for duplicate pending payment
    const existingPayment = await Payment.findOne({
      studentId,
      courseId,
      status: 'pending'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Pending payment exists',
        message: 'You already have a pending payment for this course',
        code: 'DUPLICATE_PENDING_PAYMENT',
        details: {
          existingPaymentId: existingPayment._id,
          submittedAt: existingPayment.createdAt,
          suggestion: 'Please wait for admin approval or contact support if this is an error'
        }
      });
    }

    // Step 5: Handle transaction ID (generate if not provided, check for duplicates if provided)
    let finalTransactionId = transactionId;
    
    if (!finalTransactionId) {
      // Generate unique transaction ID
      finalTransactionId = TransactionIdGenerator.generate(studentPhone);
      console.log('Generated transaction ID:', finalTransactionId);
    } else {
      // Check if provided transaction ID already exists
      finalTransactionId = finalTransactionId.trim();
      
      const transactionExists = await Payment.findOne({ 
        transactionId: finalTransactionId 
      });
      
      if (transactionExists) {
        return res.status(409).json({
          success: false,
          error: 'Transaction already exists',
          message: `A payment with transaction ID "${finalTransactionId}" already exists. Please use a different transaction ID.`,
          code: 'DUPLICATE_TRANSACTION_ID',
          details: {
            field: 'transactionId',
            value: finalTransactionId,
            existingPaymentId: transactionExists._id,
            suggestion: 'Use a unique transaction ID from your payment app or leave empty for auto-generation'
          }
        });
      }
    }

    // Step 6: Handle file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Screenshot required',
        message: 'Payment screenshot is required',
        code: 'MISSING_SCREENSHOT'
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
        error: 'Upload failed',
        message: 'Failed to upload payment screenshot',
        code: 'UPLOAD_ERROR',
        details: uploadError.message
      });
    }

    // Step 7: Create payment record (normalize phone to E.164)
    const studentPhoneE164 = normalizeForStorage(studentPhone);
    const paymentData = {
      studentId,
      courseId,
      studentName: studentName.trim(),
      studentPhone: studentPhoneE164 || studentPhone,
      amount: parseFloat(amount),
      transactionId: finalTransactionId,
      screenshot: screenshotUrl,
      status: 'pending',
      paymentMethod: 'vodafone_cash',
      currency: 'EGP'
    };

    const payment = new Payment(paymentData);
    await payment.save();

    // Step 8: Update user enrollment status
    if (existingEnrollment) {
      existingEnrollment.paymentStatus = 'pending';
      existingEnrollment.proofImage = screenshotUrl;
    } else {
      user.enrolledCourses.push({
        courseId,
        paymentStatus: 'pending',
        proofImage: screenshotUrl,
        enrolledAt: new Date()
      });
    }

    await user.save();

    // Step 9: Create notification
    try {
      await NotificationService.notifyPaymentSubmitted(payment._id);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the payment if notification fails
    }

    // Step 10: Populate response data
    await payment.populate([
      { path: 'courseId', select: 'title price subject' },
      { path: 'studentId', select: 'firstName secondName thirdName fourthName userEmail' }
    ]);

    // Success response
    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Please wait for admin approval.',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        course: payment.courseId,
        student: payment.studentId,
        submittedAt: payment.createdAt
      },
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
      error: 'Internal server error',
      message: 'An unexpected error occurred while submitting payment. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate payment data
 * @param {Object} data - Payment data to validate
 * @returns {Object} Validation result
 */
const validatePaymentData = (data) => {
  const { courseId, studentName, studentPhone, amount } = data;
  const errors = [];

  // Required fields validation
  if (!courseId) {
    errors.push({
      field: 'courseId',
      message: 'Course ID is required'
    });
  }

  if (!studentName || !studentName.trim()) {
    errors.push({
      field: 'studentName',
      message: 'Student name is required'
    });
  }

  if (!studentPhone) {
    errors.push({
      field: 'studentPhone',
      message: 'Student phone number is required'
    });
  } else {
    const { isValidPhone } = require('../../utils/phoneUtils');
    if (!isValidPhone(studentPhone)) {
      errors.push({
        field: 'studentPhone',
        message: 'Please enter a valid international phone number (e.g. +201234567890)'
      });
    }
  }

  if (!amount) {
    errors.push({
      field: 'amount',
      message: 'Payment amount is required'
    });
  } else {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.push({
        field: 'amount',
        message: 'Please enter a valid payment amount'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? 'Please check your input and try again' : '',
    details: errors
  };
};

/**
 * Get payment by transaction ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getPaymentByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required',
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    const payment = await Payment.findOne({ transactionId })
      .populate('courseId', 'title price subject')
      .populate('studentId', 'firstName secondName thirdName fourthName userEmail');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: 'No payment found with this transaction ID',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment by transaction ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching payment details',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

/**
 * Check if transaction ID exists
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const checkTransactionIdExists = async (req, res) => {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID required',
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID'
      });
    }

    const exists = await Payment.findOne({ transactionId: transactionId.trim() });

    res.json({
      success: true,
      exists: !!exists,
      message: exists ? 'Transaction ID already exists' : 'Transaction ID is available'
    });

  } catch (error) {
    console.error('Check transaction ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while checking transaction ID',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

module.exports = {
  submitPayment,
  getPaymentByTransactionId,
  checkTransactionIdExists
};