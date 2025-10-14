import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../hooks/useNotification';
import axiosInstance from '../../api/axiosInstance';
import VideoCard from '../../components/course/VideoCard';
import VideoPlayer from '../../components/course/VideoPlayer';
import ProgressBar from '../../components/course/ProgressBar';
import ExamButton from '../../components/course/ExamButton';
import CourseProgressBar from '../../components/course/CourseProgressBar';
import EnhancedProgressBar from '../../components/course/EnhancedProgressBar';
import CompletionCheckbox from '../../components/course/CompletionCheckbox';
import EnhancedCompletionCheckbox from '../../components/course/EnhancedCompletionCheckbox';
import ConfettiAnimation from '../../components/ui/ConfettiAnimation';
import ConfettiBurst from '../../components/ui/ConfettiBurst';
import MotivationalToast from '../../components/ui/MotivationalToast';
import useProgressTracking from '../../hooks/useProgressTracking';
import useEnhancedProgressTracking from '../../hooks/useEnhancedProgressTracking';
import useRealtimeProgressTracking from '../../hooks/useRealtimeProgressTracking';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock, 
  Unlock,
  BookOpen,
  Trophy,
  Target,
  ArrowLeft,
  Video,
  FileText,
  BarChart3,
  Star,
  Award,
  ChevronRight,
  ChevronDown,
  Users,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  RotateCcw,
  Pause,
  PlayCircle,
  Sparkles,
  Crown,
  Gem,
  Search,
  Filter,
  BookmarkPlus,
  Download,
  Share2,
  Bell,
  Zap,
  TrendingUp,
  BarChart,
  Brain,
  Lightbulb,
  Flame,
  Heart,
  ThumbsUp,
  MessageCircle,
  BookmarkCheck,
  Timer,
  Focus,
  Layers,
  Compass,
  Navigation,
  MapPin,
  Flag,
  CheckSquare,
  Square,
  PlaySquare,
  Volume1,
  Maximize,
  Minimize,
  RotateCw,
  RefreshCw,
  Settings2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Headphones,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Cloud,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  HeartHandshake,
  HandHeart,
  Hand,
  Handshake,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UserCircle,
  UserSquare,
  UserCog,
  UserSearch,
  UserStar
} from 'lucide-react';

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  // Realtime progress tracking with optimistic updates
  const {
    progress: courseProgress,
    loading: progressLoading,
    updating,
    markVideoCompleted,
    markExamCompleted,
    isVideoCompleted,
    isExamCompleted,
    getProgressPercentage: getCourseProgressPercentage,
    getCompletionCounts,
    showConfetti,
    motivationalToast,
    progressAnimations,
    handleProgressUpdate,
    hideConfetti,
    hideMotivationalToast
  } = useRealtimeProgressTracking(id);
  
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    videos: true,
    quizzes: true
  });
  const [videoProgress, setVideoProgress] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Advanced features state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [subtitleLanguage, setSubtitleLanguage] = useState('ar');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [favoriteVideos, setFavoriteVideos] = useState(new Set());
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [studyGoals, setStudyGoals] = useState({ daily: 60, weekly: 300 });
  const [currentGoalProgress, setCurrentGoalProgress] = useState(0);
  const [showStudyAnalytics, setShowStudyAnalytics] = useState(false);
  const [videoNotes, setVideoNotes] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [noteTimestamp, setNoteTimestamp] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState([]);
  const [showRelatedVideos, setShowRelatedVideos] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState('720p');
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Safely destructure courseContent with default values
  const { 
    course = null, 
    videos = [], 
    quizzes = [], 
    progress = {} 
  } = courseContent || {};

  // Advanced filtering and search
  const filteredVideos = useMemo(() => {
    let filtered = videos || [];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(video => {
        switch (filterType) {
          case 'completed':
            return isVideoCompleted(video._id);
          case 'in-progress':
            return video.progress && !isVideoCompleted(video._id);
          case 'not-started':
            return !video.progress;
          case 'bookmarked':
            return bookmarkedVideos.has(video._id);
          case 'favorites':
            return favoriteVideos.has(video._id);
          default:
            return true;
        }
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'progress':
          return (b.progress?.watchedDuration || 0) - (a.progress?.watchedDuration || 0);
        case 'recent':
          return (b.lastWatched || 0) - (a.lastWatched || 0);
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });
    
    return filtered;
  }, [videos, searchQuery, filterType, sortBy, bookmarkedVideos, favoriteVideos, isVideoCompleted]);
  
  // Study analytics
  const studyAnalytics = useMemo(() => {
    const totalVideos = videos?.length || 0;
    const completedVideos = videos?.filter(v => isVideoCompleted(v._id)).length || 0;
    const totalDuration = videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0;
    const watchedDuration = videos?.reduce((sum, v) => sum + (v.progress?.watchedDuration || 0), 0) || 0;
    const completionRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    const watchTimeRate = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0;
    
    return {
      totalVideos,
      completedVideos,
      totalDuration,
      watchedDuration,
      completionRate,
      watchTimeRate,
      averageSessionTime: totalStudyTime / Math.max(studyStreak, 1),
      efficiency: (completionRate + watchTimeRate) / 2
    };
  }, [videos, isVideoCompleted, totalStudyTime, studyStreak]);

  useEffect(() => {
    fetchCourseContent();
  }, [id]);


  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/courses/${id}/content`);
      
      if (response.data.success) {
        const data = response.data.data;
        
        // Check if course is active
        if (data.isActive === false) {
          showError('الدورة غير متاحة', 'هذه الدورة غير مفعلة حالياً');
          navigate('/courses');
          return;
        }
        
        setCourseContent(data);
        
        // Calculate overall progress
        if (data.videos && data.videos.length > 0) {
          const totalVideos = data.videos.length;
          const completedVideos = data.videos.filter(video => 
            video.progress?.isCompleted || video.quizResult?.passed
          ).length;
          const progressPercentage = Math.round((completedVideos / totalVideos) * 100);
          setOverallProgress(progressPercentage);
        }
        
        // Sort videos by order to ensure correct display order
        if (data.videos) {
          data.videos.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        
        // Auto-select first video if available
        if (data.videos && data.videos.length > 0) {
          setSelectedVideo(data.videos[0]);
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch course content');
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      
      if (error.response?.status === 403) {
        showError('غير مصرح لك بالوصول', 'يجب عليك الاشتراك في الدورة أولاً');
        navigate('/courses');
      } else if (error.response?.status === 404) {
        showError('الدورة غير موجودة', 'لم يتم العثور على الدورة المطلوبة');
        navigate('/courses');
      } else {
        showError('خطأ في تحميل محتوى الدورة', 'فشل في تحميل محتوى الدورة');
        navigate('/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleVideoProgress = async (videoId, progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: progress
    }));

    // Update progress in backend
    try {
      await axiosInstance.post(`/api/courses/${id}/progress`, {
        videoId,
        watchedDuration: progress.currentTime,
        totalDuration: progress.duration,
        isCompleted: progress.isCompleted
      });
      
      // Update study time
      if (progress.isCompleted) {
        setTotalStudyTime(prev => prev + (progress.duration || 0));
        setCurrentGoalProgress(prev => prev + (progress.duration || 0));
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  // Advanced video controls
  const handleVideoAction = (action, videoId) => {
    switch (action) {
      case 'bookmark':
        setBookmarkedVideos(prev => {
          const newSet = new Set(prev);
          if (newSet.has(videoId)) {
            newSet.delete(videoId);
          } else {
            newSet.add(videoId);
          }
          return newSet;
        });
        break;
      case 'favorite':
        setFavoriteVideos(prev => {
          const newSet = new Set(prev);
          if (newSet.has(videoId)) {
            newSet.delete(videoId);
          } else {
            newSet.add(videoId);
          }
          return newSet;
        });
        break;
      case 'download':
        setShowDownloadOptions(true);
        break;
      case 'share':
        setShowShareModal(true);
        break;
      case 'note':
        setShowNotes(true);
        setNoteTimestamp(Date.now());
        break;
      case 'transcript':
        setShowTranscript(!showTranscript);
        break;
      case 'comments':
        setShowComments(!showComments);
        break;
      case 'related':
        setShowRelatedVideos(!showRelatedVideos);
        break;
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          // Toggle play/pause
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          // Toggle fullscreen
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          // Toggle mute
          break;
        case 'ArrowRight':
          e.preventDefault();
          // Skip forward
          break;
        case 'ArrowLeft':
          e.preventDefault();
          // Skip backward
          break;
        case 'ArrowUp':
          e.preventDefault();
          // Volume up
          break;
        case 'ArrowDown':
          e.preventDefault();
          // Volume down
          break;
        case '>':
          e.preventDefault();
          // Speed up
          break;
        case '<':
          e.preventDefault();
          // Speed down
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Study streak tracking
  useEffect(() => {
    const today = new Date().toDateString();
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    
    if (lastStudyDate !== today) {
      const streak = parseInt(localStorage.getItem('studyStreak') || '0');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastStudyDate === yesterday.toDateString()) {
        setStudyStreak(streak + 1);
        localStorage.setItem('studyStreak', (streak + 1).toString());
      } else if (lastStudyDate !== today) {
        setStudyStreak(1);
        localStorage.setItem('studyStreak', '1');
      }
      
      localStorage.setItem('lastStudyDate', today);
    } else {
      setStudyStreak(parseInt(localStorage.getItem('studyStreak') || '0'));
    }
  }, []);

  const handleQuizSubmit = async (quizId, answers) => {
    try {
      const response = await axiosInstance.post(`/api/courses/${id}/quizzes/${quizId}/submit`, {
        answers
      });
      
      if (response.data.success) {
        setQuizResults(prev => ({
          ...prev,
          [quizId]: response.data.result
        }));
        showSuccess('تم إرسال الإجابات', `نتيجتك: ${response.data.result.score}%`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showError('خطأ في إرسال الإجابات', 'فشل في إرسال إجابات الاختبار');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  const getProgressPercentage = (video) => {
    if (!video.progress) return 0;
    return Math.round((video.progress.watchedDuration / video.progress.totalDuration) * 100);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p style={{ color: colors.text, fontSize: typography.fontSize.lg }}>
            جاري تحميل محتوى الدورة...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <BookOpen size={64} style={{ color: colors.textMuted }} className="mx-auto mb-4" />
          <h2 style={{ color: colors.text, fontSize: typography.fontSize.xl, marginBottom: spacing.md }}>
            لا يوجد محتوى متاح
          </h2>
          <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>
            لم يتم العثور على محتوى لهذه الدورة
          </p>
          <button
            onClick={() => navigate('/courses')}
            style={{
              background: colors.accent,
              color: colors.background,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              border: 'none',
              cursor: 'pointer',
              fontSize: typography.fontSize.md
            }}
          >
            العودة للدورات
          </button>
        </motion.div>
      </div>
    );
  }

  // Show loading state if courseContent is not loaded yet
  if (loading || !courseContent) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradient,
        padding: spacing.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            color: colors.text
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: spacing.md }}
          >
            <BookOpen size={48} color={colors.accent} />
          </motion.div>
          <h2 style={{ color: colors.text, marginBottom: spacing.sm }}>
            جاري تحميل محتوى الدورة...
          </h2>
          <p style={{ color: colors.textMuted }}>
            يرجى الانتظار بينما نقوم بتحميل المحتوى
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            marginBottom: spacing.lg,
            boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}40`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Luxury Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${colors.accent}10 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '150px',
            height: '150px',
            background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, 50%)'
          }} />
          {/* Desktop Header Layout */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  color: colors.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.md,
                  transition: 'all 0.3s ease'
                }}
                className="hover:opacity-80"
              >
                <ArrowLeft size={20} />
                العودة للدورات
              </button>
              
              <div className="flex items-center gap-4">
                {/* Advanced Search Bar */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                  borderRadius: borderRadius.full,
                  padding: `${spacing.xs} ${spacing.md}`,
                  border: `1px solid ${colors.border}40`,
                  minWidth: '300px'
                }}>
                  <Search size={18} style={{ color: colors.textMuted, marginRight: spacing.sm }} />
                  <input
                    type="text"
                    placeholder="البحث في الفيديوهات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      flex: 1,
                      padding: `${spacing.xs} 0`
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        padding: spacing.xs
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                      borderRadius: borderRadius.full,
                      padding: `${spacing.sm} ${spacing.md}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      border: `1px solid ${colors.accent}30`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="hover:scale-105"
                  >
                    <Filter size={16} style={{ color: colors.accent }} />
                    <span style={{ 
                      color: colors.accent, 
                      fontSize: typography.fontSize.sm,
                      fontWeight: '600'
                    }}>
                      فلترة
                    </span>
                    <ChevronDown size={14} style={{ color: colors.accent }} />
                  </button>
                </div>

                {/* Premium Badge */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  borderRadius: borderRadius.full,
                  padding: `${spacing.sm} ${spacing.md}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  border: `1px solid ${colors.accent}30`
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
              </div>
            </div>
          </div>

          {/* Tablet Header Layout */}
          <div className="hidden md:block lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  color: colors.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  transition: 'all 0.3s ease'
                }}
                className="hover:opacity-80"
              >
                <ArrowLeft size={18} />
                العودة
              </button>
              
              <div className="flex items-center gap-3">
                {/* Compact Search Bar */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                  borderRadius: borderRadius.full,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  border: `1px solid ${colors.border}40`,
                  minWidth: '200px'
                }}>
                  <Search size={16} style={{ color: colors.textMuted, marginRight: spacing.xs }} />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: colors.text,
                      fontSize: typography.fontSize.xs,
                      flex: 1,
                      padding: `${spacing.xs} 0`
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: colors.textMuted,
                        cursor: 'pointer',
                        padding: spacing.xs
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Compact Filter Button */}
                <button
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    borderRadius: borderRadius.full,
                    padding: `${spacing.sm} ${spacing.sm}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    border: `1px solid ${colors.accent}30`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:scale-105"
                >
                  <Filter size={14} style={{ color: colors.accent }} />
                  <ChevronDown size={12} style={{ color: colors.accent }} />
                </button>

                {/* Compact Premium Badge */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  borderRadius: borderRadius.full,
                  padding: `${spacing.sm} ${spacing.sm}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  border: `1px solid ${colors.accent}30`
                }}>
                  <Crown size={14} style={{ color: colors.accent }} />
                  <span style={{ 
                    color: colors.accent, 
                    fontSize: typography.fontSize.xs,
                    fontWeight: '600'
                  }}>
                    مميزة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header Layout */}
          <div className="block md:hidden">
            {/* Mobile Top Row */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/courses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  color: colors.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                  transition: 'all 0.3s ease'
                }}
                className="hover:opacity-80"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">العودة</span>
              </button>
              
              <div className="flex items-center gap-2">
                {/* Mobile Premium Badge */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  borderRadius: borderRadius.full,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  border: `1px solid ${colors.accent}30`
                }}>
                  <Crown size={12} style={{ color: colors.accent }} />
                  <span style={{ 
                    color: colors.accent, 
                    fontSize: typography.fontSize.xs,
                    fontWeight: '600'
                  }}>
                    مميزة
                  </span>
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    borderRadius: borderRadius.full,
                    padding: spacing.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    border: `1px solid ${colors.accent}30`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:scale-105"
                >
                  <Filter size={14} style={{ color: colors.accent }} />
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
              borderRadius: borderRadius.full,
              padding: `${spacing.sm} ${spacing.md}`,
              border: `1px solid ${colors.border}40`,
              marginBottom: spacing.sm
            }}>
              <Search size={16} style={{ color: colors.textMuted, marginRight: spacing.sm }} />
              <input
                type="text"
                placeholder="البحث في الفيديوهات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: colors.text,
                  fontSize: typography.fontSize.sm,
                  flex: 1,
                  padding: `${spacing.xs} 0`
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.textMuted,
                    cursor: 'pointer',
                    padding: spacing.xs
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <h1 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize['3xl'],
                fontWeight: '800',
                marginBottom: spacing.md,
                background: `linear-gradient(135deg, ${colors.text}, ${colors.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative',
                zIndex: 1
              }}>
                {course.title}
              </h1>
              
              <p style={{ 
                color: colors.textMuted, 
                fontSize: typography.fontSize.lg,
                lineHeight: 1.7,
                marginBottom: spacing.lg,
                position: 'relative',
                zIndex: 1,
                fontWeight: '400'
              }}>
                {course.description}
              </p>

              {/* Enhanced Course Progress Bar */}
              {courseProgress && (
                <div className="mb-6">
                  <EnhancedProgressBar 
                    progress={courseProgress}
                    variant="large"
                    showDetails={true}
                    onProgressUpdate={handleProgressUpdate}
                  />
                </div>
              )}

              {/* Exam Buttons */}
              <div className="mb-6">
                <ExamButton 
                  exams={course.exams} 
                  courseTitle={course.title}
                  courseId={id}
                />
              </div>

              <div className="flex flex-wrap gap-3 mb-6" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                  color: colors.accent,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  border: `1px solid ${colors.accent}30`,
                  fontWeight: '600',
                  boxShadow: `0 4px 12px ${colors.accent}20`
                }}>
                  <Gem size={16} />
                  الصف {course.grade}
                </div>
                
                <div style={{
                  background: `linear-gradient(135deg, ${colors.success}25, ${colors.success}15)`,
                  color: colors.success,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  border: `1px solid ${colors.success}30`,
                  fontWeight: '600',
                  boxShadow: `0 4px 12px ${colors.success}20`
                }}>
                  <Video size={16} />
                  {videos.length} فيديو
                </div>
                
                <div style={{
                  background: `linear-gradient(135deg, ${colors.warning}25, ${colors.warning}15)`,
                  color: colors.warning,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  border: `1px solid ${colors.warning}30`,
                  fontWeight: '600',
                  boxShadow: `0 4px 12px ${colors.warning}20`
                }}>
                  <Clock size={16} />
                  {formatDuration(course.totalDuration)}
                </div>
              </div>
            </div>

            {/* Progress Card */}
           
          </div>
        </motion.div>

        {/* Advanced Controls Panel */}
        {showAdvancedControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.border}40`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Advanced Controls Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
              borderRadius: '50%'
            }} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Filter Options */}
              <div>
                <h3 style={{
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: '700',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}>
                  <Filter size={20} style={{ color: colors.accent }} />
                  فلترة الفيديوهات
                </h3>
                
                <div className="space-y-3">
                  {[
                    { value: 'all', label: 'جميع الفيديوهات', icon: Video },
                    { value: 'completed', label: 'مكتملة', icon: CheckCircle },
                    { value: 'in-progress', label: 'قيد التشغيل', icon: Play },
                    { value: 'not-started', label: 'لم تبدأ', icon: Square },
                    { value: 'bookmarked', label: 'محفوظة', icon: BookmarkCheck },
                    { value: 'favorites', label: 'المفضلة', icon: Heart }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilterType(option.value)}
                      style={{
                        width: '100%',
                        background: filterType === option.value 
                          ? `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`
                          : `linear-gradient(135deg, ${colors.surfaceCard}50, transparent)`,
                        border: `1px solid ${filterType === option.value ? colors.accent : colors.border}40`,
                        borderRadius: borderRadius.md,
                        padding: `${spacing.sm} ${spacing.md}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: filterType === option.value ? colors.accent : colors.textMuted
                      }}
                    >
                      <option.icon size={16} />
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: '500' }}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 style={{
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: '700',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}>
                  <BarChart size={20} style={{ color: colors.accent }} />
                  ترتيب الفيديوهات
                </h3>
                
                <div className="space-y-3">
                  {[
                    { value: 'order', label: 'الترتيب الأصلي', icon: Layers },
                    { value: 'title', label: 'حسب العنوان', icon: FileText },
                    { value: 'duration', label: 'حسب المدة', icon: Clock },
                    { value: 'progress', label: 'حسب التقدم', icon: TrendingUp },
                    { value: 'recent', label: 'الأحدث', icon: Calendar }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      style={{
                        width: '100%',
                        background: sortBy === option.value 
                          ? `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`
                          : `linear-gradient(135deg, ${colors.surfaceCard}50, transparent)`,
                        border: `1px solid ${sortBy === option.value ? colors.accent : colors.border}40`,
                        borderRadius: borderRadius.md,
                        padding: `${spacing.sm} ${spacing.md}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        color: sortBy === option.value ? colors.accent : colors.textMuted
                      }}
                    >
                      <option.icon size={16} />
                      <span style={{ fontSize: typography.fontSize.sm, fontWeight: '500' }}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Analytics */}
              <div>
                <h3 style={{
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: '700',
                  marginBottom: spacing.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}>
                  <Brain size={20} style={{ color: colors.accent }} />
                  إحصائيات الدراسة
                </h3>
                
                <div className="space-y-3">
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.success}20, ${colors.success}10)`,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    border: `1px solid ${colors.success}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <Trophy size={16} style={{ color: colors.success }} />
                      <span style={{ color: colors.success, fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                        معدل الإكمال
                      </span>
                    </div>
                    <div style={{ color: colors.text, fontSize: typography.fontSize.lg, fontWeight: '700' }}>
                      {Math.round(studyAnalytics.completionRate)}%
                    </div>
                  </div>
                  
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.warning}20, ${colors.warning}10)`,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    border: `1px solid ${colors.warning}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <Flame size={16} style={{ color: colors.warning }} />
                      <span style={{ color: colors.warning, fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                        سلسلة الدراسة
                      </span>
                    </div>
                    <div style={{ color: colors.text, fontSize: typography.fontSize.lg, fontWeight: '700' }}>
                      {studyStreak} يوم
                    </div>
                  </div>
                  
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                      <Timer size={16} style={{ color: colors.accent }} />
                      <span style={{ color: colors.accent, fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                        وقت الدراسة
                      </span>
                    </div>
                    <div style={{ color: colors.text, fontSize: typography.fontSize.lg, fontWeight: '700' }}>
                      {Math.round(totalStudyTime / 60)} دقيقة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div style={{
              background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.border}40`,
              position: 'sticky',
              top: spacing.lg,
              overflow: 'hidden'
            }}>
              {/* Luxury Sidebar Pattern */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${colors.accent}08 0%, transparent 70%)`,
                borderRadius: '50%'
              }} />
              {/* Videos Section */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('videos')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: colors.text,
                    fontSize: typography.fontSize.lg,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                    <Video size={20} />
                    الفيديوهات ({videos.length})
                  </div>
                  {expandedSections.videos ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <AnimatePresence>
                  {expandedSections.videos && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {filteredVideos.map((video, index) => (
                        <motion.div
                          key={video._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleVideoSelect(video)}
                          style={{
                            background: selectedVideo?._id === video._id 
                              ? `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)` 
                              : `linear-gradient(135deg, ${colors.surfaceCard}50, transparent)`,
                            border: `1px solid ${selectedVideo?._id === video._id ? colors.accent : colors.border}40`,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: selectedVideo?._id === video._id 
                              ? `0 8px 25px ${colors.accent}20` 
                              : `0 4px 12px ${colors.shadow}10`
                          }}
                          className="hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <div style={{
                              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                              color: colors.background,
                              borderRadius: borderRadius.full,
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: typography.fontSize.sm,
                              fontWeight: 'bold',
                              flexShrink: 0,
                              boxShadow: `0 4px 12px ${colors.accent}30`,
                              border: `2px solid ${colors.accent}20`
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
                                
                                {video.progress && (
                                  <>
                                    <span>•</span>
                                    <CheckCircle size={12} style={{ color: colors.success }} />
                                    {getProgressPercentage(video)}%
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Completion Checkbox */}
                            <div className="flex-shrink-0">
                              <EnhancedCompletionCheckbox
                                isCompleted={isVideoCompleted(video._id)}
                                onToggle={() => {
                                  if (isVideoCompleted(video._id)) {
                                    // Unmark as completed (if needed)
                                    console.log('Unmarking video as completed:', video._id);
                                  } else {
                                    markVideoCompleted(video._id);
                                  }
                                }}
                                disabled={updating}
                                loading={updating}
                                type="video"
                                size="small"
                                showLabel={false}
                                onCompletion={(type) => {
                                  console.log(`${type} completed with enhanced animations!`);
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Advanced Video Controls */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                            marginTop: spacing.sm,
                            paddingTop: spacing.sm,
                            borderTop: `1px solid ${colors.border}20`
                          }}>
                            <button
                              onClick={() => handleVideoAction('bookmark', video._id)}
                              style={{
                                background: bookmarkedVideos.has(video._id) 
                                  ? `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`
                                  : 'transparent',
                                border: `1px solid ${bookmarkedVideos.has(video._id) ? colors.accent : colors.border}40`,
                                borderRadius: borderRadius.sm,
                                padding: spacing.xs,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: bookmarkedVideos.has(video._id) ? colors.accent : colors.textMuted
                              }}
                              title="حفظ للاحقاً"
                            >
                              <BookmarkPlus size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleVideoAction('favorite', video._id)}
                              style={{
                                background: favoriteVideos.has(video._id) 
                                  ? `linear-gradient(135deg, ${colors.warning}25, ${colors.warning}15)`
                                  : 'transparent',
                                border: `1px solid ${favoriteVideos.has(video._id) ? colors.warning : colors.border}40`,
                                borderRadius: borderRadius.sm,
                                padding: spacing.xs,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: favoriteVideos.has(video._id) ? colors.warning : colors.textMuted
                              }}
                              title="إضافة للمفضلة"
                            >
                              <Heart size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleVideoAction('download', video._id)}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${colors.border}40`,
                                borderRadius: borderRadius.sm,
                                padding: spacing.xs,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: colors.textMuted
                              }}
                              title="تحميل الفيديو"
                            >
                              <Download size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleVideoAction('share', video._id)}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${colors.border}40`,
                                borderRadius: borderRadius.sm,
                                padding: spacing.xs,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: colors.textMuted
                              }}
                              title="مشاركة الفيديو"
                            >
                              <Share2 size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleVideoAction('note', video._id)}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${colors.border}40`,
                                borderRadius: borderRadius.sm,
                                padding: spacing.xs,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: colors.textMuted
                              }}
                              title="إضافة ملاحظة"
                            >
                              <FileText size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

             
            </div>
          </div>

          {/* Main Content - Card Grid */}
          <div className="lg:col-span-3">
            {/* Course Progress Header */}
          

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  index={index}
                  onVideoSelect={handleVideoSelect}
                  onQuizStart={(video) => {
                    // Handle quiz start
                    console.log('Starting quiz for video:', video);
                  }}
                  isSelected={selectedVideo?._id === video._id}
                  progress={video.progress}
                  quizResult={video.quizResult}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredVideos.length === 0 && courseContent?.videos && courseContent.videos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
                  borderRadius: borderRadius.xl,
                  padding: spacing['2xl'],
                  boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.border}40`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'relative',
                  display: 'inline-block',
                  marginBottom: spacing.lg
                }}>
                  <Search size={64} style={{ color: colors.textMuted }} />
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Filter size={12} style={{ color: colors.background }} />
                  </div>
                </div>
                <h3 style={{ 
                  color: colors.text, 
                  fontSize: typography.fontSize.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.md
                }}>
                  لا توجد نتائج للبحث
                </h3>
                <p style={{ color: colors.textMuted, marginBottom: spacing.lg }}>
                  لم يتم العثور على فيديوهات تطابق معايير البحث والفلترة
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setSortBy('order');
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    color: colors.background,
                    padding: `${spacing.md} ${spacing.lg}`,
                    borderRadius: borderRadius.lg,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: typography.fontSize.md,
                    fontWeight: '600',
                    boxShadow: `0 4px 12px ${colors.accent}30`
                  }}
                >
                  إعادة تعيين الفلاتر
                </button>
              </motion.div>
            ) : (!courseContent?.videos || courseContent.videos.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
                  borderRadius: borderRadius.xl,
                  padding: spacing['2xl'],
                  boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${colors.border}40`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'relative',
                  display: 'inline-block',
                  marginBottom: spacing.lg
                }}>
                  <Video size={64} style={{ color: colors.textMuted }} />
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={12} style={{ color: colors.background }} />
                  </div>
                </div>
                <h3 style={{ 
                  color: colors.text, 
                  fontSize: typography.fontSize.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.md
                }}>
                  لا توجد دروس متاحة
                </h3>
                <p style={{ color: colors.textMuted }}>
                  لم يتم إضافة أي دروس لهذه الدورة بعد
                </p>
              </motion.div>
            )}

            {/* Legacy Content - Keep for now */}
            {false && selectedVideo ? (
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
                <div className="mb-6">
                  <h2 style={{ 
                    color: colors.text, 
                    fontSize: typography.fontSize.xl,
                    fontWeight: 'bold',
                    marginBottom: spacing.sm
                  }}>
                    {selectedVideo.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <Clock size={16} />
                      {formatDuration(selectedVideo.duration)}
                    </div>
                    
                    {selectedVideo.progress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <CheckCircle size={16} style={{ color: colors.success }} />
                        {getProgressPercentage(selectedVideo)}% مكتمل
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Player Placeholder */}
                <div style={{
                  background: colors.background,
                  borderRadius: borderRadius.lg,
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.lg,
                  border: `1px solid ${colors.border}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {selectedVideo.thumbnail ? (
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      background: colors.gradient,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PlayCircle size={64} style={{ color: colors.textMuted }} />
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(50%, -50%)',
                    background: colors.accent,
                    color: colors.background,
                    borderRadius: borderRadius.full,
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: shadows.lg
                  }}
                  className="hover:scale-110"
                  onClick={() => setShowVideoPlayer(true)}
                  >
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>

                {/* Video Description */}
                {selectedVideo.description && (
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
                      وصف الدرس
                    </h3>
                    <p style={{ 
                      color: colors.textMuted, 
                      lineHeight: 1.6
                    }}>
                      {selectedVideo.description}
                    </p>
                  </div>
                )}

                {/* Quiz Section */}
                {selectedVideo.quiz && selectedVideo.quiz.questions && selectedVideo.quiz.questions.length > 0 && (
                  <div style={{
                    background: colors.background,
                    borderRadius: borderRadius.md,
                    padding: spacing.lg,
                    border: `1px solid ${colors.border}`,
                    marginTop: spacing.lg
                  }}>
                    <h3 style={{ 
                      color: colors.text, 
                      fontSize: typography.fontSize.lg,
                      fontWeight: 'bold',
                      marginBottom: spacing.md,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm
                    }}>
                      <FileText size={20} />
                      اختبار الدرس
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm mb-4" style={{ color: colors.textMuted }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <Target size={16} />
                        {selectedVideo.quiz.questions?.length || 0} أسئلة
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <Clock size={16} />
                        {selectedVideo.quiz.timeLimit || 10} دقيقة
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <Trophy size={16} />
                        النجاح: {selectedVideo.quiz.passingScore || 70}%
                      </div>
                    </div>

                    <button
                      style={{
                        background: colors.accent,
                        color: colors.background,
                        border: 'none',
                        borderRadius: borderRadius.md,
                        padding: `${spacing.md} ${spacing.lg}`,
                        fontSize: typography.fontSize.md,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:opacity-90"
                    >
                      بدء الاختبار
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
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
                <Video size={64} style={{ color: colors.textMuted }} className="mx-auto mb-4" />
                <h3 style={{ 
                  color: colors.text, 
                  fontSize: typography.fontSize.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.md
                }}>
                  اختر درساً للبدء
                </h3>
                <p style={{ 
                  color: colors.textMuted, 
                  fontSize: typography.fontSize.lg
                }}>
                  اختر درساً من القائمة الجانبية لبدء التعلم
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        video={selectedVideo}
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        onProgressUpdate={(progress) => {
          if (selectedVideo) {
            handleVideoProgress(selectedVideo._id, progress);
          }
        }}
        initialProgress={selectedVideo?.progress?.watchedDuration || 0}
      />

      {/* Enhanced Motivational Feedback Components */}
      <ConfettiBurst 
        isActive={showConfetti}
        duration={3000}
        particleCount={30}
        onComplete={hideConfetti}
      />
      
      <MotivationalToast
        isVisible={motivationalToast.isVisible}
        onClose={hideMotivationalToast}
        type={motivationalToast.type}
        message={motivationalToast.message}
        progressPercentage={motivationalToast.progressPercentage}
        duration={4000}
      />
    </div>
  );
};

export default CourseContent;
