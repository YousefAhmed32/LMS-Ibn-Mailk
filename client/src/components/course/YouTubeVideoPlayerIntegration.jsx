import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Video, 
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Youtube
} from 'lucide-react';

const YouTubeVideoPlayerIntegration = ({ video, onClose }) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const [videoProgress, setVideoProgress] = useState({});

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.includes('v=') 
        ? url.split('v=')[1]?.split('&')[0]
        : null;
    
    return videoId;
  };

  const handleVideoProgress = (progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [video._id]: progress
    }));
  };

  const handlePlayerStateChange = (state) => {
    console.log('Player state changed:', state);
  };

  const handlePlatformWatch = (video) => {
    // This would typically open the video in a modal or navigate to video page
    console.log('Opening video on platform:', video);
  };

  const youtubeVideoId = getYouTubeVideoId(video?.url);

  if (!video || !youtubeVideoId) {
    return (
      <div style={{ 
        minHeight: '50vh', 
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            boxShadow: shadows.lg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`,
            textAlign: 'center'
          }}
        >
          <Video size={64} style={{ color: colors.textMuted, marginBottom: spacing.lg }} />
          <h3 style={{ 
            color: colors.text, 
            fontSize: typography.fontSize.xl,
            fontWeight: 'bold',
            marginBottom: spacing.md
          }}>
            No Video Available
          </h3>
          <p style={{ color: colors.textMuted }}>
            This video is not available or the URL is invalid
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.gradient,
      padding: spacing.lg
    }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            marginBottom: spacing.lg,
            boxShadow: shadows.lg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                color: colors.textMuted,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: typography.fontSize.md
              }}
            >
              <ArrowLeft size={20} />
              Back to Course
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Info */}
            <div className="lg:col-span-2">
              <h1 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize['3xl'],
                fontWeight: 'bold',
                marginBottom: spacing.md
              }}>
                {video.title}
              </h1>
              
              <p style={{ 
                color: colors.textMuted, 
                fontSize: typography.fontSize.lg,
                lineHeight: 1.6,
                marginBottom: spacing.lg
              }}>
                {video.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div style={{
                  background: colors.accent + '20',
                  color: colors.accent,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <Video size={16} />
                  YouTube Video
                </div>
                
                <div style={{
                  background: colors.success + '20',
                  color: colors.success,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <Clock size={16} />
                  {video.duration || 'Duration not specified'}
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div style={{
              background: colors.surfaceCard,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              border: `1px solid ${colors.border}`,
              height: 'fit-content'
            }}>
              <h3 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize.lg,
                fontWeight: 'bold',
                marginBottom: spacing.md
              }}>
                Video Progress
              </h3>
              
              {videoProgress[video._id] ? (
                <div className="mb-4">
                  <div style={{
                    background: colors.background,
                    borderRadius: borderRadius.full,
                    height: '8px',
                    overflow: 'hidden',
                    marginBottom: spacing.sm
                  }}>
                    <div style={{
                      background: colors.accent,
                      height: '100%',
                      width: `${videoProgress[video._id].percentage || 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <p style={{ 
                    color: colors.textMuted, 
                    fontSize: typography.fontSize.sm,
                    textAlign: 'center'
                  }}>
                    {Math.round(videoProgress[video._id].percentage || 0)}% watched
                  </p>
                </div>
              ) : (
                <p style={{ 
                  color: colors.textMuted, 
                  fontSize: typography.fontSize.sm,
                  textAlign: 'center',
                  marginBottom: spacing.md
                }}>
                  Start watching to track progress
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                    Current Time
                  </span>
                  <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                    {videoProgress[video._id] ? 
                      `${Math.floor(videoProgress[video._id].currentTime / 60)}:${Math.floor(videoProgress[video._id].currentTime % 60).toString().padStart(2, '0')}` : 
                      '0:00'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                    Total Duration
                  </span>
                  <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                    {videoProgress[video._id] ? 
                      `${Math.floor(videoProgress[video._id].duration / 60)}:${Math.floor(videoProgress[video._id].duration % 60).toString().padStart(2, '0')}` : 
                      '0:00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            boxShadow: shadows.lg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`,
            marginBottom: spacing.lg
          }}
        >
          <h2 style={{ 
            color: colors.text, 
            fontSize: typography.fontSize.xl,
            fontWeight: 'bold',
            marginBottom: spacing.lg
          }}>
            Video Player
          </h2>

          {/* YouTube Video Player */}
          <YouTubeVideoPlayer
            videoId={youtubeVideoId}
            title={video.title}
            onStateChange={handlePlayerStateChange}
            onProgress={handleVideoProgress}
            className="mb-6"
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            boxShadow: shadows.lg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`
          }}
        >
          <h3 style={{ 
            color: colors.text, 
            fontSize: typography.fontSize.lg,
            fontWeight: 'bold',
            marginBottom: spacing.md
          }}>
            Video Options
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Watch on Platform Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePlatformWatch(video)}
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
            >
              <Play size={20} fill="currentColor" />
              <span>Watch on Platform</span>
            </motion.button>

            {/* Watch on YouTube Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}
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
            >
              <Youtube size={20} fill="currentColor" />
              <span>Watch on YouTube</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YouTubeVideoPlayerIntegration;
