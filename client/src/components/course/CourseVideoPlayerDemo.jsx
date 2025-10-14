import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CourseVideoPlayer from './CourseVideoPlayer';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Video, 
  BookOpen,
  ArrowLeft,
  List,
  Grid,
  Lock,
  Unlock
} from 'lucide-react';

const CourseVideoPlayerDemo = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { user } = useAuth();
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [videoProgress, setVideoProgress] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(true); // Demo toggle

  // Sample course data with YouTube videos
  const sampleCourse = {
    _id: 'course-1',
    title: 'Complete React Development Course',
    description: 'Learn React from basics to advanced concepts with hands-on projects.',
    videos: [
      {
        _id: 'video-1',
        title: 'Introduction to React Hooks',
        description: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
        duration: 15,
        url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
        order: 1
      },
      {
        _id: 'video-2',
        title: 'Advanced JavaScript Concepts',
        description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, and async programming.',
        duration: 22,
        url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
        order: 2
      },
      {
        _id: 'video-3',
        title: 'Modern CSS Techniques',
        description: 'Explore modern CSS techniques including Grid, Flexbox, and CSS custom properties.',
        duration: 18,
        url: 'https://www.youtube.com/watch?v=hFQiDhDiYik',
        order: 3
      },
      {
        _id: 'video-4',
        title: 'React Component Lifecycle',
        description: 'Understanding React component lifecycle methods and hooks for better component management.',
        duration: 25,
        url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
        order: 4
      },
      {
        _id: 'video-5',
        title: 'State Management with Redux',
        description: 'Learn how to manage application state effectively using Redux and Redux Toolkit.',
        duration: 30,
        url: 'https://www.youtube.com/watch?v=9zySeP5vH9c',
        order: 5
      }
    ]
  };

  // Auto-select first video
  useEffect(() => {
    if (sampleCourse.videos.length > 0 && !selectedVideo) {
      setSelectedVideo(sampleCourse.videos[0]);
    }
  }, [selectedVideo]);

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoProgress = (videoId, progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: progress
    }));
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  const getProgressPercentage = (video) => {
    if (!videoProgress[video._id]) return 0;
    return Math.round(videoProgress[video._id].percentage || 0);
  };

  const calculateOverallProgress = () => {
    if (sampleCourse.videos.length === 0) return 0;
    
    const totalVideos = sampleCourse.videos.length;
    const completedVideos = sampleCourse.videos.filter(video => 
      getProgressPercentage(video) >= 95
    ).length;
    
    return Math.round((completedVideos / totalVideos) * 100);
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
              Course Video Player Demo
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Subscription Toggle */}
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                style={{
                  background: isSubscribed ? colors.success : colors.error,
                  color: colors.background,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
              >
                {isSubscribed ? <Unlock size={16} /> : <Lock size={16} />}
                {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
              </button>

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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <h2 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize['2xl'],
                fontWeight: 'bold',
                marginBottom: spacing.md
              }}>
                {sampleCourse.title}
              </h2>
              
              <p style={{ 
                color: colors.textMuted, 
                fontSize: typography.fontSize.lg,
                lineHeight: 1.6,
                marginBottom: spacing.lg
              }}>
                {sampleCourse.description}
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
                  <BookOpen size={16} />
                  React Course
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
                  <Video size={16} />
                  {sampleCourse.videos.length} videos
                </div>
                
                <div style={{
                  background: colors.warning + '20',
                  color: colors.warning,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <Clock size={16} />
                  {sampleCourse.videos.reduce((total, video) => total + video.duration, 0)} min
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
                Course Progress
              </h3>
              
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
                    width: `${calculateOverallProgress()}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ 
                  color: colors.textMuted, 
                  fontSize: typography.fontSize.sm,
                  textAlign: 'center'
                }}>
                  {calculateOverallProgress()}% complete
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                    Videos Watched
                  </span>
                  <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                    {sampleCourse.videos.filter(v => getProgressPercentage(v) >= 95).length} / {sampleCourse.videos.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                    Subscription
                  </span>
                  <span style={{ 
                    color: isSubscribed ? colors.success : colors.error, 
                    fontSize: typography.fontSize.sm,
                    fontWeight: 'bold'
                  }}>
                    {isSubscribed ? 'Active' : 'Required'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Sidebar */}
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
                Course Videos ({sampleCourse.videos.length})
              </h3>

              <div className="space-y-2">
                {sampleCourse.videos.map((video, index) => (
                  <motion.div
                    key={video._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleVideoSelect(video)}
                    style={{
                      background: selectedVideo?._id === video._id ? colors.accent + '20' : 'transparent',
                      border: `1px solid ${selectedVideo?._id === video._id ? colors.accent : colors.border}`,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div style={{
                        background: colors.accent,
                        color: colors.background,
                        borderRadius: borderRadius.full,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: typography.fontSize.sm,
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
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
                          {formatDuration(video.duration)}
                          
                          {isSubscribed && videoProgress[video._id] && (
                            <>
                              <span>•</span>
                              <CheckCircle size={12} style={{ color: colors.success }} />
                              {getProgressPercentage(video)}%
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
          <div className="lg:col-span-3">
            {selectedVideo ? (
              <CourseVideoPlayer
                video={selectedVideo}
                courseId={sampleCourse._id}
                onVideoSelect={handleVideoSelect}
                onProgressUpdate={handleVideoProgress}
                className="mb-6"
              />
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
                  Choose a video from the sidebar to start watching with native YouTube controls
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Features Overview */}
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
            Key Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 style={{ 
                color: colors.accent, 
                fontSize: typography.fontSize.lg,
                fontWeight: 'bold',
                marginBottom: spacing.sm
              }}>
                Video Player:
              </h4>
              <ul style={{ 
                color: colors.textMuted, 
                paddingLeft: spacing.lg,
                lineHeight: 1.6
              }}>
                <li>✅ Native YouTube controls (no overlays)</li>
                <li>✅ Full play, pause, volume, fullscreen support</li>
                <li>✅ Responsive design with aspect ratio</li>
                <li>✅ Progress tracking for subscribed users</li>
                <li>✅ Clean, accessible interface</li>
              </ul>
            </div>

            <div>
              <h4 style={{ 
                color: colors.accent, 
                fontSize: typography.fontSize.lg,
                fontWeight: 'bold',
                marginBottom: spacing.sm
              }}>
                Action Buttons:
              </h4>
              <ul style={{ 
                color: colors.textMuted, 
                paddingLeft: spacing.lg,
                lineHeight: 1.6
              }}>
                <li>✅ "Watch on Platform" - plays in current player</li>
                <li>✅ "Watch on YouTube" - opens in new tab</li>
                <li>✅ Only visible for subscribed students</li>
                <li>✅ Subscription check with fallback message</li>
                <li>✅ Works with multiple videos in sidebar</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseVideoPlayerDemo;