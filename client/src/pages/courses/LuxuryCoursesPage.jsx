import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import GlobalLayout from '../../components/layout/GlobalLayout';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
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
  Lock
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// Skeleton loader component with shimmer effect
const CourseCardSkeleton = ({ theme }) => {
  const { colors, spacing, borderRadius, typography } = theme;
  
  return (
    <LuxuryCard 
      variant="default"
      className="course-card p-1"
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image skeleton */}
        <div style={{ 
          height: '200px', 
          background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
          marginBottom: spacing.md
        }} />
        
        {/* Content skeleton */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Title skeleton */}
          <div style={{
            height: '24px',
            background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: borderRadius.sm,
            marginBottom: spacing.sm,
            width: '80%'
          }} />
          
          {/* Description skeleton */}
          <div style={{
            height: '16px',
            background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: borderRadius.sm,
            marginBottom: spacing.sm,
            width: '100%'
          }} />
          <div style={{
            height: '16px',
            background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: borderRadius.sm,
            marginBottom: spacing.md,
            width: '60%'
          }} />
          
          {/* Meta skeleton */}
          <div style={{ 
            display: 'flex', 
            gap: spacing.md, 
            marginBottom: spacing.md 
          }}>
            <div style={{
              height: '16px',
              width: '60px',
              background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: borderRadius.sm
            }} />
            <div style={{
              height: '16px',
              width: '50px',
              background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: borderRadius.sm
            }} />
          </div>
          
          {/* Price and button skeleton */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <div style={{
              height: '20px',
              width: '80px',
              background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: borderRadius.sm
            }} />
            <div style={{
              height: '36px',
              width: '100px',
              background: `linear-gradient(90deg, ${colors.border} 25%, ${colors.surfaceCard} 50%, ${colors.border} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: borderRadius.md
            }} />
          </div>
        </div>
      </div>
    </LuxuryCard>
  );
};

const LuxuryCoursesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode, toggleTheme } = theme;
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
  
  // Add ref for request cancellation
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Only fetch courses if user is authenticated
    if (user) {
      fetchCourses();
    }
    
    // Cleanup function to cancel requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user]); // Add user as dependency


  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!user) {
        console.log('❌ User not authenticated, redirecting to login');
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }
      
      // Debug: Log authentication status
      console.log('🔐 Authentication status:', {
        hasUser: !!user,
        userId: user?._id,
        userRole: user?.role,
        hasToken: !!localStorage.getItem('token')
      });
      
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      // Optimized: Single endpoint with reduced timeout
      const response = await axiosInstance.get('/api/courses/with-enrollment-status', {
        timeout: 5000, // Reduced to 5 seconds
        signal: abortControllerRef.current.signal
      });
      
      if (response.data.success) {
        const coursesData = response.data.data.courses || [];
        
        // Add enrollment status if not present
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
      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      setError(error);
      
      // Show more specific error message
      if (error.code === 'ECONNABORTED') {
        showError('خطأ في الاتصال', 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      } else if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        showError('خطأ في الشبكة', 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else if (error.response?.status === 401) {
        // Try to refresh the user data first
        try {
          await refreshUser();
          // If refresh successful, try the request again
          setTimeout(() => {
            fetchCourses();
          }, 1000);
          return;
        } catch (refreshError) {
          console.log('Token refresh failed, redirecting to login');
          showError('خطأ في المصادقة', 'يرجى تسجيل الدخول مرة أخرى.');
          // Redirect to login after a short delay
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        }
      } else {
        showError('خطأ في تحميل الدورات', 'فشل في تحميل قائمة الدورات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (courseId) => {
    // Redirect to payment page instead of showing message
    navigate(`/payment/${courseId}`);
  };


  const getCourseStatus = (course) => {
    if (!course.enrollmentStatus) return 'not-enrolled';
    
    if (!course.enrollmentStatus.isEnrolled) return 'not-enrolled';
    
    return course.enrollmentStatus.paymentStatus;
  };

  const getCourseButtonText = (course) => {
    const status = getCourseStatus(course);
    
    switch (status) {
      case 'approved':
        return 'متابعة الدورة';
      case 'pending':
        return 'في الانتظار';
      case 'rejected':
        return 'إعادة الاشتراك';
      default:
        return 'اشتراك';
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
        return () => navigate(`/payment/${course._id}`);
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

  // Lazy loading hook for images
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
    const isSubscribing = subscribing === course._id;
    const courseImageSrc = getCourseCoverImage(course);
    const { imageSrc, isLoaded, imgRef, setIsLoaded } = useLazyImage(courseImageSrc);
    
    return (
      <LuxuryCard 
        variant={status === 'approved' ? 'accent' : 'default'}
        hover={true}
        className="course-card p-1"
        style={{ height: '100%' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Course Image with lazy loading */}
          <div style={{ 
            height: '200px', 
            background: colors.cardGradient,
            borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: spacing.md
          }}>
            {imageSrc && imageSrc !== getDefaultVideoThumbnail() ? (
              <img 
                ref={imgRef}
                src={imageSrc} 
                alt={course.title}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                onLoad={() => setIsLoaded(true)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              ref={imgRef}
              style={{ 
                display: imageSrc && imageSrc !== getDefaultVideoThumbnail() ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}
            >
              <BookOpen size={48} color={colors.textMuted} />
            </div>
            
            {/* Status Badge */}
            <div style={{
              position: 'absolute',
              top: spacing.sm,
              right: spacing.sm,
              background: status === 'approved' ? colors.success : 
                         status === 'pending' ? colors.warning : colors.surfaceCard,
              color: status === 'approved' ? colors.background : colors.text,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.full,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              backdropFilter: 'blur(10px)'
            }}>
              {status === 'approved' && <CheckCircle size={12} />}
              {status === 'pending' && <Clock size={12} />}
              {status === 'not-enrolled' && <Lock size={12} />}
              {status === 'approved' ? 'مسجل' : 
               status === 'pending' ? 'في الانتظار' : 'غير مسجل'}
            </div>
          </div>
          
          {/* Course Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              color: colors.text,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.sm,
              lineHeight: 1.3
            }}>
              {course.title}
            </h3>
            
            <p style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              margin: 0,
              marginBottom: spacing.md,
              lineHeight: 1.5,
              flex: 1
            }}>
              {course.description || 'لا يوجد وصف متاح'}
            </p>
            
            {/* Course Meta */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.md, 
              marginBottom: spacing.md,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Play size={14} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                  {course.videos?.length || 0} دروس
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Star size={14} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                  {course.grade || 'غير محدد'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <User size={14} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                  {course.subject || 'غير محدد'}
                </span>
              </div>
            </div>
            
            {/* Price and Action */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <span style={{ 
                  color: colors.accent, 
                  fontSize: typography.fontSize.lg, 
                  fontWeight: typography.fontWeight.bold 
                }}>
                  {course.price} جنيه
                </span>
              </div>
              
              {status === 'approved' ? (
                <LuxuryButton
                  variant="primary"
                  size="sm"
                  onClick={getCourseButtonAction(course)}
                >
                  <Play size={16} />
                  {getCourseButtonText(course)}
                </LuxuryButton>
              ) : status === 'pending' ? (
                <LuxuryButton
                  variant="secondary"
                  size="sm"
                  disabled={true}
                >
                  <Clock size={16} />
                  {getCourseButtonText(course)}
                </LuxuryButton>
              ) : status === 'rejected' ? (
                <LuxuryButton
                  variant="warning"
                  size="sm"
                  onClick={getCourseButtonAction(course)}
                >
                  <BookOpen size={16} />
                  {getCourseButtonText(course)}
                </LuxuryButton>
              ) : (
                <LuxuryButton
                  variant="primary"
                  size="sm"
                  onClick={getCourseButtonAction(course)}
                >
                  <BookOpen size={16} />
                  {getCourseButtonText(course)}
                </LuxuryButton>
              )}
            </div>
          </div>
        </div>
      </LuxuryCard>
    );
  };

  // Show loading state if user authentication is still being checked
  if (!user && !error) {
    return (
      <GlobalLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري التحقق من المصادقة...</p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  // Show authentication required message if no user
  if (!user) {
    return (
      <GlobalLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                مطلوب تسجيل الدخول
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                يجب عليك تسجيل الدخول أولاً للوصول إلى الدورات التعليمية
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            الدورات التعليمية
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            اكتشف مجموعة واسعة من الدورات التعليمية المتميزة
          </p>
        </div>

      {/* Filters and Search */}
      <LuxuryCard className="mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            />
            <input
              type="text"
              placeholder="البحث في الدورات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base outline-none min-w-[150px] focus:border-blue-500 transition-colors"
          >
            <option value="all">جميع المواد</option>
            <option value="لغة عربية">لغة عربية</option>
          </select>
          
          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base outline-none min-w-[120px] focus:border-blue-500 transition-colors"
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
          <div style={{ display: 'flex', gap: spacing.xs }}>
            <LuxuryButton
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </LuxuryButton>
            <LuxuryButton
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </LuxuryButton>
          </div>
        </div>
      </LuxuryCard>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fill, minmax(350px, 1fr))' 
            : '1fr',
          gap: spacing.lg
        }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeleton key={index} theme={theme} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${colors.error}20, ${colors.error}40)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.lg
          }}>
            <RefreshCw size={32} color={colors.error} />
          </div>
          <h3 style={{ 
            color: colors.text, 
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold
          }}>
            خطأ في تحميل الدورات
          </h3>
          <p style={{ 
            color: colors.textMuted, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.sm
          }}>
            {error.code === 'ECONNABORTED' 
              ? 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
              : error.message === 'Network Error' || error.code === 'NETWORK_ERROR'
              ? 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
              : error.response?.status === 401
              ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
              : 'فشل في تحميل قائمة الدورات. يرجى المحاولة مرة أخرى.'
            }
          </p>
          <LuxuryButton
            onClick={fetchCourses}
            variant="primary"
            size="md"
            style={{ marginTop: spacing.md }}
          >
            <RefreshCw size={16} style={{ marginLeft: spacing.xs }} />
            إعادة المحاولة
          </LuxuryButton>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}40)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing.lg
          }}>
            <BookOpen size={32} color={colors.accent} />
          </div>
          <h3 style={{ 
            color: colors.text, 
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold
          }}>
            لا توجد دورات متاحة
          </h3>
          <p style={{ 
            color: colors.textMuted, 
            marginBottom: spacing.lg,
            fontSize: typography.fontSize.sm
          }}>
            لم يتم العثور على أي دورات. يرجى المحاولة مرة أخرى.
          </p>
          <LuxuryButton
            onClick={fetchCourses}
            variant="primary"
            size="md"
            style={{ marginTop: spacing.md }}
          >
            <RefreshCw size={16} style={{ marginLeft: spacing.xs }} />
            إعادة المحاولة
          </LuxuryButton>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: viewMode === 'grid' 
            ? 'repeat(auto-fill, minmax(350px, 1fr))' 
            : '1fr',
          gap: spacing.lg
        }}>
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <LuxuryCard variant="glass" style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <BookOpen size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
          <h3 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
            لا توجد دورات
          </h3>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            {searchTerm || filterSubject !== 'all' || filterGrade !== 'all'
              ? 'لا توجد نتائج تطابق البحث أو الفلتر المحدد'
              : 'لم يتم العثور على أي دورات حتى الآن'
            }
          </p>
        </LuxuryCard>
      )}
      </div>
    </GlobalLayout>
  );
};

export default LuxuryCoursesPage;
