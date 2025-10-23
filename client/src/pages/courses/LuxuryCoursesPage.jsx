import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchCourses();
  }, []);


  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Fetching courses...');
      console.log('🔐 Auth state:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      let response;
      
      // Try the new endpoint first with timeout
      try {
        console.log('🔄 Trying /api/courses/with-enrollment-status...');
        response = await axiosInstance.get('/api/courses/with-enrollment-status', {
          timeout: 10000 // 10 seconds timeout
        });
        console.log('✅ Courses API response:', response.data);
      } catch (endpointError) {
        console.warn('⚠️ New endpoint failed, trying fallback...', endpointError.message);
        
        // Fallback to regular courses endpoint
        console.log('🔄 Trying fallback /api/courses...');
        response = await axiosInstance.get('/api/courses', {
          timeout: 15000 // 15 seconds timeout
        });
        console.log('✅ Fallback API response:', response.data);
      }
      
      if (response.data.success) {
        const coursesData = response.data.data.courses || response.data.data || [];
        
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
        console.log('📚 Courses loaded:', coursesWithStatus.length);
        console.log('📊 Enrollment summary:', {
          total: coursesWithStatus.length,
          enrolled: coursesWithStatus.filter(c => c.enrollmentStatus.isEnrolled).length
        });
      } else {
        throw new Error(response.data.error || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      setError(error);
      
      // Show more specific error message
      if (error.code === 'ECONNABORTED') {
        showError('خطأ في الاتصال', 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      } else if (error.response?.status === 401) {
        showError('خطأ في المصادقة', 'يرجى تسجيل الدخول مرة أخرى.');
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

  const CourseCard = ({ course }) => {
    const status = getCourseStatus(course);
    const isSubscribing = subscribing === course._id;
    
    return (
      <LuxuryCard 
        variant={status === 'approved' ? 'accent' : 'default'}
        hover={true}
        className="course-card p-1"
        style={{ height: '100%' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Course Image */}
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
            {getCourseCoverImage(course) !== getDefaultVideoThumbnail() ? (
              <img 
                src={getCourseCoverImage(course)} 
                alt={course.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              style={{ 
                display: getCourseCoverImage(course) !== getDefaultVideoThumbnail() ? 'none' : 'flex',
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

  return (
    <GlobalLayout>
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
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.textMuted, marginTop: spacing.md }}>
            جاري تحميل الدورات...
          </p>
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
