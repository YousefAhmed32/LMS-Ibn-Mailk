const PaymentProof = require('../../models/PaymentProof');
const PaymentGateway = require('../../models/PaymentGateway');
const Course = require('../../models/Course');

// PayPal integration
const createPayPalPayment = async (req, res) => {
  try {
    const { courseId, amount, currency = 'EGP' } = req.body;
    const userId = req.user._id;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "الدورة غير موجودة"
      });
    }

    // Check if amount matches course price
    if (parseFloat(amount) !== course.price) {
      return res.status(400).json({
        success: false,
        error: `المبلغ يجب أن يكون ${course.price} جنيه`
      });
    }

    // Get PayPal configuration
    const paypalConfig = await PaymentGateway.getGatewayConfig('paypal');
    if (!paypalConfig) {
      return res.status(500).json({
        success: false,
        error: "PayPal غير متاح حالياً"
      });
    }

    // Here you would integrate with PayPal SDK
    // For now, we'll create a mock response
    const mockPayPalResponse = {
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${Date.now()}`,
          rel: 'approval_url',
          method: 'REDIRECT'
        }
      ]
    };

    // Create payment proof record
    const paymentProof = new PaymentProof({
      studentId: userId,
      courseId: courseId,
      amount: parseFloat(amount),
      paymentMethod: 'paypal',
      gatewayTransactionId: mockPayPalResponse.id,
      gatewayResponse: mockPayPalResponse,
      status: 'pending',
      currency: currency
    });

    await paymentProof.save();

    res.json({
      success: true,
      message: "تم إنشاء طلب الدفع بنجاح",
      data: {
        paymentId: paymentProof._id,
        gatewayResponse: mockPayPalResponse,
        redirectUrl: mockPayPalResponse.links[0].href
      }
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في إنشاء طلب الدفع",
      details: error.message
    });
  }
};

// Stripe integration
const createStripePayment = async (req, res) => {
  try {
    const { courseId, amount, currency = 'EGP' } = req.body;
    const userId = req.user._id;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "الدورة غير موجودة"
      });
    }

    // Check if amount matches course price
    if (parseFloat(amount) !== course.price) {
      return res.status(400).json({
        success: false,
        error: `المبلغ يجب أن يكون ${course.price} جنيه`
      });
    }

    // Get Stripe configuration
    const stripeConfig = await PaymentGateway.getGatewayConfig('stripe');
    if (!stripeConfig) {
      return res.status(500).json({
        success: false,
        error: "Stripe غير متاح حالياً"
      });
    }

    // Here you would integrate with Stripe SDK
    // For now, we'll create a mock response
    const mockStripeResponse = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Stripe uses cents
      currency: currency.toLowerCase()
    };

    // Create payment proof record
    const paymentProof = new PaymentProof({
      studentId: userId,
      courseId: courseId,
      amount: parseFloat(amount),
      paymentMethod: 'stripe',
      gatewayTransactionId: mockStripeResponse.id,
      gatewayResponse: mockStripeResponse,
      status: 'pending',
      currency: currency
    });

    await paymentProof.save();

    res.json({
      success: true,
      message: "تم إنشاء طلب الدفع بنجاح",
      data: {
        paymentId: paymentProof._id,
        clientSecret: mockStripeResponse.client_secret,
        publishableKey: stripeConfig.publishableKey
      }
    });
  } catch (error) {
    console.error('Create Stripe payment error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في إنشاء طلب الدفع",
      details: error.message
    });
  }
};

// Handle PayPal webhook
const handlePayPalWebhook = async (req, res) => {
  try {
    const { event_type, resource } = req.body;

    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paymentProof = await PaymentProof.findOne({
        gatewayTransactionId: resource.id
      });

      if (paymentProof && paymentProof.status === 'pending') {
        paymentProof.status = 'approved';
        paymentProof.gatewayResponse = resource;
        await paymentProof.save();

        // Here you would typically:
        // 1. Enroll student in course
        // 2. Send confirmation email
        // 3. Update course enrollment count
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في معالجة webhook"
    });
  }
};

// Handle Stripe webhook
const handleStripeWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data.object;
      const paymentProof = await PaymentProof.findOne({
        gatewayTransactionId: paymentIntent.id
      });

      if (paymentProof && paymentProof.status === 'pending') {
        paymentProof.status = 'approved';
        paymentProof.gatewayResponse = paymentIntent;
        await paymentProof.save();

        // Here you would typically:
        // 1. Enroll student in course
        // 2. Send confirmation email
        // 3. Update course enrollment count
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في معالجة webhook"
    });
  }
};

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const activeGateways = await PaymentGateway.getActiveGateways();
    
    const paymentMethods = activeGateways.map(gateway => ({
      id: gateway.name,
      name: gateway.name === 'paypal' ? 'PayPal' : 
            gateway.name === 'stripe' ? 'Stripe' :
            gateway.name === 'vodafone_cash' ? 'Vodafone Cash' :
            gateway.name === 'bank_transfer' ? 'Bank Transfer' : gateway.name,
      description: gateway.description,
      logo: gateway.logo,
      fees: gateway.formattedFees,
      supportedCurrencies: gateway.supportedCurrencies
    }));

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في جلب طرق الدفع",
      details: error.message
    });
  }
};

// Verify payment status
const verifyPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user._id;

    const paymentProof = await PaymentProof.findOne({
      _id: paymentId,
      studentId: userId
    }).populate('courseId', 'title price');

    if (!paymentProof) {
      return res.status(404).json({
        success: false,
        error: "إثبات الدفع غير موجود"
      });
    }

    // Here you would verify with the payment gateway
    // For now, we'll return the current status

    res.json({
      success: true,
      data: {
        paymentId: paymentProof._id,
        status: paymentProof.status,
        amount: paymentProof.amount,
        currency: paymentProof.currency,
        paymentMethod: paymentProof.paymentMethod,
        course: paymentProof.courseId,
        createdAt: paymentProof.createdAt,
        approvedAt: paymentProof.approvedAt
      }
    });
  } catch (error) {
    console.error('Verify payment status error:', error);
    res.status(500).json({
      success: false,
      error: "خطأ في التحقق من حالة الدفع",
      details: error.message
    });
  }
};

module.exports = {
  createPayPalPayment,
  createStripePayment,
  handlePayPalWebhook,
  handleStripeWebhook,
  getPaymentMethods,
  verifyPaymentStatus
};
