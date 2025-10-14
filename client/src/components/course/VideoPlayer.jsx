import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { 
  X
} from 'lucide-react';

const VideoPlayer = ({ 
  video, 
  isOpen, 
  onClose, 
  onProgressUpdate,
  initialProgress = 0 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;

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

  if (!isOpen || !video) return null;

  const youtubeVideoId = getYouTubeVideoId(video.url);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-6xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Video Container - Using simplified YouTubeVideoPlayer */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {youtubeVideoId ? (
              <YouTubeVideoPlayer
                videoId={youtubeVideoId}
                title={video.title || 'Video'}
                autoplay={true}
                startTime={initialProgress}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Invalid YouTube URL</p>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <h4 style={{ 
              color: colors.text, 
              fontSize: typography.fontSize.lg,
              fontWeight: 'bold',
              marginBottom: spacing.sm
            }}>
              {video.title || 'فيديو'}
            </h4>
            
            {video.description && (
              <p style={{ 
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                lineHeight: 1.5
              }}>
                {video.description}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
