import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth token
const createAuthInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Create axios instance for file uploads
const createFormInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData - let browser set it with boundary
    }
  });
};

const paymentService = {
  // ==================== PAYMENT PROOF MANAGEMENT ====================
  
  // Upload payment proof
  uploadPaymentProof: async (formData) => {
    const instance = createFormInstance();
    return await instance.post('/payment/upload-proof', formData);
  },

  // Get student's payment proofs
  getStudentPayments: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/payment/my-payments?${params}`);
  },

  // Get specific payment proof
  getPaymentById: async (paymentId) => {
    const instance = createAuthInstance();
    return await instance.get(`/payment/my-payments/${paymentId}`);
  },

  // Get student payment statistics
  getStudentPaymentStats: async () => {
    const instance = createAuthInstance();
    return await instance.get('/payment/my-stats');
  },

  // ==================== PAYMENT GATEWAY INTEGRATION ====================
  
  // Get available payment methods
  getPaymentMethods: async () => {
    const instance = createAuthInstance();
    return await instance.get('/payment/methods');
  },

  // Create PayPal payment
  createPayPalPayment: async (paymentData) => {
    const instance = createAuthInstance();
    return await instance.post('/payment/paypal/create', paymentData);
  },

  // Create Stripe payment
  createStripePayment: async (paymentData) => {
    const instance = createAuthInstance();
    return await instance.post('/payment/stripe/create', paymentData);
  },

  // Verify payment status
  verifyPaymentStatus: async (paymentId) => {
    const instance = createAuthInstance();
    return await instance.get(`/payment/verify/${paymentId}`);
  },

  // ==================== COURSE-SPECIFIC PAYMENTS ====================
  
  // Upload payment proof for specific course
  uploadCoursePaymentProof: async (courseId, formData) => {
    const instance = createFormInstance();
    return await instance.post(`/courses/${courseId}/upload-proof`, formData);
  },

  // Get course payment status
  getCoursePaymentStatus: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/courses/${courseId}/payment-status`);
  },

  // ==================== UTILITY FUNCTIONS ====================
  
  // Format amount for display
  formatAmount: (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Get payment status color
  getPaymentStatusColor: (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      approved: 'text-green-600 bg-green-100 border-green-200',
      rejected: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-100 border-gray-200';
  },

  // Get payment status text
  getPaymentStatusText: (status) => {
    const texts = {
      pending: 'في الانتظار',
      approved: 'معتمد',
      rejected: 'مرفوض'
    };
    return texts[status] || 'غير محدد';
  },

  // Get payment method display name
  getPaymentMethodName: (method) => {
    const names = {
      vodafone_cash: 'Vodafone Cash',
      paypal: 'PayPal',
      stripe: 'Stripe',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash'
    };
    return names[method] || method;
  },

  // Validate phone number
  validatePhoneNumber: (phone) => {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
  },

  // Validate file for upload
  validateFile: (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('الملف مطلوب');
      return errors;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('نوع الملف غير مدعوم. يرجى اختيار صورة JPG أو PNG أو WebP');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    }
    
    return errors;
  }
};

export default paymentService;
