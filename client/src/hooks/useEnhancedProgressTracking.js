import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';
import { toast } from './use-toast';

const useEnhancedProgressTracking = (courseId) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [examStatus, setExamStatus] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationalToast, setMotivationalToast] = useState({ isVisible: false });
  const [progressAnimations, setProgressAnimations] = useState({
    isAnimating: false,
    previousProgress: 0,
    gainedProgress: 0
  });

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
  }, [courseId, user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  /**
   * Mark a video as completed with enhanced animations
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
        const previousProgress = progress?.progressPercentage || 0;
        const gainedProgress = newProgressPercentage - previousProgress;
        
        setProgress(prev => ({
          ...prev,
          progressPercentage: newProgressPercentage,
          completedVideos: prev.completedVideos + 1
        }));

        // Trigger enhanced animations
        setProgressAnimations({
          isAnimating: true,
          previousProgress,
          gainedProgress
        });

        // Show confetti for significant progress
        if (gainedProgress >= 5) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        // Trigger motivational feedback
        triggerMotivationalFeedback(newProgressPercentage, 'video', gainedProgress);
        
        toast({
          title: 'تم إكمال الفيديو 🎉',
          description: `تقدمك الآن ${newProgressPercentage}%`,
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
  }, [courseId, updating, progress?.progressPercentage]);

  /**
   * Mark an exam as completed with enhanced animations
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
        const previousProgress = progress?.progressPercentage || 0;
        const gainedProgress = newProgressPercentage - previousProgress;
        
        setProgress(prev => ({
          ...prev,
          progressPercentage: newProgressPercentage,
          completedExams: prev.completedExams + 1
        }));

        // Trigger enhanced animations
        setProgressAnimations({
          isAnimating: true,
          previousProgress,
          gainedProgress
        });

        // Show confetti for significant progress
        if (gainedProgress >= 5) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        // Trigger motivational feedback
        triggerMotivationalFeedback(newProgressPercentage, 'exam', gainedProgress);
        
        toast({
          title: 'تم إكمال الامتحان 🎉',
          description: `تقدمك الآن ${newProgressPercentage}%`,
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
  }, [courseId, updating, progress?.progressPercentage]);

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
   * Get progress percentage
   */
  const getProgressPercentage = useCallback(() => {
    return progress?.progressPercentage || 0;
  }, [progress]);

  /**
   * Get completion counts
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
   * Trigger enhanced motivational feedback
   */
  const triggerMotivationalFeedback = useCallback((newProgressPercentage, itemType, gainedProgress) => {
    // Check for milestones
    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.find(milestone => 
      newProgressPercentage >= milestone && (progress?.progressPercentage || 0) < milestone
    );

    if (reachedMilestone) {
      // Show confetti for major milestones
      if (reachedMilestone >= 50) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }

      // Show motivational toast
      setMotivationalToast({
        isVisible: true,
        type: 'milestone',
        message: `🎉 وصلت إلى ${reachedMilestone}%!`,
        progressPercentage: reachedMilestone,
        gainedProgress
      });

      // Auto-hide toast
      setTimeout(() => {
        setMotivationalToast(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    } else {
      // Show completion toast for individual items
      setMotivationalToast({
        isVisible: true,
        type: 'completion',
        message: `تم إكمال ${itemType === 'video' ? 'الفيديو' : 'الامتحان'}! +${gainedProgress}%`,
        progressPercentage: newProgressPercentage,
        gainedProgress
      });

      // Auto-hide toast
      setTimeout(() => {
        setMotivationalToast(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  }, [progress?.progressPercentage]);

  /**
   * Handle progress update with animations
   */
  const handleProgressUpdate = useCallback((gainedProgress, newProgressPercentage) => {
    setProgressAnimations({
      isAnimating: true,
      previousProgress: newProgressPercentage - gainedProgress,
      gainedProgress
    });

    // Reset animation state after animation completes
    setTimeout(() => {
      setProgressAnimations(prev => ({ ...prev, isAnimating: false }));
    }, 2000);
  }, []);

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
    markVideoCompleted,
    markExamCompleted,
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage,
    getCompletionCounts,
    refreshProgress,
    handleProgressUpdate,
    triggerMotivationalFeedback
  };
};

export default useEnhancedProgressTracking;
