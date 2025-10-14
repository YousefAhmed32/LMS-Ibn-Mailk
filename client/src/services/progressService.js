import axiosInstance from '../api/axiosInstance';

class ProgressService {
  /**
   * Get user's progress for a specific course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Course progress data
   */
  async getCourseProgress(courseId) {
    try {
      const response = await axiosInstance.get(`/api/user-progress/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting course progress:', error);
      throw error;
    }
  }

  /**
   * Get user's progress for a specific course (alias for compatibility)
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Course progress data
   */
  async getProgress(courseId) {
    return this.getCourseProgress(courseId);
  }

  /**
   * Mark a video as completed
   * @param {string} courseId - Course ID
   * @param {string} videoId - Video ID
   * @param {number} watchPercentage - Watch percentage (0-100)
   * @returns {Promise<Object>} Completion result
   */
  async markVideoCompleted(courseId, videoId, watchPercentage = 100) {
    try {
      const response = await axiosInstance.post(`/api/user-progress/course/${courseId}/video/${videoId}/complete`, {
        watchPercentage
      });
      return response.data;
    } catch (error) {
      console.error('Error marking video as completed:', error);
      throw error;
    }
  }

  /**
   * Mark an exam as completed
   * @param {string} courseId - Course ID
   * @param {string} examId - Exam ID
   * @param {number} score - Exam score (0-100)
   * @param {boolean} passed - Whether the exam was passed
   * @returns {Promise<Object>} Completion result
   */
  async markExamCompleted(courseId, examId, score = 0, passed = false) {
    try {
      const response = await axiosInstance.post(`/api/user-progress/course/${courseId}/exam/${examId}/complete`, {
        score,
        passed
      });
      return response.data;
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      throw error;
    }
  }

  /**
   * Check if a video is completed
   * @param {string} courseId - Course ID
   * @param {string} videoId - Video ID
   * @returns {Promise<boolean>} Whether video is completed
   */
  async isVideoCompleted(courseId, videoId) {
    try {
      const response = await axiosInstance.get(`/api/progress/course/${courseId}/video/${videoId}/status`);
      return response.data.data.completed;
    } catch (error) {
      console.error('Error checking video status:', error);
      return false;
    }
  }

  /**
   * Check if an exam is completed
   * @param {string} courseId - Course ID
   * @param {string} examId - Exam ID
   * @returns {Promise<boolean>} Whether exam is completed
   */
  async isExamCompleted(courseId, examId) {
    try {
      const response = await axiosInstance.get(`/api/progress/course/${courseId}/exam/${examId}/status`);
      return response.data.data.completed;
    } catch (error) {
      console.error('Error checking exam status:', error);
      return false;
    }
  }

  /**
   * Get user's progress summary across all courses
   * @returns {Promise<Object>} User progress summary
   */
  async getUserProgressSummary() {
    try {
      const response = await axiosInstance.get('/api/user-progress/user/summary');
      return response.data;
    } catch (error) {
      console.error('Error getting user progress summary:', error);
      throw error;
    }
  }

  /**
   * Unmark a video as completed
   * @param {string} courseId - Course ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Unmark result
   */
  async unmarkVideoCompleted(courseId, videoId) {
    try {
      const response = await axiosInstance.delete(`/api/user-progress/course/${courseId}/video/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error unmarking video:', error);
      throw error;
    }
  }

  /**
   * Unmark an exam as completed
   * @param {string} courseId - Course ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Unmark result
   */
  async unmarkExamCompleted(courseId, examId) {
    try {
      const response = await axiosInstance.delete(`/api/user-progress/course/${courseId}/exam/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error unmarking exam:', error);
      throw error;
    }
  }

  /**
   * Batch check completion status for multiple videos
   * @param {string} courseId - Course ID
   * @param {Array<string>} videoIds - Array of video IDs
   * @returns {Promise<Object>} Object with video IDs as keys and completion status as values
   */
  async batchCheckVideoStatus(courseId, videoIds) {
    try {
      const promises = videoIds.map(videoId => 
        this.isVideoCompleted(courseId, videoId).catch(() => false)
      );
      const results = await Promise.all(promises);
      
      const statusMap = {};
      videoIds.forEach((videoId, index) => {
        statusMap[videoId] = results[index];
      });
      
      return statusMap;
    } catch (error) {
      console.error('Error batch checking video status:', error);
      return {};
    }
  }

  /**
   * Batch check completion status for multiple exams
   * @param {string} courseId - Course ID
   * @param {Array<string>} examIds - Array of exam IDs
   * @returns {Promise<Object>} Object with exam IDs as keys and completion status as values
   */
  async batchCheckExamStatus(courseId, examIds) {
    try {
      const promises = examIds.map(examId => 
        this.isExamCompleted(courseId, examId).catch(() => false)
      );
      const results = await Promise.all(promises);
      
      const statusMap = {};
      examIds.forEach((examId, index) => {
        statusMap[examId] = results[index];
      });
      
      return statusMap;
    } catch (error) {
      console.error('Error batch checking exam status:', error);
      return {};
    }
  }

  /**
   * Mark exam as completed (simplified endpoint)
   * @param {string} courseId - Course ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Completion result
   */
  async markExamCompletedSimple(courseId, examId) {
    try {
      const response = await axiosInstance.post('/api/progress/exam', {
        courseId,
        examId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      throw error;
    }
  }

  /**
   * Unmark exam as completed (simplified endpoint)
   * @param {string} courseId - Course ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Unmark result
   */
  async unmarkExamCompletedSimple(courseId, examId) {
    try {
      const response = await axiosInstance.delete('/api/progress/exam', {
        data: { courseId, examId }
      });
      return response.data;
    } catch (error) {
      console.error('Error unmarking exam:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const progressService = new ProgressService();
export default progressService;
