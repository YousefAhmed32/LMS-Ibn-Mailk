import axiosInstance from '../api/axiosInstance';

const examService = {
  // Get all exams for a course
  getCourseExams: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/internal-exams/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting course exams:', error);
      throw error;
    }
  },

  // Get specific exam for taking
  getExamForTaking: async (courseId, examId) => {
    try {
      const response = await axiosInstance.get(`/internal-exams/${courseId}/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting exam for taking:', error);
      throw error;
    }
  },

  // Submit exam answers
  submitExam: async (courseId, examId, answers) => {
    try {
      const response = await axiosInstance.post(`/internal-exams/${courseId}/${examId}/submit`, {
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  },

  // Get exam result
  getExamResult: async (courseId, examId) => {
    try {
      const response = await axiosInstance.get(`/internal-exams/${courseId}/${examId}/result`);
      return response.data;
    } catch (error) {
      console.error('Error getting exam result:', error);
      throw error;
    }
  }
};

export default examService;
