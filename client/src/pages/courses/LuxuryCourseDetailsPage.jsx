import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  CheckCircle,
  Lock,
  Download,
  Share2,
  Heart,
  MessageCircle,
  BarChart3,
  Award,
  Calendar,
  Globe,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const LuxuryCourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode, toggleTheme, animations } = theme;
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('[data-mobile-menu]')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // First, get all courses with enrollment status
      const coursesResponse = await axiosInstance.get('/api/courses/with-enrollment-status');
      
      if (coursesResponse.data.success) {
        const courses = coursesResponse.data.data.courses || [];
        const courseData = courses.find(c => c._id === id);
        
        if (courseData) {
          // Check if course is active
          if (courseData.isActive === false) {
            showError('الدورة غير متاحة', 'هذه الدورة غير مفعلة حالياً');
            navigate('/courses');
            return;
          }
          setCourse(courseData);
        } else {
          // Fallback to individual course endpoint if not found in the list
          const response = await axiosInstance.get(`/api/courses/${id}`);
          
          if (response.data.success) {
            const courseData = response.data.course || response.data.data;
            if (courseData) {
              // Add default enrollment status
              courseData.enrollmentStatus = {
                isEnrolled: false,
                paymentStatus: null,
                enrolledAt: null,
                progress: 0,
                completed: false,
                paymentApprovedAt: null
              };
              setCourse(courseData);
            } else {
              throw new Error('Course data not found in response');
            }
          } else {
            throw new Error(response.data.error || 'Failed to fetch course details');
          }
        }
      } else {
        throw new Error(coursesResponse.data.error || 'Failed to fetch courses with enrollment status');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      
      if (error.response?.status === 404) {
        showError('الدورة غير موجودة', 'لم يتم العثور على الدورة المطلوبة');
      } else if (error.response?.status === 400) {
        showError('معرف الدورة غير صحيح', 'يرجى التحقق من رابط الدورة');
      } else {
        showError('خطأ في تحميل تفاصيل الدورة', 'فشل في تحميل معلومات الدورة');
      }
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    // Redirect to payment page instead of showing message
    navigate(`/payment/${id}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCourseStatus = () => {
    if (!course?.enrollmentStatus) return 'not-enrolled';
    
    if (!course.enrollmentStatus.isEnrolled) return 'not-enrolled';
    
    return course.enrollmentStatus.paymentStatus || 'pending';
  };

  const status = getCourseStatus();
  const hasAccess = status === 'approved';

  if (loading) {
    return (
      <GlobalLayout>
        <div style={{ 
          minHeight: '100vh', 
          background: colors.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              width: '60px',
              height: '60px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: colors.textMuted, marginTop: spacing.lg }}>
              جاري تحميل تفاصيل الدورة...
            </p>
          </div>
        </div>
      </GlobalLayout>
    );
  }

  if (!course) {
    return (
      <GlobalLayout>
        <div style={{ 
          minHeight: '100vh', 
          background: colors.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LuxuryCard variant="glass" style={{ textAlign: 'center', padding: spacing['2xl'] }}>
            <BookOpen size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
            <h3 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
              الدورة غير موجودة
            </h3>
            <p style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.lg }}>
              لم يتم العثور على الدورة المطلوبة
            </p>
            <LuxuryButton
              variant="primary"
              onClick={() => navigate('/courses')}
            >
              العودة للدورات
            </LuxuryButton>
          </LuxuryCard>
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout>
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradient,
        padding: spacing.xl
      }}>
        {/* Back Button */}
        <div style={{ marginBottom: spacing.lg }}>
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft size={16} />
            العودة للدورات
          </LuxuryButton>
        </div>
        
        <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'flex-start' }}>
          {/* Course Image */}
          <div style={{ 
            width: '300px', 
            height: '200px', 
            background: colors.cardGradient,
            borderRadius: borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {getCourseCoverImage(course) !== getDefaultVideoThumbnail() ? (
              <img 
                src={getCourseCoverImage(course)} 
                alt={course?.title || 'Course'}
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
              <BookOpen size={64} color={colors.textMuted} />
            </div>
          </div>
          
          {/* Course Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <h1 style={{
                color: colors.text,
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                fontFamily: typography.fontFamily.heading,
                margin: 0,
                lineHeight: 1.2
              }}>
                {course?.title || 'Untitled Course'}
              </h1>
              
              {/* Status Badge */}
              <div style={{
                background: status === 'approved' ? colors.success : 
                           status === 'pending' ? colors.warning : colors.surfaceCard,
                color: status === 'approved' ? colors.background : colors.text,
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                backdropFilter: 'blur(10px)'
              }}>
                {status === 'approved' && <CheckCircle size={16} />}
                {status === 'pending' && <Clock size={16} />}
                {status === 'not-enrolled' && <Lock size={16} />}
                {status === 'approved' ? 'مسجل' : 
                 status === 'pending' ? 'في الانتظار' : 'غير مسجل'}
              </div>
            </div>
            
            <p style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.lg,
              margin: 0,
              marginBottom: spacing.lg,
              lineHeight: 1.6
            }}>
              {course?.description || 'لا يوجد وصف متاح'}
            </p>
            
            {/* Course Meta */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.lg, 
              marginBottom: spacing.lg,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Play size={16} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.base }}>
                  {course?.videos?.length || 0} دروس
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Clock size={16} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.base }}>
                  {course?.duration || 'غير محدد'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <Star size={16} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.base }}>
                  {course?.grade || 'غير محدد'}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <User size={16} color={colors.textMuted} />
                <span style={{ color: colors.textMuted, fontSize: typography.fontSize.base }}>
                  {course?.subject || 'غير محدد'}
                </span>
              </div>
            </div>
            
            {/* Price and Action */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.lg,
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <span style={{ 
                  color: colors.accent, 
                  fontSize: typography.fontSize['2xl'], 
                  fontWeight: typography.fontWeight.bold 
                }}>
                  {course?.price || 0} جنيه
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: spacing.sm }}>
                {hasAccess ? (
                  <LuxuryButton
                    variant="primary"
                    size="lg"
                    onClick={() => navigate(`/courses/${id}/content`)}
                  >
                    <Play size={20} />
                    متابعة الدورة
                  </LuxuryButton>
                ) : status === 'pending' ? (
                  <LuxuryButton
                    variant="secondary"
                    size="lg"
                    disabled={true}
                  >
                    <Clock size={20} />
                    في انتظار الموافقة
                  </LuxuryButton>
                ) : (
                  <LuxuryButton
                    variant="primary"
                    size="lg"
                    onClick={handleSubscribe}
                  >
                    <BookOpen size={20} />
                    اشتراك في الدورة
                  </LuxuryButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: spacing.lg }}>
        <div style={{ 
          display: 'flex', 
          gap: spacing.sm,
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: spacing.lg
        }}>
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BookOpen },
            { id: 'curriculum', label: 'المنهج', icon: Play },
            { id: 'instructor', label: 'المدرب', icon: User },
            { id: 'reviews', label: 'التقييمات', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? colors.accent : colors.textSecondary,
                  padding: `${spacing.md} ${spacing.lg}`,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  transition: `all ${animations.duration.fast} cubic-bezier(${animations.easing.easeInOut.join(', ')})`
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <LuxuryCard>
              <h3 style={{
                color: colors.text,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg
              }}>
                نظرة عامة على الدورة
              </h3>
              
              <div style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.base,
                lineHeight: 1.8,
                marginBottom: spacing.lg
              }}>
                {course?.description || 'لا يوجد وصف مفصل متاح لهذه الدورة.'}
              </div>
              
              <h4 style={{
                color: colors.text,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                margin: 0,
                marginBottom: spacing.md
              }}>
                ما سوف تتعلمه
              </h4>
              
              <ul style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.base,
                lineHeight: 1.8,
                paddingLeft: spacing.lg
              }}>
                <li>فهم المفاهيم الأساسية للموضوع</li>
                <li>تطبيق المعرفة في مشاريع عملية</li>
                <li>حل المشاكل المعقدة بطرق منهجية</li>
                <li>تطوير المهارات العملية المطلوبة</li>
              </ul>
            </LuxuryCard>
          )}

          {activeTab === 'curriculum' && (
            <LuxuryCard>
              <h3 style={{
                color: colors.text,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg
              }}>
                منهج الدورة
              </h3>
              
              {course?.videos && course.videos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  {course.videos.map((video, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        background: colors.surface,
                        borderRadius: borderRadius.lg,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: hasAccess ? colors.accent : colors.textMuted,
                        borderRadius: borderRadius.full,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: hasAccess ? colors.background : colors.text,
                        flexShrink: 0
                      }}>
                        {hasAccess ? <Play size={16} /> : <Lock size={16} />}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          color: colors.text,
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.medium,
                          margin: 0,
                          marginBottom: spacing.xs
                        }}>
                          {video.title || `الدرس ${index + 1}`}
                        </h4>
                        <p style={{
                          color: colors.textMuted,
                          fontSize: typography.fontSize.sm,
                          margin: 0
                        }}>
                          {video.duration || 'غير محدد'}
                        </p>
                      </div>
                      
                      {hasAccess && (
                        <LuxuryButton
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/courses/${id}/content?video=${index}`)}
                        >
                          <ChevronRight size={16} />
                        </LuxuryButton>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted, textAlign: 'center', padding: spacing.lg }}>
                  لا توجد دروس متاحة حالياً
                </p>
              )}
            </LuxuryCard>
          )}

          {activeTab === 'instructor' && (
            <LuxuryCard>
              <h3 style={{
                color: colors.text,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg
              }}>
                معلومات المدرب
              </h3>
              
              <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'flex-start' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: colors.accent,
                  borderRadius: borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.background,
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  flexShrink: 0
                }}>
                  {course?.instructor?.name?.charAt(0) || 'م'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: colors.text,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    margin: 0,
                    marginBottom: spacing.sm
                  }}>
                    {course?.instructor?.name || 'مدرب محترف'}
                  </h4>
                  
                  <p style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.base,
                    lineHeight: 1.6,
                    margin: 0,
                    marginBottom: spacing.md
                  }}>
                    {course?.instructor?.bio || 'مدرب محترف مع خبرة واسعة في مجال التعليم والتطوير.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <Award size={16} color={colors.textMuted} />
                      <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                        {course?.instructor?.experience || '5+'} سنوات خبرة
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <BookOpen size={16} color={colors.textMuted} />
                      <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                        {course?.instructor?.courses || '10+'} دورات
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </LuxuryCard>
          )}

          {activeTab === 'reviews' && (
            <LuxuryCard>
              <h3 style={{
                color: colors.text,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg
              }}>
                تقييمات الطلاب
              </h3>
              
              <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
                <Star size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
                <p style={{ color: colors.textMuted, margin: 0 }}>
                  لا توجد تقييمات متاحة حالياً
                </p>
              </div>
            </LuxuryCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </GlobalLayout>
  );
};

export default LuxuryCourseDetailsPage;
