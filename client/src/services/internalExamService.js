import axiosInstance from '../api/axiosInstance';

const internalExamService = {
  // Get exam for taking (without correct answers)
  getExamForTaking: async (courseId, examId) => {
    try {
      const response = await axiosInstance.get(`/api/internal-exams/${courseId}/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting exam for taking:', error);
      throw error;
    }
  },

  // Submit exam answers
  submitExam: async (courseId, examId, answers) => {
    try {
      const response = await axiosInstance.post(`/api/internal-exams/${courseId}/${examId}/submit`, {
        answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  },

  // Get exam submission (for viewing results or editing)
  getExamSubmission: async (courseId, examId) => {
    try {
      const response = await axiosInstance.get(`/api/internal-exams/${courseId}/${examId}/submission`);
      return response.data;
    } catch (error) {
      console.error('Error getting exam submission:', error);
      throw error;
    }
  }
};

export default internalExamService;