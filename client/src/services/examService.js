import axiosInstance from '../api/axiosInstance';

class ExamService {
  // Check if student can access exam
  async checkExamAccess(studentId, courseId, videoId, examId) {
    try {
      const response = await axiosInstance.post('/exam/check-access', {
        studentId,
        courseId,
        videoId,
        examId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking exam access:', error);
      throw error;
    }
  }

  // Request exam override
  async requestExamOverride(studentId, courseId, videoId, examId, clientPercent) {
    try {
      const response = await axiosInstance.post('/exam/override', {
        studentId,
        courseId,
        videoId,
        examId,
        clientPercent,
        userAgent: navigator.userAgent,
        ipAddress: null // Will be set by server
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting exam override:', error);
      throw error;
    }
  }

  // Get exam overrides for a course (instructor view)
  async getCourseExamOverrides(courseId, page = 1, limit = 20) {
    try {
      const response = await axiosInstance.get(`/exam/overrides/${courseId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course exam overrides:', error);
      throw error;
    }
  }

  // Get exam overrides for a specific student
  async getStudentExamOverrides(studentId) {
    try {
      const response = await axiosInstance.get(`/exam/overrides/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student exam overrides:', error);
      throw error;
    }
  }

  // Validate exam token
  async validateExamToken(token, studentId, examId) {
    try {
      const response = await axiosInstance.post('/exam/validate-token', {
        token,
        studentId,
        examId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating exam token:', error);
      throw error;
    }
  }

  // Start exam session
  async startExamSession(overrideId) {
    try {
      const response = await axiosInstance.post('/exam/start-session', {
        overrideId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting exam session:', error);
      throw error;
    }
  }

  // Complete exam session
  async completeExamSession(overrideId, score) {
    try {
      const response = await axiosInstance.post('/exam/complete-session', {
        overrideId,
        score
      });
      return response.data;
    } catch (error) {
      console.error('Error completing exam session:', error);
      throw error;
    }
  }
}

export default new ExamService();
