import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// ==================== UTILITY FUNCTIONS ====================

// Format currency
export const formatCurrency = (amount, currency = 'EGP') => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get status color for payments
export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || colors.pending;
};

// Get role color for users
export const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    student: 'bg-blue-100 text-blue-800',
    teacher: 'bg-green-100 text-green-800'
  };
  return colors[role] || colors.student;
};

const adminService = {
  // ==================== ANALYTICS ====================
  
  // Get comprehensive analytics
  getAnalytics: async (params = {}) => {
    const instance = createAuthInstance();
    const queryParams = new URLSearchParams(params);
    return await instance.get(`/api/admin/analytics?${queryParams}`);
  },

  // Get analytics service (alias for getAnalytics)
  getAnalyticsService: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/analytics');
  },

  // Get users analytics
  getUsersAnalytics: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/analytics/users');
  },

  // Get courses analytics
  getCoursesAnalytics: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/analytics/courses');
  },

  // Get payments analytics
  getPaymentsAnalytics: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/analytics/payments');
  },

  // Get activity analytics
  getActivityAnalytics: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/analytics/activity');
  },

  // ==================== USERS MANAGEMENT ====================
  
  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/users?${params}`);
  },

  // Get single user details
  getUserById: async (userId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/users/${userId}`);
  },

  // Create new user
  createUser: async (userData) => {
    const instance = createAuthInstance();
    return await instance.post('/api/admin/users', userData);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/users/${userId}`, userData);
  },

  // Delete user
  deleteUser: async (userId) => {
    const instance = createAuthInstance();
    return await instance.delete(`/api/admin/users/${userId}`);
  },

  // Get user courses
  getUserCourses: async (userId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/users/${userId}/courses`);
  },

  // Get user grades
  getUserGrades: async (userId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/users/${userId}/grades`);
  },

  // Get user activities
  getUserActivities: async (userId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/users/${userId}/activities`);
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/users/${userId}/role`, { role });
  },

  // Delete user
  deleteUser: async (userId) => {
    const instance = createAuthInstance();
    return await instance.delete(`/api/admin/users/${userId}`);
  },

  // Create new user
  createUser: async (userData) => {
    const instance = createAuthInstance();
    return await instance.post('/api/admin/users', userData);
  },

  // Update existing user
  updateUser: async (userId, userData) => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/users/${userId}`, userData);
  },

  // Export users to CSV
  exportUsers: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/users/export?${params}`, {
      responseType: 'blob'
    });
  },

  // ==================== VIDEO & QUIZ MANAGEMENT ====================

  // Add video to course
  addVideoToCourse: async (courseId, videoData) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.post(`/api/admin/courses/${courseId}/videos`, videoData);
      return response.data;
    } catch (error) {
      console.error('Error adding video to course:', error);
      throw error;
    }
  },

  // Add quiz to course
  addQuizToCourse: async (courseId, quizData) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.post(`/api/admin/courses/${courseId}/quizzes`, quizData);
      return response.data;
    } catch (error) {
      console.error('Error adding quiz to course:', error);
      throw error;
    }
  },

  // Get course videos
  getCourseVideos: async (courseId) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.get(`/api/admin/courses/${courseId}/videos`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course videos:', error);
      throw error;
    }
  },

  // Update video in course
  updateVideoInCourse: async (courseId, videoId, videoData) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.patch(`/api/admin/courses/${courseId}/videos/${videoId}`, videoData);
      return response.data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete video from course
  deleteVideoFromCourse: async (courseId, videoId) => {
    try {
      const authInstance = createAuthInstance();
      const response = await authInstance.delete(`/api/admin/courses/${courseId}/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // ==================== COURSES MANAGEMENT ====================
  
  // Get all courses with enrollment data
  getAllCourses: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/courses?${params}`);
  },

  // Get course details with enrolled students
  getCourseById: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/courses/${courseId}`);
  },

  // Create new course
  createCourse: async (courseData) => {
    const instance = createAuthInstance();
    // If courseData is FormData, don't set Content-Type header
    if (courseData instanceof FormData) {
      const token = getAuthToken();
      const formInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        }
      });
      return await formInstance.post('/api/admin/courses', courseData);
    }
    return await instance.post('/api/admin/courses', courseData);
  },

  // Update existing course
  updateCourse: async (courseId, courseData) => {
    const instance = createAuthInstance();
    // If courseData is FormData, don't set Content-Type header
    if (courseData instanceof FormData) {
      const token = getAuthToken();
      const formInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        }
      });
      return await formInstance.patch(`/api/admin/courses/${courseId}`, courseData);
    }
    return await instance.patch(`/api/admin/courses/${courseId}`, courseData);
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.delete(`/api/admin/courses/${courseId}`);
  },

  // Get course enrollment statistics
  getCourseEnrollment: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/courses/${courseId}/enrollment`);
  },

  // ==================== VIDEO MANAGEMENT ====================
  
  // Get course videos
  getCourseVideos: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/courses/${courseId}/videos`);
  },

  // Add video to course
  addVideoToCourse: async (courseId, videoData) => {
    const token = getAuthToken();
    const formInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - let browser set it with boundary
      }
    });
    return await formInstance.post(`/api/admin/courses/${courseId}/videos`, videoData);
  },

  // Update video in course
  updateVideoInCourse: async (courseId, videoId, videoData) => {
    const token = getAuthToken();
    const formInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - let browser set it with boundary
      }
    });
    return await formInstance.put(`/api/admin/courses/${courseId}/videos/${videoId}`, videoData);
  },

  // Delete video from course
  deleteVideoFromCourse: async (courseId, videoId) => {
    const instance = createAuthInstance();
    return await instance.delete(`/api/admin/courses/${courseId}/videos/${videoId}`);
  },

  // Reorder videos in course
  reorderVideosInCourse: async (courseId, videoOrder) => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/courses/${courseId}/videos/reorder`, { videoOrder });
  },

  // ==================== PAYMENTS MANAGEMENT ====================
  
  // Get all payments (using payment proofs endpoint)
  getAllPayments: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/payments?${params}`);
  },

  // Get payment statistics
  getPaymentStatistics: async (period = 'all') => {
    const instance = createAuthInstance();
    const params = new URLSearchParams({ period });
    return await instance.get(`/api/admin/payments/statistics?${params}`);
  },

  // Confirm payment
  confirmPayment: async (paymentId) => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/payments/${paymentId}/confirm`);
  },

  // Reject payment
  rejectPayment: async (paymentId, reason = '') => {
    const instance = createAuthInstance();
    return await instance.put(`/api/admin/payments/${paymentId}/reject`, { reason });
  },

  // Get payment details
  getPaymentById: async (paymentId) => {
    const instance = createAuthInstance();
    return await instance.get(`/api/admin/payments/${paymentId}`);
  },

  // ==================== PAYMENT PROOF MANAGEMENT ====================
  
  // Get pending payment proofs
  getPendingPaymentProofs: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/payment-proofs/pending');
  },

  // Approve payment proof
  approvePaymentProof: async (paymentId) => {
    const instance = createAuthInstance();
    return await instance.patch(`/api/admin/payment-proofs/${paymentId}/approve`);
  },

  // Reject payment proof
  rejectPaymentProof: async (paymentId, rejectionReason) => {
    const instance = createAuthInstance();
    return await instance.patch(`/api/admin/payment-proofs/${paymentId}/reject`, {
      rejectionReason
    });
  },

  // Get course enrollment statistics
  getCourseEnrollmentStats: async () => {
    const instance = createAuthInstance();
    return await instance.get('/api/admin/enrollment-stats');
  },

  // ==================== REPORTS & EXPORTS ====================
  
  // Export payments report
  exportPayments: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/payments/export?${params}`, {
      responseType: 'blob'
    });
  },

  // Export courses report
  exportCourses: async (filters = {}) => {
    const instance = createAuthInstance();
    const params = new URLSearchParams(filters);
    return await instance.get(`/api/admin/courses/export?${params}`, {
      responseType: 'blob'
    });
  },

  // Generate dashboard report
  generateDashboardReport: async (dateRange = {}) => {
    const instance = createAuthInstance();
    return await instance.post('/api/admin/reports/dashboard', dateRange);
  }
};

export default adminService;
