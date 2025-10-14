/**
 * Unified Progress Tracking Hook
 * Handles both video and exam progress tracking without conflicts
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';
import { toast } from './use-toast';

const useUnifiedProgressTracking = (courseId) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [examStatus, setExamStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Load initial progress data
  useEffect(() => {
    if (courseId && user?._id) {
      loadProgress();
    }
  }, [courseId, user?._id]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await progressService.getProgress(courseId);
      
      if (response.success) {
        setProgress(response.data);
        
        // Set video status
        const videoStatusMap = {};
        response.data.completedVideos?.forEach(videoId => {
          videoStatusMap[videoId] = true;
        });
        setVideoStatus(videoStatusMap);
        
        // Set exam status
        const examStatusMap = {};
        response.data.completedExams?.forEach(examId => {
          examStatusMap[examId] = true;
        });
        setExamStatus(examStatusMap);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark a video as completed
   */
  const markVideoCompleted = useCallback(async (videoId, watchPercentage = 100) => {
    if (!courseId || !videoId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: true }));
      
      const response = await progressService.markVideoCompleted(courseId, videoId, watchPercentage);
      
      if (response.success) {
        // Update progress with server data
        setProgress(prev => ({
          ...prev,
          progressPercentage: response.data.progressPercentage,
          completedVideos: response.data.completedVideos,
          completedItems: response.data.completedItems
        }));
        
        // Reload progress to ensure sync with server
        setTimeout(() => {
          loadProgress();
        }, 500);
        
        toast({
          title: 'تم إكمال الفيديو',
          description: 'تم حفظ تقدمك بنجاح',
          variant: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error marking video as completed:', error);
      
      // Revert optimistic update
      setVideoStatus(prev => ({ ...prev, [videoId]: false }));
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الفيديو',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Mark an exam as completed
   */
  const markExamCompleted = useCallback(async (examId, score = 0, passed = false) => {
    if (!courseId || !examId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: true }));
      
      const response = await progressService.markExamCompleted(courseId, examId, score, passed);
      
      if (response.success) {
        // Update progress with server data
        setProgress(prev => ({
          ...prev,
          progressPercentage: response.data.progressPercentage,
          completedExams: response.data.completedExams,
          completedItems: response.data.completedItems
        }));
        
        // Reload progress to ensure sync with server
        setTimeout(() => {
          loadProgress();
        }, 500);
        
        toast({
          title: 'تم إكمال الامتحان',
          description: 'تم حفظ تقدمك بنجاح',
          variant: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      
      // Revert optimistic update
      setExamStatus(prev => ({ ...prev, [examId]: false }));
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الامتحان',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Check if a video is completed
   */
  const isVideoCompleted = useCallback((videoId) => {
    return videoStatus[videoId] || false;
  }, [videoStatus]);

  /**
   * Check if an exam is completed
   */
  const isExamCompleted = useCallback((examId) => {
    return examStatus[examId] || false;
  }, [examStatus]);

  /**
   * Refresh progress data
   */
  const refreshProgress = useCallback(() => {
    loadProgress();
  }, [courseId, user?._id]);

  return {
    progress,
    videoStatus,
    examStatus,
    loading,
    updating,
    error,
    markVideoCompleted,
    markExamCompleted,
    isVideoCompleted,
    isExamCompleted,
    refreshProgress
  };
};

export default useUnifiedProgressTracking;
