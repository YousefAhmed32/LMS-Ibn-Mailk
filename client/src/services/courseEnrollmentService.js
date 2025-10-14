import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
      'Authorization': `Bearer ${token}`
    }
  });
};

// Course enrollment service
const courseEnrollmentService = {
  // Get enrollment status for a specific course
  getEnrollmentStatus: async (courseId) => {
    const instance = createAuthInstance();
    return await instance.get(`/courses/${courseId}/enrollment-status`);
  },

  // Enroll in a course
  enrollInCourse: async (courseId, proofImage) => {
    const instance = createAuthInstance();
    return await instance.post(`/courses/${courseId}/enroll`, { proofImage });
  },

  // Upload payment proof
  uploadPaymentProof: async (courseId, proofImageFile) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('proofImage', proofImageFile);

    return await axios.post(`${API_BASE_URL}/courses/${courseId}/upload-proof`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get all enrolled courses for the current user
  getMyEnrolledCourses: async () => {
    const instance = createAuthInstance();
    return await instance.get('/courses/my/enrolled');
  },

  // Check if user is enrolled in a course
  isEnrolledInCourse: async (courseId) => {
    try {
      const response = await courseEnrollmentService.getEnrollmentStatus(courseId);
      return response.data.enrolled;
    } catch (error) {
      return false;
    }
  },

  // Get payment status for a course
  getPaymentStatus: async (courseId) => {
    try {
      const response = await courseEnrollmentService.getEnrollmentStatus(courseId);
      if (response.data.enrolled) {
        return response.data.enrollment.paymentStatus;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

export default courseEnrollmentService;
