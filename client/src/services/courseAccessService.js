import axios from '../api/axiosInstance';

const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create authenticated axios instance
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Course access service
const courseAccessService = {
  // Check if user has access to a specific course
  checkCourseAccess: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/admin/courses/${courseId}/access`);
  },

  // Get student's enrolled courses (admin only)
  getStudentEnrolledCourses: async (studentId) => {
    const instance = createAuthInstance();
    return await instance.get(`/admin/students/${studentId}/enrolled-courses`);
  },

  // Get current user's enrolled courses
  getMyEnrolledCourses: async () => {
    const instance = createAuthInstance();
    return await instance.get('/courses/my/enrolled');
  },

  // Check if current user is enrolled in a course
  isEnrolledInCourse: async (courseId) => {
    try {
      const response = await courseAccessService.checkCourseAccess(courseId);
      return response.data.data.hasAccess;
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  },

  // Get enrollment status for a course
  getEnrollmentStatus: async (courseId) => {
    try {
      const response = await courseAccessService.checkCourseAccess(courseId);
      return response.data.data;
    } catch (error) {
      console.error('Error getting enrollment status:', error);
      return { hasAccess: false, enrollment: null };
    }
  },

  // Check if course is unlocked (payment approved)
  isCourseUnlocked: async (courseId) => {
    try {
      const enrollmentStatus = await courseAccessService.getEnrollmentStatus(courseId);
      return enrollmentStatus.hasAccess && 
             enrollmentStatus.enrollment && 
             enrollmentStatus.enrollment.paymentStatus === 'approved';
    } catch (error) {
      console.error('Error checking if course is unlocked:', error);
      return false;
    }
  },

  // Get course access message for UI
  getAccessMessage: (enrollmentStatus) => {
    if (!enrollmentStatus.enrollment) {
      return {
        message: "يرجى التسجيل في الدورة أولاً",
        type: "info",
        icon: "📝"
      };
    }

    switch (enrollmentStatus.enrollment.paymentStatus) {
      case 'pending':
        return {
          message: "في انتظار موافقة الإدارة على إثبات الدفع",
          type: "warning",
          icon: "⏳"
        };
      case 'approved':
        return {
          message: "تم تفعيل الدورة بنجاح",
          type: "success",
          icon: "✅"
        };
      case 'rejected':
        return {
          message: `تم رفض إثبات الدفع: ${enrollmentStatus.enrollment.rejectionReason || 'لا يوجد سبب محدد'}`,
          type: "error",
          icon: "❌"
        };
      default:
        return {
          message: "حالة غير معروفة",
          type: "info",
          icon: "❓"
        };
    }
  }
};

export default courseAccessService;
