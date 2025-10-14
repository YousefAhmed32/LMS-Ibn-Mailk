import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Crown, Gem, Sparkles } from 'lucide-react';
import PremiumVideoPlayer from '../../components/course/PremiumVideoPlayer';
import CourseContentSidebar from '../../components/course/CourseContentSidebar';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const CourseVideoPage = () => {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;
  
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId, videoId]);

  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseData, progressData] = await Promise.all([
        courseService.getCourseDetails(courseId),
        courseService.getUserProgress(courseId, user.id)
      ]);

      setCourse(courseData);
      setUserProgress(progressData);
      
      // Find current video
      const video = courseData.content.find(item => item.id === videoId);
      setCurrentVideo(video);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoProgress = async (progress) => {
    if (!currentVideo) return;

    try {
      await courseService.updateVideoProgress(courseId, currentVideo.id, {
        progress: progress.played * 100,
        currentTime: progress.playedSeconds,
        duration: progress.loadedSeconds
      });

      // Update local progress
      setUserProgress(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          progress: progress.played * 100,
          currentTime: progress.playedSeconds,
          started: true
        }
      }));
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const handleVideoEnded = async () => {
    if (!currentVideo) return;

    try {
      await courseService.markVideoCompleted(courseId, currentVideo.id);
      
      setUserProgress(prev => ({
        ...prev,
        [currentVideo.id]: {
          ...prev[currentVideo.id],
          completed: true,
          progress: 100
        }
      }));

      // Auto-advance to next video
      const currentIndex = course.content.findIndex(item => item.id === currentVideo.id);
      const nextItem = course.content[currentIndex + 1];
      if (nextItem && nextItem.type === 'video') {
        navigate(`/courses/${courseId}/video/${nextItem.id}`);
      }
    } catch (error) {
      console.error('Error marking video completed:', error);
    }
  };

  const handleContentItemSelect = (item) => {
    if (item.type === 'video') {
      navigate(`/courses/${courseId}/video/${item.id}`);
    } else if (item.type === 'exam') {
      navigate(`/exam/${courseId}/${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: colors.textMuted }}>Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentVideo) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>Course or video not found.</p>
          <button 
            onClick={() => navigate('/courses')}
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
              color: colors.background,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.lg,
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: `0 4px 12px ${colors.accent}30`
            }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gradient
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
        boxShadow: `0 8px 32px ${colors.shadow}20`,
        borderBottom: `1px solid ${colors.border}40`,
        backdropFilter: 'blur(20px)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.lg,
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  border: `1px solid ${colors.accent}30`,
                  color: colors.accent,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}
                className="hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span style={{ fontWeight: '600' }}>العودة</span>
              </button>
              <div>
                <h1 style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: '800',
                  color: colors.text,
                  background: `linear-gradient(135deg, ${colors.text}, ${colors.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {course.title}
                </h1>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.textMuted,
                  fontWeight: '500'
                }}>
                  {currentVideo.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                borderRadius: borderRadius.full,
                padding: `${spacing.sm} ${spacing.md}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                border: `1px solid ${colors.accent}30`,
                boxShadow: `0 4px 12px ${colors.accent}20`
              }}>
                <Crown size={16} style={{ color: colors.accent }} />
                <span style={{ 
                  color: colors.accent, 
                  fontSize: typography.fontSize.sm,
                  fontWeight: '600'
                }}>
                  دورة مميزة
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.lg,
                  background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                  border: `1px solid ${colors.border}40`,
                  color: colors.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                className="hover:scale-105 lg:hidden"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `${spacing.xl} ${spacing.lg}`
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing.xl
        }}>
          {/* Video Player */}
          <div style={{
            gridColumn: '1 / -1'
          }}>
            <PremiumVideoPlayer
              videoUrl={currentVideo.videoUrl}
              title={currentVideo.title}
              thumbnail={currentVideo.thumbnail}
              onProgress={handleVideoProgress}
              onEnded={handleVideoEnded}
              savedProgress={userProgress[currentVideo.id]?.currentTime || 0}
              className="mb-6"
            />

            {/* Video Description */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
              borderRadius: borderRadius.xl,
              boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.border}40`,
              padding: spacing.xl,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Luxury Background Pattern */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
                borderRadius: '50%'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${colors.accent}05 0%, transparent 70%)`,
                borderRadius: '50%'
              }} />
              <h2 style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: '800',
                color: colors.text,
                marginBottom: spacing.lg,
                background: `linear-gradient(135deg, ${colors.text}, ${colors.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative',
                zIndex: 1
              }}>
                {currentVideo.title}
              </h2>
              <div style={{
                position: 'relative',
                zIndex: 1
              }}>
                {currentVideo.description && (
                  <p className="mb-4">{currentVideo.description}</p>
                )}
                
                {currentVideo.learningObjectives && (
                  <div className="mb-6">
                    <h3 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: spacing.md,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm
                    }}>
                      <Gem size={20} style={{ color: colors.accent }} />
                      Learning Objectives
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {currentVideo.learningObjectives.map((objective, index) => (
                        <li key={index} className="text-gray-700">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentVideo.resources && currentVideo.resources.length > 0 && (
                  <div>
                    <h3 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: spacing.md,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm
                    }}>
                      <Sparkles size={20} style={{ color: colors.accent }} />
                      Additional Resources
                    </h3>
                    <ul className="space-y-2">
                      {currentVideo.resources.map((resource, index) => (
                        <li key={index}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: colors.accent,
                              textDecoration: 'none',
                              fontWeight: '600',
                              transition: 'all 0.3s ease',
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              background: `linear-gradient(135deg, ${colors.accent}10, transparent)`
                            }}
                          >
                            {resource.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{
            display: isSidebarOpen ? 'block' : 'none'
          }}>
            <CourseContentSidebar
              courseContent={course.content}
              currentItemId={currentVideo.id}
              onItemSelect={handleContentItemSelect}
              userProgress={userProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPage;
