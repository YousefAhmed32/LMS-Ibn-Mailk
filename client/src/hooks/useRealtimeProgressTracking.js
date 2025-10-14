import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import progressService from '../services/progressService';
import { toast } from './use-toast';

const useRealtimeProgressTracking = (courseId) => {
  const { user } = useAuth();
  const hasLoadedRef = useRef(false);
  const {
    progress,
    loading,
    updating,
    videoStatus,
    examStatus,
    showConfetti,
    motivationalToast,
    progressAnimations,
    setLoading,
    setProgress,
    setStatusMaps,
    markVideoCompleted,
    markExamCompleted,
    revertVideoCompleted,
    revertExamCompleted,
    setUpdating,
    setError,
    triggerAnimation,
    showConfetti: showConfettiAction,
    hideConfetti,
    showMotivationalToast,
    hideMotivationalToast,
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage,
    getCompletionCounts
  } = useProgress();

  /**
   * Load user's progress for the course
   */
  const loadProgress = useCallback(async () => {
    if (!courseId || !user) return;

    try {
      setLoading(true);
      const response = await progressService.getCourseProgress(courseId);
      
      if (response.success) {
        const progressData = response.data;
        setProgress(progressData);
        
        // Initialize video and exam status
        const videoStatusMap = {};
        const examStatusMap = {};
        
        progressData.videoProgress?.forEach(video => {
          videoStatusMap[video.videoId] = true;
        });
        
        progressData.examProgress?.forEach(exam => {
          examStatusMap[exam.examId] = true;
        });
        
        // Update status maps in context - batch update to avoid infinite loops
        setStatusMaps(videoStatusMap, examStatusMap);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress');
      toast({
        title: 'خطأ في تحميل التقدم',
        description: 'فشل في تحميل بيانات التقدم',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, user]); // Remove the context functions from dependencies

  useEffect(() => {
    // Reset the loaded flag when courseId changes
    hasLoadedRef.current = false;
  }, [courseId]);

  useEffect(() => {
    if (courseId && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadProgress();
    }
  }, [courseId, user, loadProgress]);

  /**
   * Mark a video as completed with real-time optimistic updates
   */
  const markVideoCompletedRealtime = useCallback(async (videoId, watchPercentage = 100) => {
    if (!courseId || !videoId || updating) return;

    // Store previous state for rollback
    const previousProgress = progress?.progressPercentage || 0;
    const previousVideoStatus = videoStatus[videoId] || false;

    try {
      setUpdating(true);
      
      // 1. OPTIMISTIC UPDATE - Update UI immediately
      markVideoCompleted(videoId, true); // Trigger optimistic update
      
      // 2. SYNC WITH BACKEND FIRST to get accurate progress
      const response = await progressService.markVideoCompleted(courseId, videoId, watchPercentage);
      
      if (response.success) {
        // Get actual progress from server
        const newProgressPercentage = response.data.data?.progressPercentage || response.data.data?.overallProgress || 0;
        const gainedProgress = Math.max(0, newProgressPercentage - previousProgress);
        
        // Ensure we have valid numbers
        if (isNaN(newProgressPercentage) || isNaN(gainedProgress)) {
          console.error('Invalid progress values:', { 
            newProgressPercentage, 
            gainedProgress, 
            previousProgress,
            responseData: response.data 
          });
          throw new Error('Invalid progress data from server');
        }
        
        // Update progress with server data
        setProgress(response.data);
        
        // 3. TRIGGER ANIMATIONS WITH ACCURATE DATA
        triggerAnimation(previousProgress, gainedProgress);
        
        // Show confetti for significant progress
        if (gainedProgress >= 5) {
          showConfettiAction();
          setTimeout(() => hideConfetti(), 3000);
        }
        
        // Show motivational feedback with correct progress
        showMotivationalToast({
          type: 'completion',
          message: `تم إكمال الفيديو! +${Math.round(gainedProgress)}%`,
          progressPercentage: Math.round(newProgressPercentage),
          gainedProgress: Math.round(gainedProgress)
        });
        
        // Auto-hide toast
        setTimeout(() => hideMotivationalToast(), 3000);
      } else {
        throw new Error('Server response indicates failure');
      }
    } catch (error) {
      console.error('Error marking video as completed:', error);
      
      // 4. ROLLBACK ON ERROR
      // Revert optimistic update
      if (!previousVideoStatus) {
        // Only revert if it wasn't already completed
        revertVideoCompleted(videoId);
      }
      
      // Revert progress
      setProgress(prev => ({
        ...prev,
        progressPercentage: previousProgress
      }));
      
      setError('Failed to sync with server');
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الفيديو، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setUpdating(false);
    }
  }, [
    courseId, 
    updating, 
    progress?.progressPercentage, 
    videoStatus, 
    setUpdating, 
    markVideoCompleted, 
    revertVideoCompleted,
    getProgressPercentage, 
    triggerAnimation, 
    showConfettiAction, 
    hideConfetti, 
    showMotivationalToast, 
    hideMotivationalToast, 
    setProgress, 
    setError
  ]);

  /**
   * Mark an exam as completed with real-time optimistic updates
   */
  const markExamCompletedRealtime = useCallback(async (examId, score = 0, passed = false) => {
    if (!courseId || !examId || updating) return;

    // Store previous state for rollback
    const previousProgress = progress?.progressPercentage || 0;
    const previousExamStatus = examStatus[examId] || false;

    try {
      setUpdating(true);
      
      // 1. OPTIMISTIC UPDATE - Update UI immediately
      markExamCompleted(examId, true); // Trigger optimistic update
      
      // 2. SYNC WITH BACKEND FIRST to get accurate progress
      const response = await progressService.markExamCompleted(courseId, examId, score, passed);
      
      if (response.success) {
        // Get actual progress from server
        const newProgressPercentage = response.data.data?.progressPercentage || response.data.data?.overallProgress || 0;
        const gainedProgress = Math.max(0, newProgressPercentage - previousProgress);
        
        // Ensure we have valid numbers
        if (isNaN(newProgressPercentage) || isNaN(gainedProgress)) {
          console.error('Invalid progress values:', { 
            newProgressPercentage, 
            gainedProgress, 
            previousProgress,
            responseData: response.data 
          });
          throw new Error('Invalid progress data from server');
        }
        
        // Update progress with server data
        setProgress(response.data);
        
        // 3. TRIGGER ANIMATIONS WITH ACCURATE DATA
        triggerAnimation(previousProgress, gainedProgress);
        
        // Show confetti for significant progress
        if (gainedProgress >= 5) {
          showConfettiAction();
          setTimeout(() => hideConfetti(), 3000);
        }
        
        // Show motivational feedback with correct progress
        showMotivationalToast({
          type: 'completion',
          message: `تم إكمال الامتحان! +${Math.round(gainedProgress)}%`,
          progressPercentage: Math.round(newProgressPercentage),
          gainedProgress: Math.round(gainedProgress)
        });
        
        // Auto-hide toast
        setTimeout(() => hideMotivationalToast(), 3000);
      } else {
        throw new Error('Server response indicates failure');
      }
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      
      // 4. ROLLBACK ON ERROR
      // Revert optimistic update
      if (!previousExamStatus) {
        // Only revert if it wasn't already completed
        revertExamCompleted(examId);
      }
      
      // Revert progress
      setProgress(prev => ({
        ...prev,
        progressPercentage: previousProgress
      }));
      
      setError('Failed to sync with server');
      
      toast({
        title: 'خطأ في حفظ التقدم',
        description: 'فشل في حفظ تقدم الامتحان، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setUpdating(false);
    }
  }, [
    courseId, 
    updating, 
    progress?.progressPercentage, 
    examStatus, 
    setUpdating, 
    markExamCompleted, 
    revertExamCompleted,
    getProgressPercentage, 
    triggerAnimation, 
    showConfettiAction, 
    hideConfetti, 
    showMotivationalToast, 
    hideMotivationalToast, 
    setProgress, 
    setError
  ]);

  /**
   * Handle progress update with animations
   */
  const handleProgressUpdate = useCallback((gainedProgress, newProgressPercentage) => {
    triggerAnimation(newProgressPercentage - gainedProgress, gainedProgress);
  }, [triggerAnimation]);

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
    progressAnimations,
    
    // Methods
    markVideoCompleted: markVideoCompletedRealtime,
    markExamCompleted: markExamCompletedRealtime,
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage,
    getCompletionCounts,
    refreshProgress,
    handleProgressUpdate,
    
    // Confetti and Toast controls
    hideConfetti,
    hideMotivationalToast
  };
};

export default useRealtimeProgressTracking;
