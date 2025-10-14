import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CourseVideoPlayer from './CourseVideoPlayer';
import ExamButton from './ExamButton';
import videoProgressService from '../../services/videoProgressService';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

const VideoWithExamGating = ({ 
  video, 
  courseId, 
  examId,
  examTitle,
  examDescription,
  className = ""
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { user } = useAuth();
  
  const [courseProgress, setCourseProgress] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load course progress on component mount
  useEffect(() => {
    if (user?._id && courseId) {
      loadCourseProgress();
    }
  }, [user?._id, courseId]);

  const loadCourseProgress = async () => {
    try {
      setIsLoading(true);
      const response = await videoProgressService.getCourseProgress(courseId, user._id);
      setCourseProgress(response.courseProgress);
      
      // Find progress for current video
      const currentVideoProgress = response.courseProgress.videoProgress.find(
        vp => vp.videoId === video._id
      );
      if (currentVideoProgress) {
        setVideoProgress(currentVideoProgress);
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video progress updates
  const handleVideoProgressUpdate = (videoId, progressData) => {
    setVideoProgress(prev => ({
      ...prev,
      ...progressData
    }));
    
    // Update course progress if video was completed
    if (progressData.completed) {
      setCourseProgress(prev => ({
        ...prev,
        completedVideosCount: prev.completedVideosCount + 1,
        percentComplete: (prev.completedVideosCount + 1) / prev.totalVideos * 100
      }));
    }
  };

  // Handle exam start
  const handleExamStart = (examUrl, examData) => {
    console.log('Exam started:', examUrl, examData);
    // You can add additional logic here, such as analytics tracking
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading video and progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Video Player with Progress Tracking */}
      <CourseVideoPlayer
        video={video}
        courseId={courseId}
        onProgressUpdate={handleVideoProgressUpdate}
        enableProgressTracking={true}
        className="mb-6"
      />

      {/* Progress Overview */}
      {courseProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div 
            className="p-6 rounded-xl"
            style={{
              background: colors.surfaceCard,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.lg
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Course Progress
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Overall Progress */}
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp size={24} style={{ color: colors.accent }} />
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors.accent }}
                >
                  {Math.round(courseProgress.percentComplete)}%
                </div>
                <div 
                  className="text-sm"
                  style={{ color: colors.textMuted }}
                >
                  Course Complete
                </div>
              </div>

              {/* Completed Videos */}
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle size={24} style={{ color: colors.success }} />
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors.success }}
                >
                  {courseProgress.completedVideosCount}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: colors.textMuted }}
                >
                  Videos Completed
                </div>
              </div>

              {/* Total Videos */}
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-center mb-2">
                  <BookOpen size={24} style={{ color: colors.textMuted }} />
                </div>
                <div 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {courseProgress.totalVideos}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: colors.textMuted }}
                >
                  Total Videos
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${courseProgress.percentComplete}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors.accent }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Video Progress */}
      {videoProgress.percent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div 
            className="p-4 rounded-lg"
            style={{
              background: videoProgress.completed ? colors.success + '10' : colors.accent + '10',
              border: `1px solid ${videoProgress.completed ? colors.success + '30' : colors.accent + '30'}`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {videoProgress.completed ? (
                  <CheckCircle size={20} style={{ color: colors.success }} />
                ) : (
                  <Clock size={20} style={{ color: colors.accent }} />
                )}
                <span 
                  className="font-medium"
                  style={{ color: videoProgress.completed ? colors.success : colors.accent }}
                >
                  {videoProgress.completed ? 'Video Completed!' : 'Video Progress'}
                </span>
              </div>
              <span 
                className="font-bold"
                style={{ color: videoProgress.completed ? colors.success : colors.accent }}
              >
                {Math.round(videoProgress.percent)}%
              </span>
            </div>
            
            <div 
              className="w-full h-2 rounded-full overflow-hidden mt-2"
              style={{ backgroundColor: colors.border }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${videoProgress.percent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: videoProgress.completed ? colors.success : colors.accent }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Exam Button */}
      {examId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ExamButton
            videoId={video._id}
            courseId={courseId}
            examId={examId}
            examTitle={examTitle || "Course Exam"}
            examDescription={examDescription || "Test your knowledge with this exam"}
            onExamStart={handleExamStart}
            className="w-full"
          />
        </motion.div>
      )}

      {/* Completion Message */}
      {videoProgress.completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 rounded-lg text-center"
          style={{
            background: colors.success + '10',
            border: `1px solid ${colors.success + '30'}`
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award size={20} style={{ color: colors.success }} />
            <span 
              className="font-semibold"
              style={{ color: colors.success }}
            >
              Congratulations!
            </span>
          </div>
          <p 
            className="text-sm"
            style={{ color: colors.textMuted }}
          >
            You've completed this video. You're ready to take the exam!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VideoWithExamGating;
