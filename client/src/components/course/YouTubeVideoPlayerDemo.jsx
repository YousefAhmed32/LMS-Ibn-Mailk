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
  List,
  Grid
} from 'lucide-react';

const YouTubeVideoPlayerDemo = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [videoProgress, setVideoProgress] = useState({});

  // Sample video data with YouTube video IDs
  const sampleVideos = [
    {
      id: '1',
      videoId: 'dpw9EHDh2bM', // React Hooks tutorial
      title: 'Introduction to React Hooks',
      description: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
      duration: '15:30',
      thumbnail: 'https://img.youtube.com/vi/dpw9EHDh2bM/maxresdefault.jpg'
    },
    {
      id: '2',
      videoId: 'BwuLxPH8IDs', // JavaScript tutorial
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, and async programming.',
      duration: '22:45',
      thumbnail: 'https://img.youtube.com/vi/BwuLxPH8IDs/maxresdefault.jpg'
    },
    {
      id: '3',
      videoId: 'hFQiDhDiYik', // CSS tutorial
      title: 'Modern CSS Techniques',
      description: 'Explore modern CSS techniques including Grid, Flexbox, and CSS custom properties.',
      duration: '18:20',
      thumbnail: 'https://img.youtube.com/vi/hFQiDhDiYik/maxresdefault.jpg'
    },
    {
      id: '4',
      videoId: 'Ke90Tje7VS0', // React tutorial
      title: 'React Component Lifecycle',
      description: 'Understanding React component lifecycle methods and hooks for better component management.',
      duration: '25:10',
      thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg'
    }
  ];

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoProgress = (videoId, progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: progress
    }));
  };

  const handlePlayerStateChange = (videoId, state) => {
    console.log(`Video ${videoId} state changed:`, state);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.gradient,
      padding: spacing.lg
    }}>
      <div className="max-w-7xl mx-auto">
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
            <h1 style={{ 
              color: colors.text, 
              fontSize: typography.fontSize['3xl'],
              fontWeight: 'bold'
            }}>
              YouTube Video Player Demo
            </h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                style={{
                  background: colors.accent,
                  color: colors.background,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
              >
                {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                {viewMode === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
          </div>
          
          <p style={{ 
            color: colors.textMuted, 
            fontSize: typography.fontSize.lg,
            lineHeight: 1.6
          }}>
            Fully functional YouTube video player with custom controls, volume management, and progress tracking.
            Click on any video to start playing.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                background: colors.surfaceCard,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                boxShadow: shadows.lg,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.border}`,
                position: 'sticky',
                top: spacing.lg
              }}
            >
              <h3 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize.xl,
                fontWeight: 'bold',
                marginBottom: spacing.lg,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm
              }}>
                <Video size={20} />
                Video Library ({sampleVideos.length})
              </h3>

              <div className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-1' : 'flex flex-col'}`}>
                {sampleVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleVideoSelect(video)}
                    style={{
                      background: selectedVideo?.id === video.id ? colors.accent + '20' : 'transparent',
                      border: `2px solid ${selectedVideo?.id === video.id ? colors.accent : colors.border}`,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Video Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={16} className="text-white" fill="white" />
                        </div>
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          color: colors.text, 
                          fontSize: typography.fontSize.sm,
                          fontWeight: 'bold',
                          marginBottom: spacing.xs,
                          lineHeight: 1.4
                        }}>
                          {video.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                          <Clock size={12} />
                          {video.duration}
                          
                          {videoProgress[video.id] && (
                            <>
                              <span>•</span>
                              <CheckCircle size={12} style={{ color: colors.success }} />
                              {Math.round(videoProgress[video.id].percentage || 0)}%
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: colors.surfaceCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  boxShadow: shadows.lg,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border}`
                }}
              >
                <h2 style={{ 
                  color: colors.text, 
                  fontSize: typography.fontSize.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.lg
                }}>
                  Now Playing: {selectedVideo.title}
                </h2>

                {/* YouTube Video Player */}
                <YouTubeVideoPlayer
                  videoId={selectedVideo.videoId}
                  title={selectedVideo.title}
                  onStateChange={(state) => handlePlayerStateChange(selectedVideo.id, state)}
                  onProgress={(progress) => handleVideoProgress(selectedVideo.id, progress)}
                  className="mb-6"
                />

                {/* Video Description */}
                <div style={{
                  background: colors.background,
                  borderRadius: borderRadius.md,
                  padding: spacing.lg,
                  border: `1px solid ${colors.border}`
                }}>
                  <h3 style={{ 
                    color: colors.text, 
                    fontSize: typography.fontSize.lg,
                    fontWeight: 'bold',
                    marginBottom: spacing.md
                  }}>
                    Video Description
                  </h3>
                  <p style={{ 
                    color: colors.textMuted, 
                    lineHeight: 1.6
                  }}>
                    {selectedVideo.description}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: colors.surfaceCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing['2xl'],
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
                  Select a Video to Play
                </h3>
                <p style={{ color: colors.textMuted }}>
                  Choose a video from the library to start watching with full YouTube controls
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            boxShadow: shadows.lg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.border}`,
            marginTop: spacing.lg
          }}
        >
          <h3 style={{ 
            color: colors.text, 
            fontSize: typography.fontSize.xl,
            fontWeight: 'bold',
            marginBottom: spacing.md
          }}>
            Component Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 style={{ 
                color: colors.accent, 
                fontSize: typography.fontSize.lg,
                fontWeight: 'bold',
                marginBottom: spacing.sm
              }}>
                Controls:
              </h4>
              <ul style={{ 
                color: colors.textMuted, 
                paddingLeft: spacing.lg,
                lineHeight: 1.6
              }}>
                <li>✅ Play/Pause functionality</li>
                <li>✅ Volume control with mute/unmute</li>
                <li>✅ Volume increase/decrease buttons</li>
                <li>✅ Progress tracking and display</li>
                <li>✅ Fullscreen support</li>
                <li>✅ Video restart functionality</li>
                <li>✅ Real-time volume level display</li>
              </ul>
            </div>

            <div>
              <h4 style={{ 
                color: colors.accent, 
                fontSize: typography.fontSize.lg,
                fontWeight: 'bold',
                marginBottom: spacing.sm
              }}>
                Technical Features:
              </h4>
              <ul style={{ 
                color: colors.textMuted, 
                paddingLeft: spacing.lg,
                lineHeight: 1.6
              }}>
                <li>✅ React hooks (useState, useRef, useCallback)</li>
                <li>✅ Responsive design with aspect ratio</li>
                <li>✅ Tailwind CSS styling</li>
                <li>✅ Framer Motion animations</li>
                <li>✅ Multiple video support</li>
                <li>✅ Progress tracking callbacks</li>
                <li>✅ State change event handling</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YouTubeVideoPlayerDemo;
