import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import useVideoProgress from '../../hooks/useVideoProgress';
import videoProgressService from '../../services/videoProgressService';
import { extractVideoId } from '../../utils/youtubeUtils';
import { 
  Play, 
  ExternalLink,
  Lock,
  Youtube,
  Clock,
  CheckCircle,
  Video,
  BookOpen
} from 'lucide-react';

const CourseVideoPlayer = ({ 
  video, 
  courseId,
  onVideoSelect = null,
  onProgressUpdate = null,
  onVideoCompleted = null,
  className = "",
  enableProgressTracking = true
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { user } = useAuth();
  
  // State management
  const [videoProgress, setVideoProgress] = useState({});
  const [isProgressTracking, setIsProgressTracking] = useState(false);

  // Use shared extractVideoId (supports watch, youtu.be, shorts, embed, params)
  const getYouTubeVideoId = useCallback((url) => extractVideoId(url), []);

  // Check if user is subscribed to the course
  const isSubscribed = useCallback(() => {
    if (!user?.enrolledCourses || !courseId) return false;
    
    const enrollment = user.enrolledCourses.find(e => {
      const courseIdToCheck = e.courseId._id || e.courseId;
      return courseIdToCheck === courseId;
    });
    
    return enrollment?.paymentStatus === 'approved';
  }, [user?.enrolledCourses, courseId]);

  // Video progress tracking
  const {
    progress,
    progressHistory,
    isTracking,
    onPlayerReady,
    onPlayerStateChange
  } = useVideoProgress({
    videoId: getYouTubeVideoId(video?.url),
    studentId: user?._id,
    courseId,
    onProgressUpdate: (progressData) => {
      setVideoProgress(prev => ({
        ...prev,
        [video._id]: progressData
      }));
      onProgressUpdate?.(video._id, progressData);
    },
    onVideoCompleted: (completionData) => {
      console.log('Video completed:', completionData);
      // Call the parent's onVideoCompleted callback
      onVideoCompleted?.(completionData);
    }
  });

  // Handle platform watch - select video for viewing
  const handlePlatformWatch = useCallback(() => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  }, [video, onVideoSelect]);

  // Handle YouTube watch - open in new tab
  const handleYouTubeWatch = useCallback(() => {
    if (video?.url) {
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  }, [video?.url]);

  // Format duration helper
  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };


  if (!video) {
    return (
      <div className={`w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Video size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No video selected</p>
        </div>
      </div>
    );
  }

  const youtubeVideoId = getYouTubeVideoId(video.url);
  const subscribed = isSubscribed();

  if (!youtubeVideoId) {
    return (
      <div className={`w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Video size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Video Player Container - Using simplified YouTubeVideoPlayer with progress tracking */}
      <YouTubeVideoPlayer
        videoId={youtubeVideoId}
        title={video.title || 'Video'}
        className="mb-4"
        enableProgressTracking={enableProgressTracking && subscribed}
        onPlayerReady={onPlayerReady}
        onPlayerStateChange={onPlayerStateChange}
        studentId={user?._id}
        courseId={courseId}
      />

      {/* Video Info - BELOW the video player */}
      <div className="mt-4 p-4 rounded-lg" style={{ 
        background: colors.surfaceCard,
        border: `1px solid ${colors.border}`
      }}>
        <h3 style={{ 
          color: colors.text, 
          fontSize: typography.fontSize.lg,
          fontWeight: 'bold',
          marginBottom: spacing.sm
        }}>
          {video.title || 'Video'}
        </h3>
        
        {video.description && (
          <p style={{ 
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
            lineHeight: 1.5,
            marginBottom: spacing.md
          }}>
            {video.description}
          </p>
        )}

        {/* Video Stats */}
        <div className="flex items-center gap-4 text-sm" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(video.duration)}
          </div>
          
          {subscribed && (videoProgress[video._id] || progress.percent > 0) && (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} style={{ color: colors.success }} />
              {Math.round(videoProgress[video._id]?.percent || progress.percent)}% watched
            </div>
          )}

          {subscribed && (videoProgress[video._id]?.completed || progress.isCompleted) && (
            <div className="flex items-center gap-1">
              <BookOpen size={14} style={{ color: colors.success }} />
              <span style={{ color: colors.success }}>Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - ONLY for subscribed users, BELOW video info */}
      {subscribed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-col sm:flex-row gap-3"
        >
          {/* Watch on Platform Button */}
          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: shadows.glow
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlatformWatch}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: colors.buttonGradient,
              color: colors.background,
              fontSize: typography.fontSize.md,
              boxShadow: shadows.lg,
              border: 'none',
              cursor: 'pointer',
              minHeight: '56px'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = shadows.glowStrong;
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = shadows.lg;
            }}
          >
            <Play size={20} fill="currentColor" />
            <span>Watch on Platform</span>
          </motion.button>

          {/* Watch on YouTube Button */}
          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleYouTubeWatch}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
              color: '#FFFFFF',
              fontSize: typography.fontSize.md,
              boxShadow: '0 10px 15px -3px rgba(255, 0, 0, 0.2)',
              border: 'none',
              cursor: 'pointer',
              minHeight: '56px'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 10px 15px -3px rgba(255, 0, 0, 0.2)';
            }}
          >
            <Youtube size={20} fill="currentColor" />
            <span>Watch on YouTube</span>
          </motion.button>
        </motion.div>
      ) : (
        /* Subscription Required Message - ONLY for non-subscribed users */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-lg border-2 border-dashed"
          style={{
            background: colors.surfaceCard,
            borderColor: colors.border,
            textAlign: 'center'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock size={20} style={{ color: colors.textMuted }} />
            <span style={{ 
              color: colors.textMuted, 
              fontSize: typography.fontSize.sm,
              fontWeight: 'medium'
            }}>
              Subscribe to access this course
            </span>
          </div>
          <p style={{ 
            color: colors.textMuted, 
            fontSize: typography.fontSize.xs
          }}>
            اشترك في الدورة للوصول إلى المحتوى
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CourseVideoPlayer;