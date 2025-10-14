import { useState, useEffect, useRef, useCallback } from 'react';

const useVideoProgress = ({
  videoId,
  studentId,
  courseId,
  onProgressUpdate,
  onVideoCompleted,
  pollingInterval = 3000, // 3 seconds
  completionThreshold = 70 // 70% completion threshold
}) => {
  const [progress, setProgress] = useState({
    currentTime: 0,
    duration: 0,
    percent: 0,
    isCompleted: false,
    isPlaying: false
  });
  
  const [progressHistory, setProgressHistory] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastSentPercentRef = useRef(0);
  const lastSentTimeRef = useRef(0);

  // YouTube IFrame API callback
  const onPlayerReady = useCallback((event) => {
    playerRef.current = event.target;
    setIsTracking(true);
    console.log('YouTube player ready for progress tracking');
  }, []);

  const onPlayerStateChange = useCallback((event) => {
    const isPlaying = event.data === 1; // YouTube.PlayerState.PLAYING
    setProgress(prev => ({ ...prev, isPlaying }));
    
    if (isPlaying) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }
  }, []);

  // Start progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && isTracking) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            const now = Date.now();
            
            // Update local progress state
            setProgress(prev => ({
              ...prev,
              currentTime,
              duration,
              percent,
              isCompleted: percent >= completionThreshold
            }));

            // Add to progress history
            setProgressHistory(prev => {
              const newHistory = [...prev, { timestamp: now, percent, currentTime }];
              // Keep only last 50 entries to prevent memory issues
              return newHistory.slice(-50);
            });

            // Check if we should send progress update
            const shouldSendUpdate = 
              // Crossed threshold percentages
              (percent >= 25 && lastSentPercentRef.current < 25) ||
              (percent >= 50 && lastSentPercentRef.current < 50) ||
              (percent >= 70 && lastSentPercentRef.current < 70) ||
              (percent >= 100 && lastSentPercentRef.current < 100) ||
              // Every 10 seconds of playback
              (now - lastSentTimeRef.current >= 10000);

            if (shouldSendUpdate) {
              sendProgressUpdate({
                currentTime,
                duration,
                percent,
                event: percent >= 70 ? 'completed' : 'progress'
              });
              
              lastSentPercentRef.current = percent;
              lastSentTimeRef.current = now;
            }

            // Check for completion
            if (percent >= completionThreshold && !progress.isCompleted) {
              onVideoCompleted?.({
                videoId,
                studentId,
                courseId,
                percent,
                currentTime,
                duration
              });
            }
          }
        } catch (error) {
          console.warn('Error tracking video progress:', error);
        }
      }
    }, pollingInterval);
  }, [isTracking, completionThreshold, progress.isCompleted, pollingInterval, videoId, studentId, courseId, onVideoCompleted]);

  // Stop progress tracking
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Send progress update to backend
  const sendProgressUpdate = useCallback(async (progressData) => {
    try {
      const response = await fetch('/api/progress/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId,
          courseId,
          videoId,
          ...progressData,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const result = await response.json();
      onProgressUpdate?.(result);
    } catch (error) {
      console.error('Error sending progress update:', error);
    }
  }, [studentId, courseId, videoId, onProgressUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  // Reset progress when video changes
  useEffect(() => {
    setProgress({
      currentTime: 0,
      duration: 0,
      percent: 0,
      isCompleted: false,
      isPlaying: false
    });
    setProgressHistory([]);
    lastSentPercentRef.current = 0;
    lastSentTimeRef.current = 0;
    stopProgressTracking();
  }, [videoId, stopProgressTracking]);

  return {
    progress,
    progressHistory,
    isTracking,
    onPlayerReady,
    onPlayerStateChange,
    startProgressTracking,
    stopProgressTracking
  };
};

export default useVideoProgress;
