import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Play,
  CheckCircle,
  Star,
  Zap,
  Activity,
  BarChart3,
  Users,
  Eye,
  Bell,
  Plus,
  RefreshCw,
  MessageSquare,
  BookMarked,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

// Progress Overview Component
const ProgressOverview = ({ overallProgress, courseProgress }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [0.8, 1],
      opacity: [0, 1],
      transition: { duration: 0.6, ease: "easeOut" }
    });

    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 300);

    return () => clearTimeout(timer);
  }, [overallProgress, controls]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white/90 dark:bg-luxury-navy-800/90 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-8 backdrop-blur-md hover-lift group overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold-50/20 via-transparent to-luxury-orange-50/20 dark:from-luxury-gold-900/10 dark:via-transparent dark:to-luxury-orange-900/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-luxury-gold-500/20 to-luxury-gold-600/20 rounded-2xl border border-luxury-gold-500/30 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <Target className="h-6 w-6 text-luxury-gold-600 dark:text-luxury-gold-400 group-hover:animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              نظرة عامة على التقدم
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              تابع تقدمك في جميع الدورات
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold bg-gradient-to-r from-luxury-gold-600 via-luxury-orange-500 to-luxury-gold-500 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
            {animatedProgress}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-end gap-1">
            <TrendingUp className="h-4 w-4 text-luxury-emerald-500" />
            التقدم الإجمالي
          </div>
        </div>
      </div>

      {/* Enhanced Circular Progress */}
      <div className="flex justify-center mb-10">
        <div className="relative w-44 h-44">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-luxury-gold-400/20 via-luxury-orange-400/20 to-luxury-gold-400/20 blur-xl animate-pulse-soft" />
          
          <svg className="w-44 h-44 transform -rotate-90 drop-shadow-2xl relative z-10" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-100/50 dark:text-luxury-navy-600/20"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - animatedProgress / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - animatedProgress / 100) }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="drop-shadow-lg filter blur-[0.5px]"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="30%" stopColor="#D2B065" />
                <stop offset="70%" stopColor="#E5C547" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-luxury-gold-600 via-luxury-orange-500 to-luxury-gold-500 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                {animatedProgress}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4 text-luxury-emerald-500" />
                مكتمل
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Bars */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-luxury-orange-500 to-luxury-gold-500 rounded-full ml-2 animate-pulse"></div>
          تقدم الدورات
          <Sparkles className="h-4 w-4 text-luxury-gold-500 ml-2 animate-bounce-gentle" />
        </h3>
        {courseProgress.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group p-5 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-luxury-navy-700/40 dark:to-luxury-navy-600/40 rounded-2xl border border-gray-100/50 dark:border-luxury-navy-600/30 hover:border-luxury-orange-500/40 hover:shadow-lg transition-all duration-300 hover-lift relative overflow-hidden"
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gradient-to-r from-luxury-orange-500 to-luxury-gold-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-luxury-orange-600 dark:group-hover:text-luxury-orange-400 transition-colors duration-300">
                  {course.name}
                </span>
              </div>
              <span className="text-sm bg-gradient-to-r from-luxury-orange-500/10 to-luxury-gold-500/10 text-luxury-orange-600 dark:text-luxury-orange-400 font-bold px-4 py-2 rounded-full border border-luxury-orange-500/20 shadow-sm group-hover:shadow-md transition-all duration-300">
                {course.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-luxury-navy-600/30 rounded-full h-4 overflow-hidden relative z-10">
              <motion.div
                className="bg-gradient-to-r from-luxury-orange-500 via-luxury-gold-500 to-luxury-orange-600 h-4 rounded-full shadow-sm relative"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
              >
                {/* Progress bar glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </motion.div>
  );
};

// Course Stats Component
const CourseStats = ({ stats }) => {
  const [counts, setCounts] = useState({
    enrolled: 0,
    completed: 0,
    ongoing: 0
  });

  useEffect(() => {
    const animateCounts = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounts({
          enrolled: Math.floor(stats.enrolled * progress),
          completed: Math.floor(stats.completed * progress),
          ongoing: Math.floor(stats.ongoing * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts(stats);
        }
      }, stepDuration);
    };

    animateCounts();
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-white/90 dark:bg-luxury-navy-800/90 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-8 backdrop-blur-md hover-lift group overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-sky-50/20 via-transparent to-luxury-emerald-50/20 dark:from-luxury-sky-900/10 dark:via-transparent dark:to-luxury-emerald-900/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-luxury-sky-500/20 to-luxury-sky-600/20 rounded-2xl border border-luxury-sky-500/30 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
          <BookOpen className="h-6 w-6 text-luxury-sky-600 dark:text-luxury-sky-400 group-hover:animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            إحصائيات الدورات
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            نظرة شاملة على دوراتك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group text-center p-6 bg-gradient-to-br from-luxury-sky-50/80 to-luxury-sky-100/80 dark:from-luxury-sky-900/20 dark:to-luxury-sky-800/20 rounded-2xl border border-luxury-sky-200/50 dark:border-luxury-sky-700/50 hover:border-luxury-sky-400/50 dark:hover:border-luxury-sky-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-luxury-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-sky-500/20 transition-colors duration-300 group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-luxury-sky-600 dark:text-luxury-sky-400 group-hover:animate-pulse" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-luxury-sky-600 to-luxury-sky-500 bg-clip-text text-transparent mb-2">
              {counts.enrolled}
            </div>
            <div className="text-sm text-luxury-sky-700 dark:text-luxury-sky-300 font-semibold">
              الدورات المسجلة
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group text-center p-6 bg-gradient-to-br from-luxury-emerald-50/80 to-luxury-emerald-100/80 dark:from-luxury-emerald-900/20 dark:to-luxury-emerald-800/20 rounded-2xl border border-luxury-emerald-200/50 dark:border-luxury-emerald-700/50 hover:border-luxury-emerald-400/50 dark:hover:border-luxury-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-luxury-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-emerald-500/20 transition-colors duration-300 group-hover:scale-110">
              <CheckCircle className="h-6 w-6 text-luxury-emerald-600 dark:text-luxury-emerald-400 group-hover:animate-pulse" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-luxury-emerald-600 to-luxury-emerald-500 bg-clip-text text-transparent mb-2">
              {counts.completed}
            </div>
            <div className="text-sm text-luxury-emerald-700 dark:text-luxury-emerald-300 font-semibold">
              الدورات المكتملة
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group text-center p-6 bg-gradient-to-br from-luxury-orange-50/80 to-luxury-orange-100/80 dark:from-luxury-orange-900/20 dark:to-luxury-orange-800/20 rounded-2xl border border-luxury-orange-200/50 dark:border-luxury-orange-700/50 hover:border-luxury-orange-400/50 dark:hover:border-luxury-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover-lift relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-luxury-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-luxury-orange-500/20 transition-colors duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-luxury-orange-600 dark:text-luxury-orange-400 group-hover:animate-pulse" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-luxury-orange-600 to-luxury-orange-500 bg-clip-text text-transparent mb-2">
              {counts.ongoing}
            </div>
            <div className="text-sm text-luxury-orange-700 dark:text-luxury-orange-300 font-semibold">
              الدورات الجارية
            </div>
          </div>
        </motion.div>
      </div>

      {stats.lastAccessed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 p-6 bg-gradient-to-r from-luxury-orange-50/50 to-luxury-gold-50/50 dark:from-luxury-orange-900/10 dark:to-luxury-gold-900/10 rounded-2xl border border-luxury-orange-200/30 dark:border-luxury-orange-700/30 hover:border-luxury-orange-400/50 dark:hover:border-luxury-orange-500/50 transition-all duration-300 hover-lift relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer-effect opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center relative z-10">
            <div className="p-2 bg-luxury-orange-500/10 rounded-xl ml-3 hover:bg-luxury-orange-500/20 transition-colors duration-300">
              <Play className="h-5 w-5 text-luxury-orange-600 dark:text-luxury-orange-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                آخر دورة تم الوصول إليها
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.lastAccessed.name} - {stats.lastAccessed.lastAccess}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </motion.div>
  );
};

// Performance Section Component
const PerformanceSection = ({ performance }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(performance.averageScore);
    }, 500);
    return () => clearTimeout(timer);
  }, [performance.averageScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-luxury-navy-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-luxury-navy-600/50 p-8 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-luxury-gold-500/10 to-luxury-gold-600/10 rounded-2xl border border-luxury-gold-500/20">
          <Trophy className="h-6 w-6 text-luxury-gold-600 dark:text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            الأداء الأكاديمي
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            نتائج الامتحانات والإنجازات
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group p-6 bg-gradient-to-br from-luxury-gold-50/80 to-luxury-gold-100/80 dark:from-luxury-gold-900/20 dark:to-luxury-gold-800/20 rounded-2xl border border-luxury-gold-200/50 dark:border-luxury-gold-700/50 hover:border-luxury-gold-400/50 dark:hover:border-luxury-gold-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-luxury-gold-700 dark:text-luxury-gold-300 font-semibold mb-2">
                متوسط الدرجات
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-luxury-gold-600 to-luxury-gold-500 bg-clip-text text-transparent">
                {animatedScore}%
              </div>
            </div>
            <div className="p-3 bg-luxury-gold-500/10 rounded-2xl group-hover:bg-luxury-gold-500/20 transition-colors duration-300">
              <BarChart3 className="h-8 w-8 text-luxury-gold-600 dark:text-luxury-gold-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group p-6 bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:border-green-400/50 dark:hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 dark:text-green-300 font-semibold mb-2">
                أفضل دورة
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {performance.bestCourse}
              </div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-colors duration-300">
              <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="w-2 h-2 bg-luxury-gold-500 rounded-full ml-2"></div>
          نتائج الامتحانات الأخيرة
        </h3>
        {performance.recentExams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-luxury-navy-700/30 rounded-2xl border border-gray-100 dark:border-luxury-navy-600/30 hover:border-luxury-gold-500/30 transition-all duration-300"
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ml-3 shadow-sm ${
                exam.score >= 80 ? 'bg-green-500' : 
                exam.score >= 60 ? 'bg-luxury-gold-500' : 'bg-red-500'
              }`} />
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-luxury-gold-600 dark:group-hover:text-luxury-gold-400 transition-colors duration-300">
                  {exam.course}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {exam.date}
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold border shadow-sm whitespace-nowrap ${
              exam.score >= 80 ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/30' :
              exam.score >= 60 ? 'bg-luxury-gold-100 text-luxury-gold-800 border-luxury-gold-200 dark:bg-luxury-gold-900/20 dark:text-luxury-gold-400 dark:border-luxury-gold-700/30' :
              'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/30'
            }`}>
              {exam.score}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Activity Section Component
const ActivitySection = ({ activity }) => {
  const [counts, setCounts] = useState({
    watchTime: 0,
    streak: 0
  });

  useEffect(() => {
    const animateCounts = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounts({
          watchTime: Math.floor(activity.watchTime * progress),
          streak: Math.floor(activity.streak * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts(activity);
        }
      }, stepDuration);
    };

    animateCounts();
  }, [activity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white dark:bg-luxury-navy-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-luxury-navy-600/50 p-8 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl border border-purple-500/20">
          <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            النشاط والتفاعل
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            إحصائيات نشاطك اليومي
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold mb-2">
                إجمالي وقت المشاهدة
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {counts.watchTime} ساعة
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors duration-300">
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="group p-6 bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50 hover:border-orange-400/50 dark:hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-700 dark:text-orange-300 font-semibold mb-2">
                سلسلة النشاط
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {counts.streak} يوم
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 transition-colors duration-300">
              <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="p-6 bg-gradient-to-r from-luxury-gold-50/50 to-luxury-gold-100/50 dark:from-luxury-gold-900/10 dark:to-luxury-gold-800/10 rounded-2xl border border-luxury-gold-200/30 dark:border-luxury-gold-700/30"
      >
        <div className="flex items-center">
          <div className="p-2 bg-luxury-gold-500/10 rounded-xl ml-3">
            <Calendar className="h-5 w-5 text-luxury-gold-600 dark:text-luxury-gold-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              آخر تسجيل دخول
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activity.lastLogin}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// قيم افتراضية عند عدم وجود بيانات (صفر / لا يوجد)
const emptyDashboardData = {
  overallProgress: 0,
  courseProgress: [],
  courseStats: {
    enrolled: 0,
    completed: 0,
    ongoing: 0,
    lastAccessed: null
  },
  performance: {
    averageScore: 0,
    bestCourse: "—",
    worstCourse: "—",
    recentExams: []
  },
  activity: {
    watchTime: 0,
    streak: 0,
    lastLogin: "—"
  }
};

// Main Student Dashboard Component
const StudentDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(emptyDashboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setDashboardData(emptyDashboardData);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/parent/student/${user._id}/comprehensive`).catch(() => null);
        if (res?.data?.success) {
          const d = res.data.data || res.data;
          const enrolled = d.enrolledCourses || user?.enrolledCourses || [];
          const courses = Array.isArray(enrolled) ? enrolled : [];
          const completed = courses.filter(c => c.completed || (c.progress >= 100));
          const overall = courses.length ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / courses.length) : 0;
          const courseProgress = courses.map((c, i) => ({
            id: c.course?._id || c._id || i,
            name: c.course?.title || c.courseName || c.name || 'دورة',
            progress: c.progress ?? 0
          }));
          const stats = d.statistics || {};
          setDashboardData({
            overallProgress: overall,
            courseProgress,
            courseStats: {
              enrolled: courses.length,
              completed: completed.length,
              ongoing: courses.length - completed.length,
              lastAccessed: d.lastAccessed || null
            },
            performance: {
              averageScore: stats.averageGrade ?? stats.averageScore ?? 0,
              bestCourse: stats.bestCourse || "—",
              worstCourse: stats.worstCourse || "—",
              recentExams: (d.examResults || []).slice(0, 5).map((e, i) => ({
                id: i,
                course: e.courseName || e.examTitle || "—",
                score: e.percentage ?? e.studentScore ?? 0,
                date: e.examDate || e.submittedAt || "—"
              }))
            },
            activity: {
              watchTime: stats.totalStudyTime ?? 0,
              streak: stats.streakDays ?? 0,
              lastLogin: stats.lastLogin || "—"
            }
          });
        } else {
          const enrolled = user?.enrolledCourses || [];
          const courses = Array.isArray(enrolled) ? enrolled : [];
          const completed = courses.filter(c => c.completed || (c.progress >= 100));
          const overall = courses.length ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / courses.length) : 0;
          setDashboardData({
            ...emptyDashboardData,
            overallProgress: overall,
            courseProgress: courses.map((c, i) => ({
              id: c.course?._id || c._id || i,
              name: c.course?.title || c.courseName || c.name || 'دورة',
              progress: c.progress ?? 0
            })),
            courseStats: {
              enrolled: courses.length,
              completed: completed.length,
              ongoing: courses.length - completed.length,
              lastAccessed: null
            }
          });
        }
      } catch {
        setDashboardData(emptyDashboardData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, user?.enrolledCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-luxury-navy-900 dark:via-luxury-navy-800 dark:to-luxury-navy-900 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-luxury-orange-400/10 to-luxury-gold-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-luxury-sky-400/10 to-luxury-emerald-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-luxury-emerald-400/10 to-luxury-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-luxury-orange-600 to-luxury-gold-600 dark:from-white dark:via-luxury-orange-400 dark:to-luxury-gold-400 bg-clip-text text-transparent mb-4 animate-gradient-shift bg-[length:200%_200%]">
                مرحباً، {user?.firstName} {user?.secondName}
              </h1>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-luxury-orange-500 to-luxury-gold-500 rounded-full animate-pulse" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              لوحة التحكم الخاصة بك - تابع تقدمك في التعلم واكتشف إنجازاتك
            </motion.p>
          </div>
          
          {/* Enhanced Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 bg-white/90 dark:bg-luxury-navy-800/90 rounded-2xl border border-gray-200/50 dark:border-luxury-navy-600/30 backdrop-blur-md shadow-lg hover:shadow-xl hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-orange-50/20 to-luxury-gold-50/20 dark:from-luxury-orange-900/10 dark:to-luxury-gold-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-2xl font-bold bg-gradient-to-r from-luxury-orange-600 to-luxury-gold-600 bg-clip-text text-transparent mb-1">
                  {dashboardData.overallProgress}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-luxury-orange-500" />
                  التقدم الإجمالي
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 bg-white/90 dark:bg-luxury-navy-800/90 rounded-2xl border border-gray-200/50 dark:border-luxury-navy-600/30 backdrop-blur-md shadow-lg hover:shadow-xl hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-sky-50/20 to-luxury-sky-50/20 dark:from-luxury-sky-900/10 dark:to-luxury-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-2xl font-bold bg-gradient-to-r from-luxury-sky-600 to-luxury-sky-500 bg-clip-text text-transparent mb-1">
                  {dashboardData.courseStats.enrolled}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                  <BookOpen className="h-4 w-4 text-luxury-sky-500" />
                  الدورات المسجلة
                </div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 bg-white/90 dark:bg-luxury-navy-800/90 rounded-2xl border border-gray-200/50 dark:border-luxury-navy-600/30 backdrop-blur-md shadow-lg hover:shadow-xl hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-emerald-50/20 to-luxury-emerald-50/20 dark:from-luxury-emerald-900/10 dark:to-luxury-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-2xl font-bold bg-gradient-to-r from-luxury-emerald-600 to-luxury-emerald-500 bg-clip-text text-transparent mb-1">
                  {dashboardData.performance.averageScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4 text-luxury-emerald-500" />
                  متوسط الدرجات
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Progress Overview - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ProgressOverview 
              overallProgress={dashboardData.overallProgress}
              courseProgress={dashboardData.courseProgress}
            />
          </div>

          {/* Course Stats */}
          <div>
            <CourseStats stats={dashboardData.courseStats} />
          </div>

          {/* Performance Section */}
          <div className="lg:col-span-2">
            <PerformanceSection performance={dashboardData.performance} />
          </div>

          {/* Activity Section */}
          <div>
            <ActivitySection activity={dashboardData.activity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
