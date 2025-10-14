import axiosInstance from '../api/axiosInstance';

class VideoProgressService {
  // Update video progress
  async updateVideoProgress(progressData) {
    try {
      const response = await axiosInstance.post('/progress/video', {
        ...progressData,
        timestamp: Date.now()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  }

  // Get course progress
  async getCourseProgress(courseId, studentId) {
    try {
      const response = await axiosInstance.get(`/progress/course/${courseId}/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }

  // Get student progress (for instructor dashboard)
  async getStudentProgress(studentId) {
    try {
      const response = await axiosInstance.get(`/progress/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  // Get specific video progress
  async getVideoProgress(videoId, studentId) {
    try {
      const response = await axiosInstance.get(`/progress/video/${videoId}/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video progress:', error);
      throw error;
    }
  }

  // Batch update multiple video progress entries
  async batchUpdateProgress(progressEntries) {
    try {
      const response = await axiosInstance.post('/progress/batch-update', {
        entries: progressEntries.map(entry => ({
          ...entry,
          timestamp: Date.now()
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Error batch updating progress:', error);
      throw error;
    }
  }

  // Get progress analytics for a course
  async getCourseProgressAnalytics(courseId) {
    try {
      const response = await axiosInstance.get(`/progress/analytics/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress analytics:', error);
      throw error;
    }
  }

  // Get progress analytics for a student
  async getStudentProgressAnalytics(studentId) {
    try {
      const response = await axiosInstance.get(`/progress/analytics/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress analytics:', error);
      throw error;
    }
  }

  // Reset video progress (admin function)
  async resetVideoProgress(videoId, studentId) {
    try {
      const response = await axiosInstance.delete(`/progress/video/${videoId}/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error resetting video progress:', error);
      throw error;
    }
  }

  // Get progress history for a video
  async getVideoProgressHistory(videoId, studentId, limit = 50) {
    try {
      const response = await axiosInstance.get(`/progress/history/${videoId}/${studentId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching video progress history:', error);
      throw error;
    }
  }
}

export default new VideoProgressService();
