import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';
import { toast } from './use-toast';

/**
 * Custom hook for managing course progress tracking
 * @param {string} courseId - Course ID
 * @returns {Object} Progress tracking state and methods
 */
const useProgressTracking = (courseId) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoStatus, setVideoStatus] = useState({});
  const [examStatus, setExamStatus] = useState({});
  const [updating, setUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationalToast, setMotivationalToast] = useState({ isVisible: false, type: '', message: '', progressPercentage: 0 });

  // Load initial progress data
  useEffect(() => {
    if (courseId && user) {
      loadProgress();
    }
  }, [courseId, user]);

  /**
   * Load course progress data
   */
  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await progressService.getCourseProgress(courseId);
      
      if (response.success) {
        setProgress(response.data);
        
        // Create status maps for quick lookup
        const videoStatusMap = {};
        const examStatusMap = {};
        
        response.data.videoProgress?.forEach(video => {
          videoStatusMap[video.videoId] = true;
        });
        
        response.data.examProgress?.forEach(exam => {
          examStatusMap[exam.examId] = true;
        });
        
        setVideoStatus(videoStatusMap);
        setExamStatus(examStatusMap);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: 'خطأ في تحميل التقدم',
        description: 'فشل في تحميل بيانات التقدم',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  /**
   * Mark a video as completed
   * @param {string} videoId - Video ID
   * @param {number} watchPercentage - Watch percentage (0-100)
   */
  const markVideoCompleted = useCallback(async (videoId, watchPercentage = 100) => {
    if (!courseId || !videoId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: true }));
      
      const response = await progressService.markVideoCompleted(courseId, videoId, watchPercentage);
      
      if (response.success) {
        // Update progress with new data
        const newProgressPercentage = response.data.overallProgress;
        setProgress(prev => ({
          ...prev,
          overallProgress: newProgressPercentage,
          completedVideos: prev.completedVideos + 1
        }));
        
        // Trigger motivational feedback
        triggerMotivationalFeedback(newProgressPercentage, 'video');
        
        toast({
          title: 'تم إكمال الفيديو',
          description: 'تم حفظ تقدمك بنجاح',
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error marking video as completed:', error);
      
      // Revert optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: false }));
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الفيديو',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Mark an exam as completed
   * @param {string} examId - Exam ID
   * @param {number} score - Exam score (0-100)
   * @param {boolean} passed - Whether the exam was passed
   */
  const markExamCompleted = useCallback(async (examId, score = 0, passed = false) => {
    if (!courseId || !examId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: true }));
      
      const response = await progressService.markExamCompleted(courseId, examId, score, passed);
      
      if (response.success) {
        // Update progress with new data
        const newProgressPercentage = response.data.overallProgress;
        setProgress(prev => ({
          ...prev,
          overallProgress: newProgressPercentage,
          completedExams: prev.completedExams + 1
        }));
        
        // Trigger motivational feedback
        triggerMotivationalFeedback(newProgressPercentage, 'exam');
        
        toast({
          title: 'تم إكمال الامتحان',
          description: 'تم حفظ تقدمك بنجاح',
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      
      // Revert optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: false }));
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الامتحان',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Unmark a video as completed
   * @param {string} videoId - Video ID
   */
  const unmarkVideoCompleted = useCallback(async (videoId) => {
    if (!courseId || !videoId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: false }));
      
      const response = await progressService.unmarkVideoCompleted(courseId, videoId);
      
      if (response.success) {
        // Update progress with new data
        setProgress(prev => ({
          ...prev,
          overallProgress: response.data.overallProgress,
          completedVideos: Math.max(0, prev.completedVideos - 1)
        }));
        
        toast({
          title: 'تم إلغاء إكمال الفيديو',
          description: 'تم تحديث تقدمك',
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error unmarking video:', error);
      
      // Revert optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: true }));
      
      toast({
        title: 'خطأ في تحديث التقدم',
        description: 'فشل في إلغاء إكمال الفيديو',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Unmark an exam as completed
   * @param {string} examId - Exam ID
   */
  const unmarkExamCompleted = useCallback(async (examId) => {
    if (!courseId || !examId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: false }));
      
      const response = await progressService.unmarkExamCompleted(courseId, examId);
      
      if (response.success) {
        // Update progress with new data
        setProgress(prev => ({
          ...prev,
          overallProgress: response.data.overallProgress,
          completedExams: Math.max(0, prev.completedExams - 1)
        }));
        
        toast({
          title: 'تم إلغاء إكمال الامتحان',
          description: 'تم تحديث تقدمك',
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error unmarking exam:', error);
      
      // Revert optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: true }));
      
      toast({
        title: 'خطأ في تحديث التقدم',
        description: 'فشل في إلغاء إكمال الامتحان',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Check if a video is completed
   * @param {string} videoId - Video ID
   * @returns {boolean} Whether video is completed
   */
  const isVideoCompleted = useCallback((videoId) => {
    return videoStatus[videoId] || false;
  }, [videoStatus]);

  /**
   * Check if an exam is completed
   * @param {string} examId - Exam ID
   * @returns {boolean} Whether exam is completed
   */
  const isExamCompleted = useCallback((examId) => {
    return examStatus[examId] || false;
  }, [examStatus]);

  /**
   * Get progress percentage
   * @returns {number} Progress percentage (0-100)
   */
  const getProgressPercentage = useCallback(() => {
    return progress?.progressPercentage || 0;
  }, [progress]);

  /**
   * Get completion counts
   * @returns {Object} Completion counts
   */
  const getCompletionCounts = useCallback(() => {
    return {
      completedVideos: progress?.completedVideos || 0,
      completedExams: progress?.completedExams || 0,
      totalVideos: progress?.totalVideos || 0,
      totalExams: progress?.totalExams || 0,
      totalItems: progress?.totalItems || 0,
      completedItems: progress?.completedItems || 0
    };
  }, [progress]);

  /**
   * Trigger motivational feedback based on progress
   */
  const triggerMotivationalFeedback = useCallback((newProgressPercentage, itemType) => {
    // Check for milestones
    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.find(milestone => 
      newProgressPercentage >= milestone && (progress?.progressPercentage || 0) < milestone
    );

    if (reachedMilestone) {
      // Show confetti for major milestones
      if (reachedMilestone >= 50) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Show motivational toast
      setMotivationalToast({
        isVisible: true,
        type: 'milestone',
        message: '',
        progressPercentage: reachedMilestone
      });

      // Auto-hide toast
      setTimeout(() => {
        setMotivationalToast(prev => ({ ...prev, isVisible: false }));
      }, 4000);
    } else {
      // Show completion toast for individual items
      setMotivationalToast({
        isVisible: true,
        type: 'completion',
        message: `You completed this ${itemType}!`,
        progressPercentage: newProgressPercentage
      });

      // Auto-hide toast
      setTimeout(() => {
        setMotivationalToast(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  }, [progress?.progressPercentage]);

  /**
   * Refresh progress data
   */
  const refreshProgress = useCallback(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    // State
    progress,
    loading,
    updating,
    videoStatus,
    examStatus,
    showConfetti,
    motivationalToast,
    
    // Methods
    markVideoCompleted,
    markExamCompleted,
    unmarkVideoCompleted,
    unmarkExamCompleted,
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage,
    getCompletionCounts,
    refreshProgress,
    triggerMotivationalFeedback
  };
};

export default useProgressTracking;
