import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import GlobalLayout from '../../components/layout/GlobalLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseCoverImage, getDefaultVideoThumbnail } from '../../utils/videoUtils';
import {
  BookOpen, 
  Play, 
  Clock, 
  Star,
  User,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Lock,
  Sparkles,
  Award,
  TrendingUp,
  Eye
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// Skeleton loader component with shimmer effect
const CourseCardSkeleton = () => {
  return (
    <div className="group relative bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl overflow-hidden border border-cyan-200/50 dark:border-cyan-700/30 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col h-full">
        {/* Image skeleton */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-800/40 dark:via-blue-800/40 dark:to-purple-800/40 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
               style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {/* Title */}
          <div className="h-6 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 dark:from-cyan-700/40 dark:via-blue-700/40 dark:to-purple-700/40 rounded-lg w-3/4 animate-pulse" />
          
          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 rounded w-full animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-800/30 dark:via-blue-800/30 dark:to-purple-800/30 rounded w-2/3 animate-pulse" />
          </div>
          
          {/* Meta info */}
          <div className="flex gap-4 pt-2">
            <div className="h-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 dark:from-cyan-700/40 dark:via-blue-700/40 dark:to-purple-700/40 rounded w-20 animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 dark:from-cyan-700/40 dark:via-blue-700/40 dark:to-purple-700/40 rounded w-16 animate-pulse" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-12 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 dark:from-cyan-700/40 dark:via-blue-700/40 dark:to-purple-700/40 rounded-xl w-full mt-4 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const LuxuryCoursesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [subscribing, setSubscribing] = useState(null);
  
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await axiosInstance.get('/api/courses/with-enrollment-status', {
        timeout: 5000,
        signal: abortControllerRef.current.signal
      });
      
      if (response.data.success) {
        const coursesData = response.data.data.courses || [];
        
        const coursesWithStatus = coursesData.map(course => ({
          ...course,
          enrollmentStatus: course.enrollmentStatus || {
            isEnrolled: false,
            enrollmentDate: null,
            progress: 0
          }
        }));
        
        setCourses(coursesWithStatus);
        setError(null);
      } else {
        throw new Error(response.data.error || 'Failed to fetch courses');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      setError(error);
      
      if (error.code === 'ECONNABORTED') {
        showError('خطأ في الاتصال', 'انتهت مهلة الاتصال بالخادم');
      } else if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        showError('خطأ في الشبكة', 'فشل في الاتصال بالخادم');
      } else if (error.response?.status === 401) {
        try {
          await refreshUser();
          setTimeout(() => fetchCourses(), 1000);
          return;
        } catch (refreshError) {
          showError('خطأ في المصادقة', 'يرجى تسجيل الدخول مرة أخرى');
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        }
      } else {
        showError('خطأ في تحميل الدورات', 'فشل في تحميل قائمة الدورات');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCourseStatus = (course) => {
    if (!course.enrollmentStatus) return 'not-enrolled';
    if (!course.enrollmentStatus.isEnrolled) return 'not-enrolled';
    return course.enrollmentStatus.paymentStatus;
  };

  const getCourseButtonText = (course) => {
    const status = getCourseStatus(course);
    
    switch (status) {
      case 'approved': return 'متابعة الدورة';
      case 'pending': return 'في الانتظار';
      case 'rejected': return 'إعادة الاشتراك';
      default: return 'اشتراك';
    }
  };

  const getCourseButtonAction = (course) => {
    const status = getCourseStatus(course);
    
    switch (status) {
      case 'approved':
        return () => navigate(`/courses/${course._id}/content`);
      case 'pending':
        return () => showInfo('في الانتظار', 'طلبك قيد المراجعة من قبل الإدارة');
      case 'rejected':
      default:
        return () => navigate(`/payment/${course._id}`);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || course.subject === filterSubject;
    const matchesGrade = filterGrade === 'all' || course.grade === filterGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const useLazyImage = (src) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [src]);

    return { imageSrc, isLoaded, imgRef, setIsLoaded };
  };

  const CourseCard = ({ course }) => {
    const status = getCourseStatus(course);
    const courseImageSrc = getCourseCoverImage(course);
    const { imageSrc, isLoaded, imgRef, setIsLoaded } = useLazyImage(courseImageSrc);
    
    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl overflow-hidden border border-cyan-200/50 dark:border-cyan-700/30 backdrop-blur-xl shadow-xl hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all duration-500"
      >
        {/* Luxury shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
        
        <div className="flex flex-col h-full relative z-10">
          {/* Course Image */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 dark:from-cyan-800/40 dark:via-blue-800/40 dark:to-purple-800/40 overflow-hidden">
            {imageSrc && imageSrc !== getDefaultVideoThumbnail() ? (
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt={course.title}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
                onLoad={() => setIsLoaded(true)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              ref={imgRef}
              className={`${imageSrc && imageSrc !== getDefaultVideoThumbnail() ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20`}
            >
              <BookOpen className="w-16 h-16 text-cyan-400 dark:text-cyan-300 drop-shadow-lg" />
            </div>
            
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-xl border font-bold text-sm shadow-lg flex items-center gap-2 ${
              status === 'approved' 
                ? 'bg-emerald-500/90 border-emerald-300/50 text-white' 
                : status === 'pending'
                ? 'bg-amber-500/90 border-amber-300/50 text-white'
                : 'bg-gray-500/90 border-gray-300/50 text-white'
            }`}>
              {status === 'approved' && <CheckCircle className="w-4 h-4" />}
              {status === 'pending' && <Clock className="w-4 h-4" />}
              {status === 'not-enrolled' && <Lock className="w-4 h-4" />}
              {status === 'approved' ? 'مسجل' : status === 'pending' ? 'قيد المراجعة' : 'غير مسجل'}
            </div>

            {/* Decorative gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-900/60 via-blue-900/40 to-transparent" />
          </div>
          
          {/* Course Info */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Title */}
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2 bg-gradient-to-r from-cyan-700 via-blue-700 to-purple-700 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              {course.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
              {course.description || 'لا يوجد وصف متاح'}
            </p>
            
            {/* Course Meta */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Play className="w-4 h-4" />
                <span className="text-sm font-bold">{course.videos?.length || 0} دروس</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-bold">{course.grade || 'غير محدد'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <User className="w-4 h-4" />
                <span className="text-sm font-bold">{course.subject || 'غير محدد'}</span>
              </div>
            </div>
            
            {/* Price and Action */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-cyan-200/50 dark:border-cyan-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {course.price}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">جنيه</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {/* Preview Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/courses/${course._id}/preview`);
                  }}
                  className="group/preview flex-1 relative px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-200 hover:shadow-xl border border-gray-300/50 dark:border-gray-600/50"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة</span>
                </motion.button>
                
                {/* Subscribe/View Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={getCourseButtonAction(course)}
                  disabled={status === 'pending'}
                  className={`group/btn flex-1 relative px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                    status === 'approved'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                      : status === 'pending'
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  
                  <div className="relative z-10 flex items-center gap-2">
                    {status === 'approved' ? <Play className="w-4 h-4" /> : 
                     status === 'pending' ? <Clock className="w-4 h-4" /> : 
                     <BookOpen className="w-4 h-4" />}
                    <span className="text-xs">{getCourseButtonText(course)}</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user && !error) {
    return (
      <GlobalLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/50 dark:from-slate-900 dark:via-cyan-900/30 dark:to-blue-900/40 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">جاري التحقق من المصادقة...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  if (!user) {
    return (
      <GlobalLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/50 dark:from-slate-900 dark:via-cyan-900/30 dark:to-blue-900/40 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-cyan-200/50 dark:border-cyan-700/30"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-cyan-700 via-blue-700 to-purple-700 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              مطلوب تسجيل الدخول
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg ">
              يجب عليك تسجيل الدخول أولاً للوصول إلى الدورات التعليمية
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
            >
              تسجيل الدخول
            </motion.button>
          </motion.div>
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/50 dark:from-slate-900 dark:via-cyan-900/30 dark:to-blue-900/40 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 dark:opacity-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-20 dark:opacity-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-15 dark:opacity-8 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-pulse" />
              <h1 className="text-4xl p-6 sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-700 via-blue-700 to-purple-700 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                الدورات التعليمية
              </h1>
              <Award className="w-8 h-8 text-purple-500 dark:text-purple-400 animate-pulse" />
            </div>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              اكتشف مجموعة واسعة من الدورات التعليمية المتميزة وابدأ رحلتك نحو التميز الأكاديمي
            </p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-cyan-200/50 dark:border-cyan-700/30"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500 dark:text-cyan-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في الدورات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-cyan-300/50 dark:border-cyan-600/30 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-base outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors backdrop-blur-sm"
                />
              </div>
              
              {/* Subject Filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-3 border-2 border-cyan-300/50 dark:border-cyan-600/30 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-base outline-none min-w-[150px] focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors backdrop-blur-sm font-bold"
              >
                <option value="all">جميع المواد</option>
                <option value="لغة عربية">لغة عربية</option>
              </select>
              
              {/* Grade Filter */}
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-3 border-2 border-cyan-300/50 dark:border-cyan-600/30 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-base outline-none min-w-[120px] focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors backdrop-blur-sm font-bold"
              >
                <option value="all">جميع الصفوف</option>
                <option value="7">أولي إعدادي</option>
                <option value="8">ثاني إعدادي</option>
                <option value="9">ثالث إعدادي</option>
                <option value="10">أولي ثانوي</option>
                <option value="11">ثاني ثانوي</option>
                <option value="12">ثالث ثانوي</option>
              </select>
              
              {/* View Mode */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Courses Grid */}
          {loading ? (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-cyan-200/50 dark:border-cyan-700/30"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                خطأ في تحميل الدورات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {error.code === 'ECONNABORTED' 
                  ? 'انتهت مهلة الاتصال بالخادم'
                  : error.message === 'Network Error' || error.code === 'NETWORK_ERROR'
                  ? 'فشل في الاتصال بالخادم'
                  : error.response?.status === 401
                  ? 'انتهت صلاحية الجلسة'
                  : 'فشل في تحميل قائمة الدورات'
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCourses}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                إعادة المحاولة
              </motion.button>
            </motion.div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-cyan-200/50 dark:border-cyan-700/30"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                لا توجد دورات متاحة
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                لم يتم العثور على أي دورات. يرجى المحاولة مرة أخرى.
              </p>
            </motion.div>
          ) : filteredCourses.length > 0 ? (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              <AnimatePresence>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-cyan-200/50 dark:border-cyan-700/30"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                لا توجد نتائج
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لا توجد نتائج تطابق البحث أو الفلتر المحدد
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </GlobalLayout>
  );
};

export default LuxuryCoursesPage;