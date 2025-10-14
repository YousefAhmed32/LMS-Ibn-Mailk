import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';
import { toast } from './use-toast';

/**
 * Custom hook for exam completion functionality
 * @param {string} courseId - Course ID
 * @returns {Object} Exam completion state and methods
 */
const useExamCompletion = (courseId) => {
  const { user } = useAuth();
  const [completedExams, setCompletedExams] = useState(new Set());
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(null);

  /**
   * Mark an exam as completed
   * @param {string} examId - Exam ID
   */
  const markExamCompleted = useCallback(async (examId) => {
    if (!courseId || !examId || updating) return;

    try {
      setUpdating(true);
      
      // Optimistic update
      setCompletedExams(prev => new Set([...prev, examId]));
      
      const response = await progressService.markExamCompletedSimple(courseId, examId);
      
      if (response.success) {
        // Update progress with server data
        setProgress(response.progress);
        
        // Show success toast
        toast({
          title: 'Great! Exam completed 🎉',
          description: 'Your progress has been saved',
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error marking exam as completed:', error);
      
      // Revert optimistic update
      setCompletedExams(prev => {
        const newSet = new Set(prev);
        newSet.delete(examId);
        return newSet;
      });
      
      toast({
        title: 'Failed to save progress',
        description: 'Please try again',
        variant: 'destructive',
        duration: 3000
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
      setCompletedExams(prev => {
        const newSet = new Set(prev);
        newSet.delete(examId);
        return newSet;
      });
      
      const response = await progressService.unmarkExamCompletedSimple(courseId, examId);
      
      if (response.success) {
        // Update progress with server data
        setProgress(response.progress);
        
        toast({
          title: 'Exam unmarked',
          description: 'Progress updated',
          variant: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error unmarking exam:', error);
      
      // Revert optimistic update
      setCompletedExams(prev => new Set([...prev, examId]));
      
      toast({
        title: 'Failed to update progress',
        description: 'Please try again',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setUpdating(false);
    }
  }, [courseId, updating]);

  /**
   * Check if an exam is completed
   * @param {string} examId - Exam ID
   * @returns {boolean} Whether exam is completed
   */
  const isExamCompleted = useCallback((examId) => {
    return completedExams.has(examId);
  }, [completedExams]);

  /**
   * Toggle exam completion status
   * @param {string} examId - Exam ID
   */
  const toggleExamCompletion = useCallback((examId) => {
    if (isExamCompleted(examId)) {
      unmarkExamCompleted(examId);
    } else {
      markExamCompleted(examId);
    }
  }, [isExamCompleted, markExamCompleted, unmarkExamCompleted]);

  /**
   * Calculate progress percentage
   * @param {Array} videos - Array of videos
   * @param {Array} exams - Array of exams
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = useCallback((videos = [], exams = []) => {
    const totalItems = videos.length + exams.length;
    if (totalItems === 0) return 0;
    
    const completedItems = completedExams.size;
    return Math.round((completedItems / totalItems) * 100);
  }, [completedExams]);

  return {
    // State
    completedExams,
    progress,
    updating,
    
    // Methods
    markExamCompleted,
    unmarkExamCompleted,
    toggleExamCompletion,
    isExamCompleted,
    calculateProgress
  };
};

export default useExamCompletion;
