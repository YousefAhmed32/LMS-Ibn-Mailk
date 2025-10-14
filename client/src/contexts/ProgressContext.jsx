import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from '../hooks/use-toast';

// Progress Context
const ProgressContext = createContext();

// Progress Actions
const PROGRESS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROGRESS: 'SET_PROGRESS',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  SET_STATUS_MAPS: 'SET_STATUS_MAPS',
  MARK_VIDEO_COMPLETED: 'MARK_VIDEO_COMPLETED',
  MARK_EXAM_COMPLETED: 'MARK_EXAM_COMPLETED',
  REVERT_VIDEO_COMPLETED: 'REVERT_VIDEO_COMPLETED',
  REVERT_EXAM_COMPLETED: 'REVERT_EXAM_COMPLETED',
  SET_UPDATING: 'SET_UPDATING',
  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',
  TRIGGER_ANIMATION: 'TRIGGER_ANIMATION',
  SHOW_CONFETTI: 'SHOW_CONFETTI',
  HIDE_CONFETTI: 'HIDE_CONFETTI',
  SHOW_MOTIVATIONAL_TOAST: 'SHOW_MOTIVATIONAL_TOAST',
  HIDE_MOTIVATIONAL_TOAST: 'HIDE_MOTIVATIONAL_TOAST'
};

// Initial State
const initialState = {
  progress: null,
  loading: true,
  updating: false,
  error: null,
  videoStatus: {},
  examStatus: {},
  showConfetti: false,
  motivationalToast: { isVisible: false },
  progressAnimations: {
    isAnimating: false,
    previousProgress: 0,
    gainedProgress: 0
  }
};

// Progress Reducer
const progressReducer = (state, action) => {
  switch (action.type) {
    case PROGRESS_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case PROGRESS_ACTIONS.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
        loading: false,
        error: null
      };

    case PROGRESS_ACTIONS.UPDATE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...action.payload
        }
      };

    case PROGRESS_ACTIONS.SET_STATUS_MAPS:
      return {
        ...state,
        videoStatus: action.payload.videoStatus || state.videoStatus,
        examStatus: action.payload.examStatus || state.examStatus
      };

    case PROGRESS_ACTIONS.MARK_VIDEO_COMPLETED:
      const { videoId, optimistic: videoOptimistic = true } = action.payload;
      const newVideoStatus = { ...state.videoStatus, [videoId]: true };
      
      if (videoOptimistic && state.progress) {
        const newCompletedVideos = state.progress.completedVideos + 1;
        const newCompletedItems = state.progress.completedItems + 1;
        const newProgressPercentage = state.progress.totalItems > 0 
          ? Math.round((newCompletedItems / state.progress.totalItems) * 100) 
          : 0;

        return {
          ...state,
          videoStatus: newVideoStatus,
          progress: {
            ...state.progress,
            completedVideos: newCompletedVideos,
            completedItems: newCompletedItems,
            progressPercentage: newProgressPercentage
          }
        };
      }

      return {
        ...state,
        videoStatus: newVideoStatus
      };

    case PROGRESS_ACTIONS.MARK_EXAM_COMPLETED:
      const { examId, optimistic: examOptimistic = true } = action.payload;
      const newExamStatus = { ...state.examStatus, [examId]: true };
      
      if (examOptimistic && state.progress) {
        const newCompletedExams = state.progress.completedExams + 1;
        const newCompletedItems = state.progress.completedItems + 1;
        const newProgressPercentage = state.progress.totalItems > 0 
          ? Math.round((newCompletedItems / state.progress.totalItems) * 100) 
          : 0;

        return {
          ...state,
          examStatus: newExamStatus,
          progress: {
            ...state.progress,
            completedExams: newCompletedExams,
            completedItems: newCompletedItems,
            progressPercentage: newProgressPercentage
          }
        };
      }

      return {
        ...state,
        examStatus: newExamStatus
      };

    case PROGRESS_ACTIONS.REVERT_VIDEO_COMPLETED:
      const { videoId: revertVideoId } = action.payload;
      const revertedVideoStatus = { ...state.videoStatus };
      delete revertedVideoStatus[revertVideoId];
      
      if (state.progress) {
        const newCompletedVideos = Math.max(0, state.progress.completedVideos - 1);
        const newCompletedItems = Math.max(0, state.progress.completedItems - 1);
        const newProgressPercentage = state.progress.totalItems > 0 
          ? Math.round((newCompletedItems / state.progress.totalItems) * 100) 
          : 0;

        return {
          ...state,
          videoStatus: revertedVideoStatus,
          progress: {
            ...state.progress,
            completedVideos: newCompletedVideos,
            completedItems: newCompletedItems,
            progressPercentage: newProgressPercentage
          }
        };
      }

      return {
        ...state,
        videoStatus: revertedVideoStatus
      };

    case PROGRESS_ACTIONS.REVERT_EXAM_COMPLETED:
      const { examId: revertExamId } = action.payload;
      const revertedExamStatus = { ...state.examStatus };
      delete revertedExamStatus[revertExamId];
      
      if (state.progress) {
        const newCompletedExams = Math.max(0, state.progress.completedExams - 1);
        const newCompletedItems = Math.max(0, state.progress.completedItems - 1);
        const newProgressPercentage = state.progress.totalItems > 0 
          ? Math.round((newCompletedItems / state.progress.totalItems) * 100) 
          : 0;

        return {
          ...state,
          examStatus: revertedExamStatus,
          progress: {
            ...state.progress,
            completedExams: newCompletedExams,
            completedItems: newCompletedItems,
            progressPercentage: newProgressPercentage
          }
        };
      }

      return {
        ...state,
        examStatus: revertedExamStatus
      };

    case PROGRESS_ACTIONS.SET_UPDATING:
      return {
        ...state,
        updating: action.payload
      };

    case PROGRESS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        updating: false
      };

    case PROGRESS_ACTIONS.RESET_ERROR:
      return {
        ...state,
        error: null
      };

    case PROGRESS_ACTIONS.TRIGGER_ANIMATION:
      return {
        ...state,
        progressAnimations: {
          isAnimating: true,
          previousProgress: action.payload.previousProgress,
          gainedProgress: action.payload.gainedProgress
        }
      };

    case PROGRESS_ACTIONS.SHOW_CONFETTI:
      return {
        ...state,
        showConfetti: true
      };

    case PROGRESS_ACTIONS.HIDE_CONFETTI:
      return {
        ...state,
        showConfetti: false
      };

    case PROGRESS_ACTIONS.SHOW_MOTIVATIONAL_TOAST:
      return {
        ...state,
        motivationalToast: {
          isVisible: true,
          ...action.payload
        }
      };

    case PROGRESS_ACTIONS.HIDE_MOTIVATIONAL_TOAST:
      return {
        ...state,
        motivationalToast: {
          isVisible: false
        }
      };

    default:
      return state;
  }
};

// Progress Provider Component
export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Actions
  const setLoading = useCallback((loading) => {
    dispatch({ type: PROGRESS_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setProgress = useCallback((progress) => {
    dispatch({ type: PROGRESS_ACTIONS.SET_PROGRESS, payload: progress });
  }, []);

  const updateProgress = useCallback((updates) => {
    dispatch({ type: PROGRESS_ACTIONS.UPDATE_PROGRESS, payload: updates });
  }, []);

  const setStatusMaps = useCallback((videoStatus, examStatus) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.SET_STATUS_MAPS, 
      payload: { videoStatus, examStatus } 
    });
  }, []);

  const markVideoCompleted = useCallback((videoId, optimistic = true) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.MARK_VIDEO_COMPLETED, 
      payload: { videoId, optimistic } 
    });
  }, []);

  const markExamCompleted = useCallback((examId, optimistic = true) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.MARK_EXAM_COMPLETED, 
      payload: { examId, optimistic } 
    });
  }, []);

  const revertVideoCompleted = useCallback((videoId) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.REVERT_VIDEO_COMPLETED, 
      payload: { videoId } 
    });
  }, []);

  const revertExamCompleted = useCallback((examId) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.REVERT_EXAM_COMPLETED, 
      payload: { examId } 
    });
  }, []);

  const setUpdating = useCallback((updating) => {
    dispatch({ type: PROGRESS_ACTIONS.SET_UPDATING, payload: updating });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: PROGRESS_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const resetError = useCallback(() => {
    dispatch({ type: PROGRESS_ACTIONS.RESET_ERROR });
  }, []);

  const triggerAnimation = useCallback((previousProgress, gainedProgress) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.TRIGGER_ANIMATION, 
      payload: { previousProgress, gainedProgress } 
    });
  }, []);

  const showConfetti = useCallback(() => {
    dispatch({ type: PROGRESS_ACTIONS.SHOW_CONFETTI });
  }, []);

  const hideConfetti = useCallback(() => {
    dispatch({ type: PROGRESS_ACTIONS.HIDE_CONFETTI });
  }, []);

  const showMotivationalToast = useCallback((toastData) => {
    dispatch({ 
      type: PROGRESS_ACTIONS.SHOW_MOTIVATIONAL_TOAST, 
      payload: toastData 
    });
  }, []);

  const hideMotivationalToast = useCallback(() => {
    dispatch({ type: PROGRESS_ACTIONS.HIDE_MOTIVATIONAL_TOAST });
  }, []);

  // Helper functions
  const isVideoCompleted = useCallback((videoId) => {
    return state.videoStatus[videoId] || false;
  }, [state.videoStatus]);

  const isExamCompleted = useCallback((examId) => {
    return state.examStatus[examId] || false;
  }, [state.examStatus]);

  const getProgressPercentage = useCallback(() => {
    return state.progress?.progressPercentage || 0;
  }, [state.progress]);

  const getCompletionCounts = useCallback(() => {
    return {
      completedVideos: state.progress?.completedVideos || 0,
      completedExams: state.progress?.completedExams || 0,
      totalVideos: state.progress?.totalVideos || 0,
      totalExams: state.progress?.totalExams || 0,
      totalItems: state.progress?.totalItems || 0,
      completedItems: state.progress?.completedItems || 0
    };
  }, [state.progress]);

  const value = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setProgress,
    updateProgress,
    setStatusMaps,
    markVideoCompleted,
    markExamCompleted,
    revertVideoCompleted,
    revertExamCompleted,
    setUpdating,
    setError,
    resetError,
    triggerAnimation,
    showConfetti,
    hideConfetti,
    showMotivationalToast,
    hideMotivationalToast,
    
    // Helper functions
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage,
    getCompletionCounts
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook to use progress context
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export default ProgressContext;
