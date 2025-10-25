const Payment = require('../../models/Payment');
const User = require('../../models/User');

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    const { senderNumber, studentNumber, parentNumber } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!senderNumber || !studentNumber) {
      return res.status(400).json({
        success: false,
        error: "الحقول المطلوبة: رقم المرسل ورقم الطالبة"
      });
    }

    // Validate phone numbers
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(senderNumber)) {
      return res.status(400).json({
        success: false,
        error: "رقم المرسل غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم"
      });
    }

    if (!phoneRegex.test(studentNumber)) {
      return res.status(400).json({
        success: false,
        error: "رقم الطالبة غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم"
      });
    }

    if (parentNumber && !phoneRegex.test(parentNumber)) {
      return res.status(400).json({
        success: false,
        error: "رقم ولي الأمر غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "صورة إثبات الدفع مطلوبة"
      });
    }

    // Upload to GridFS
    const { uploadImageToGridFS } = require('../../utils/simpleGridfsUpload');
    let proofImageUrl;
    
    try {
      const result = await uploadImageToGridFS(req.file, userId);
      proofImageUrl = result.url;
    } catch (gridfsError) {
      console.error('GridFS upload error:', gridfsError);
      return res.status(500).json({
        success: false,
        error: "فشل في رفع الصورة إلى التخزين المحلي"
      });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "المستخدم غير موجود"
      });
    }

    // Create Payment record
    const paymentData = {
      studentId: userId,
      studentPhone: studentNumber,
      parentPhone: parentNumber,
      senderPhone: senderNumber,
      amount: 0, // Will be updated when course is selected
      transferTime: new Date(),
      submittedAt: new Date(),
      proofImage: proofImageUrl,
      status: "pending",
      currency: "EGP",
      paymentMethod: "vodafone_cash"
    };

    // Create new payment
    const payment = new Payment(paymentData);
    await payment.save();

    return res.status(200).json({
      success: true,
      message: "تم إرسال إثبات الدفع بنجاح، سيتم المراجعة من قبل الإدارة.",
      paymentId: payment._id,
      proofImage: proofImageUrl
    });

  } catch (error) {
    console.error('Upload payment proof error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      success: false,
      error: "خطأ في الخادم أثناء رفع إثبات الدفع",
      details: error.message
    });
  }
};

module.exports = {
  uploadPaymentProof
};
