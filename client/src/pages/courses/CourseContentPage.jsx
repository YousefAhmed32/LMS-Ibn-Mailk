import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import { courseService } from '../../services/courseService';
import { getEmbedUrlFromAnyYouTubeUrl } from '../../utils/youtubeUtils';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  BookOpen,
  Trophy,
  ArrowLeft,
  Video,
  FileText,
  BarChart3,
  Star,
  Award,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Target,
  Flame,
  Crown,
  Gem,
  Rocket,
  Heart,
  TrendingUp,
  Medal,
  Gift,
  Bell
} from 'lucide-react';

// Gamification Components
const XPAnimation = ({ xpGained, isVisible, onComplete }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: -50 }}
          exit={{ opacity: 0, scale: 0, y: -100 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          onAnimationComplete={onComplete}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-6 h-6" />
            +{xpGained} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfettiAnimation = ({ isVisible }) => {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece}
              initial={{ 
                opacity: 1, 
                x: Math.random() * window.innerWidth, 
                y: -10,
                rotate: 0
              }}
              animate={{ 
                opacity: 0, 
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

const LessonCompletionModal = ({ isVisible, lessonTitle, xpGained, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              >
                تم إنجاز الدرس!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-300 mb-4"
              >
                {lessonTitle}
              </motion.p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 text-lg font-bold shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  +{xpGained} XP Earned
                </motion.div>
                
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  متابعة التعلم
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AnimatedProgressBar = ({ progress, isAnimating, onAnimationComplete }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (isAnimating) {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const stepDuration = duration / steps;
      const stepSize = progress / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayProgress(Math.min(stepSize * currentStep, progress));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayProgress(progress);
          onAnimationComplete?.();
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, isAnimating, onAnimationComplete]);
  
  return (
    <div className="relative mb-8">
      <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-5 sm:h-6 overflow-hidden shadow-inner border border-gray-300/30 dark:border-gray-600/30">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative shadow-xl"
          style={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Glowing effect - removed infinite animation */}
          {isAnimating && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-60"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.02, 1] }}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

const GamificationStats = ({ stats }) => {
  const { xp, level, streak, badges } = stats;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/20"
    >
      {/* Static Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            تقدمك
          </h3>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl px-4 py-2 border border-yellow-300/30"
        >
          <Crown className="w-5 h-5 text-yellow-300" />
          <span className="text-sm sm:text-base font-bold text-yellow-100">المستوى {level}</span>
        </motion.div>
      </div>
      
      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-blue-300/30 hover:border-blue-300/50 transition-all duration-300 min-h-[100px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/30 rounded-xl">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-blue-100">النقاط</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{xp.toLocaleString()}</div>
          </div>
        </motion.div>
        
        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="group relative bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-orange-300/30 hover:border-orange-300/50 transition-all duration-300 min-h-[100px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-orange-500/30 rounded-xl">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-200" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-orange-100">التتابع</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{streak} يوم</div>
          </div>
        </motion.div>
        
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="group relative bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-emerald-300/30 hover:border-emerald-300/50 transition-all duration-300 min-h-[100px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/30 rounded-xl">
                <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-100">الشارات</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{badges}</div>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Elements - removed infinite animations */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full opacity-60"></div>
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-pink-300 rounded-full opacity-60"></div>
    </motion.div>
  );
};

const CourseContentPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // Use refs to avoid dependency issues
  const showErrorRef = useRef(showError);
  const navigateRef = useRef(navigate);
  
  // Update refs when they change
  useEffect(() => {
    showErrorRef.current = showError;
    navigateRef.current = navigate;
  }, [showError, navigate]);
  
  // State management
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    videos: true,
    exams: true
  });
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [completedExams, setCompletedExams] = useState(new Set());
  
  // Animation states
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [completedLessonTitle, setCompletedLessonTitle] = useState('');
  const [isProgressAnimating, setIsProgressAnimating] = useState(false);
  const [previousProgress, setPreviousProgress] = useState(0);
  
  // Gamification stats
  const [gamificationStats, setGamificationStats] = useState({
    xp: 1250,
    level: 3,
    streak: 7,
    badges: 5
  });
  

  const fetchCourseContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourseContent(courseId);
      
      if (response.success) {
        const data = response.data;
        
        if (data.course && data.course.isActive === false) {
          showErrorRef.current('الدورة غير متاحة', 'هذه الدورة غير مفعلة حالياً');
          navigateRef.current('/courses');
          return;
        }
        
        setCourseContent(data);
        
        if (data.progress) {
          const watchedSet = new Set(data.progress.watchedVideos || []);
          const completedSet = new Set(data.progress.completedExams || []);
          setWatchedVideos(watchedSet);
          setCompletedExams(completedSet);
        }
        
      } else {
        throw new Error(response.error || 'فشل في جلب محتوى الدورة');
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      setError(error.message || 'فشل في تحميل محتوى الدورة');
      
      if (error.response?.status === 403) {
        showErrorRef.current('الوصول مرفوض', 'تحتاج إلى التسجيل والحصول على موافقة لهذه الدورة.');
        navigateRef.current('/courses');
      } else if (error.response?.status === 404) {
        showErrorRef.current('الدورة غير موجودة', 'الدورة المطلوبة غير موجودة.');
        navigateRef.current('/courses');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Fetch course content when courseId changes
  useEffect(() => {
    fetchCourseContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleMarkVideoWatched = async (videoId, videoTitle) => {
    try {
      await courseService.markVideoCompleted(courseId, videoId);
      
      setWatchedVideos(prev => new Set([...prev, videoId]));
      
      // Calculate XP gained (base 50 XP per video)
      const xpGained = 50;
      setXpGained(xpGained);
      setCompletedLessonTitle(videoTitle);
      
      // Update gamification stats
      setGamificationStats(prev => ({
        ...prev,
        xp: prev.xp + xpGained,
        streak: prev.streak + 1
      }));
      
      // Trigger animations
      setShowXPAnimation(true);
      setShowConfetti(true);
      setShowCompletionModal(true);
      setIsProgressAnimating(true);
      
      // Hide animations after delay
      setTimeout(() => {
        setShowXPAnimation(false);
        setShowConfetti(false);
      }, 3000);
      
      showSuccess('تم تمييز الفيديو كمشاهد', 'تم تحديث تقدمك في الدورة');
      
      // Note: No need to refresh course content as we've already updated the state locally
    } catch (error) {
      console.error('Error marking video as watched:', error);
      showError('خطأ في تحديث التقدم', 'فشل في تمييز الفيديو كمشاهد');
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${courseId}/${examId}`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    const embedUrl = getEmbedUrlFromAnyYouTubeUrl(url);
    return embedUrl || url;
  };

  const calculateProgress = () => {
    if (!courseContent) return 0;
    
    const totalItems = (courseContent.videos?.length || 0) + (courseContent.exams?.length || 0);
    if (totalItems === 0) return 0;
    
    const completedItems = watchedVideos.size + completedExams.size;
    return Math.round((completedItems / totalItems) * 100);
  };

  const progressPercentage = calculateProgress();

  // Update progress animation when progress changes
  useEffect(() => {
    if (progressPercentage > previousProgress && previousProgress > 0) {
      setIsProgressAnimating(true);
      // Auto-stop animation after completion
      const timer = setTimeout(() => {
        setIsProgressAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPreviousProgress(progressPercentage);
  }, [progressPercentage, previousProgress]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Loading your learning journey...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-red-500 text-6xl mb-4"
          >
            ⚠️
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">خطأ في تحميل الدورة</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/courses')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            العودة للدورات
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-gray-500 text-6xl mb-4"
          >
            📚
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">لا يوجد محتوى للدورة</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">هذه الدورة لا تحتوي على محتوى متاح.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/courses')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            العودة للدورات
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Static Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl" />
      </div>

      {/* Animations */}
      <XPAnimation 
        xpGained={xpGained} 
        isVisible={showXPAnimation} 
        onComplete={() => setShowXPAnimation(false)}
      />
      <ConfettiAnimation 
        isVisible={showConfetti}
      />
      <LessonCompletionModal
        isVisible={showCompletionModal}
        lessonTitle={completedLessonTitle}
        xpGained={xpGained}
        onClose={() => setShowCompletionModal(false)}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b-2 border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/courses')}
                className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-sm hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 transition-all duration-200 shadow-lg flex-shrink-0 border border-blue-200/50 dark:border-blue-700/50"
              >
                <ArrowLeft size={20} className="text-blue-600 dark:text-blue-400 sm:w-5 sm:h-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate"
                >
                  {courseContent.course?.title || 'محتوى الدورة'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 line-clamp-2"
                >
                  {courseContent.course?.description || ''}
                </motion.p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">تقدم الدورة</span>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  {watchedVideos.size + completedExams.size} / {(courseContent.videos?.length || 0) + (courseContent.exams?.length || 0)} مكتمل
                </span>
                <motion.div
                  className="text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-4 py-2 rounded-xl shadow-xl border-2 border-white/30"
                  animate={{ 
                    scale: isProgressAnimating ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {Math.round(progressPercentage)}%
                </motion.div>
              </div>
            </div>
            <AnimatedProgressBar 
              progress={progressPercentage} 
              isAnimating={isProgressAnimating}
              onAnimationComplete={() => setIsProgressAnimating(false)}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
          
          {/* Course Content */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8">
            
            {/* Videos Section */}
            {courseContent.videos && courseContent.videos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl border-2 border-white/30 dark:border-gray-700/30"
              >
                <motion.div 
                  className="flex items-center justify-between cursor-pointer mb-5 sm:mb-6"
                  onClick={() => toggleSection('videos')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                      <Video size={24} className="text-white sm:w-7 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                        دروس الفيديو
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                        {courseContent.videos.length} درس • {watchedVideos.size} مكتمل
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.videos ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <ChevronRight size={22} className="text-gray-600 dark:text-gray-300 sm:w-6 sm:h-6" />
                  </motion.div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedSections.videos && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      {courseContent.videos.map((video, index) => {
                        const isWatched = watchedVideos.has(video.id);
                        
                        return (
                        <motion.div
                          key={video.id || index}
                            initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all duration-300 ${
                              isWatched 
                                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                            }`}
                          >
                            {/* Completion Badge */}
                            {isWatched && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-gray-800"
                              >
                                <CheckCircle size={20} className="text-white" />
                              </motion.div>
                            )}
                            
                            <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
                            {/* Video Thumbnail/Player */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative w-full lg:w-64 lg:flex-shrink-0"
                              >
                                <div className="w-full h-48 sm:h-56 lg:w-64 lg:h-36 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-lg">
                              {video.url ? (
                                <iframe
                                  src={convertToEmbedUrl(video.url)}
                                  width="100%"
                                  height="100%"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={video.title}
                                      className="rounded-xl"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                      <Video size={32} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                                
                                {/* Play overlay for unwatched videos */}
                                {/* {!isWatched && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center"
                                  >
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <Play size={200} className="text-gray-700 ml-1" />
                                    </motion.div>
                                  </motion.div>
                                )} */}
                              </motion.div>
                            
                            {/* Video Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                                    {video.title || `فيديو ${index + 1}`}
                                  </h3>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                                      {video.description || 'الوصف غير متاح'}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                        <Clock size={14} className="sm:w-4 sm:h-4" />
                                      <span>{video.duration || 0} دقيقة</span>
                                    </div>
                                      <div className="flex items-center gap-2">
                                        <Eye size={14} className="sm:w-4 sm:h-4" />
                                        <span>{isWatched ? 'مكتمل' : 'لم يبدأ'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                  {/* Action Button */}
                                  <div className="flex flex-col gap-2 sm:gap-3 sm:flex-shrink-0">
                                    {!isWatched ? (
                                      <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleMarkVideoWatched(video.id, video.title)}
                                        className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200 text-sm sm:text-base border-2 border-white/20"
                                      >
                                        <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">تأكيد الإنجاز</span>
                                        <span className="sm:hidden">إنجاز</span>
                                      </motion.button>
                                    ) : (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 15 }}
                                        className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-xl text-sm sm:text-base border-2 border-white/20"
                                      >
                                        <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline">مكتمل</span>
                                        <span className="sm:hidden">تم</span>
                                      </motion.div>
                                    )}
                                    
                                    {/* XP indicator */}
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 dark:text-gray-400">المكافأة</div>
                                      <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-xs sm:text-sm">
                                        <Sparkles size={12} className="sm:w-[14px] sm:h-[14px]" />
                                        <span>50 XP</span>
                                  </div>
                                    </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Exams Section */}
            {courseContent.exams && courseContent.exams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl border-2 border-white/30 dark:border-gray-700/30"
              >
                <motion.div 
                  className="flex items-center justify-between cursor-pointer mb-5 sm:mb-6"
                  onClick={() => toggleSection('exams')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 rounded-2xl shadow-lg">
                      <FileText size={24} className="text-white sm:w-7 sm:h-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">
                        الامتحانات والاختبارات
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                        {courseContent.exams.length} امتحان • {completedExams.size} مكتمل
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedSections.exams ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <ChevronRight size={22} className="text-gray-600 dark:text-gray-300 sm:w-6 sm:h-6" />
                  </motion.div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedSections.exams && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      {courseContent.exams.map((exam, index) => {
                        const isCompleted = completedExams.has(exam.id);
                        const totalMarks = exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || exam.totalMarks || 0;
                        
                        return (
                          <motion.div
                            key={exam.id || index}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className={`relative bg-white/70 dark:bg-gray-700/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 shadow-lg ${
                              isCompleted 
                                ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-xl'
                            }`}
                          >
                            {/* Completion Badge */}
                            {isCompleted && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white dark:border-gray-800"
                              >
                                <CheckCircle size={20} className="text-white" />
                              </motion.div>
                            )}
                            
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex-shrink-0">
                                    <BookOpen size={18} className="text-white sm:w-5 sm:h-5" />
                                  </div>
                                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                                    {exam.title || `Exam ${index + 1}`}
                                  </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                                  <div className="flex items-center gap-2">
                                    <Target size={14} className="sm:w-4 sm:h-4" />
                                  <span>{exam.questions?.length || exam.totalQuestions || 0} سؤال</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Trophy size={14} className="sm:w-4 sm:h-4" />
                                  <span>{totalMarks} درجة إجمالية</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock size={14} className="sm:w-4 sm:h-4" />
                                  <span>{exam.duration || 30} دقيقة</span>
                                  </div>
                                  <div className={`flex items-center gap-2 font-medium ${
                                    isCompleted ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                    <span>{isCompleted ? 'مكتمل' : 'لم يبدأ'}</span>
                                  </div>
                                </div>
                                
                                {exam.description && (
                                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                                    {exam.description}
                                  </p>
                                )}
                              </div>
                              
                              {/* Start Exam Button */}
                              <div className="flex flex-col gap-2 sm:gap-3 lg:flex-shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStartExam(exam.id)}
                                  className={`flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200 text-sm sm:text-base border-2 border-white/20 ${
                                    isCompleted 
                                      ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white hover:from-green-600 hover:via-emerald-600 hover:to-green-700'
                                      : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-600 text-white hover:from-orange-600 hover:via-red-700 hover:to-pink-700'
                                  }`}
                                >
                                  <Play size={18} className="sm:w-5 sm:h-5" />
                                  <span className="hidden sm:inline">{isCompleted ? 'مراجعة الامتحان' : 'بدء الامتحان'}</span>
                                  <span className="sm:hidden">{isCompleted ? 'مراجعة' : 'بدء'}</span>
                                </motion.button>
                                
                                {/* XP indicator */}
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 dark:text-gray-400">المكافأة</div>
                                  <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-xs sm:text-sm">
                                    <Sparkles size={12} className="sm:w-[14px] sm:h-[14px]" />
                                    <span>100 XP</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            
            {/* Gamification Stats */}
            <GamificationStats stats={gamificationStats} />
            
            {/* Course Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-white/30 dark:border-gray-700/30"
            >
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-5 sm:mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="truncate">إحصائيات الدورة</span>
              </h3>
              
              <div className="space-y-4 sm:space-y-5">
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl border-2 border-blue-200/50 dark:border-blue-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
                      <Video size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-bold">مقاطع الفيديو</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    {watchedVideos.size} / {courseContent.videos?.length || 0}
                  </span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl border-2 border-orange-200/50 dark:border-orange-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                      <FileText size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-bold">الامتحانات</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    {completedExams.size} / {courseContent.exams?.length || 0}
                  </span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border-2 border-green-200/50 dark:border-green-700/50 shadow-lg"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                      <Trophy size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-bold">التقدم</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    {progressPercentage}%
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-white/30 dark:border-gray-700/30"
            >
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-5 sm:mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="truncate">معلومات الدورة</span>
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex justify-between items-center p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold">التقدم:</span>
                  <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate ml-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}% مكتمل
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex justify-between items-center p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold">المحتوى:</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate ml-2">
                    {courseContent.videos?.length || 0} فيديو • {courseContent.exams?.length || 0} امتحان
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex justify-between items-center p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold">المدة الزمنية:</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate ml-2">
                    {courseContent.videos?.length > 0 
                      ? `${courseContent.videos.reduce((total, video) => total + (video.duration || 0), 0)} دقيقة`
                      : 'غير محدد'
                    }
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex justify-between items-center p-3 sm:p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold">المكتمل:</span>
                  <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                    {watchedVideos.size + completedExams.size} / {(courseContent.videos?.length || 0) + (courseContent.exams?.length || 0)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentPage;