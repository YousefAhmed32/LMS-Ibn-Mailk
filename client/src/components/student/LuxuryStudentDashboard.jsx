import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../contexts/AuthContext';
import LuxuryCard from '../ui/LuxuryCard';
import LuxuryButton from '../ui/LuxuryButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Calendar,
  User,
  Settings,
  Bell
} from 'lucide-react';

const LuxuryStudentDashboard = () => {
  const navigate = useNavigate();
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0
  });

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Get user's enrolled courses
      const enrolledCourses = user.enrolledCourses || [];
      const allowedCourses = user.allowedCourses || [];
      
      // Combine and deduplicate courses
      const allCourses = [...enrolledCourses, ...allowedCourses];
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex(c => c._id === course._id)
      );
      
      setCourses(uniqueCourses);
      
      // Calculate stats
      const completedCourses = enrolledCourses.filter(course => 
        course.paymentStatus === 'approved'
      ).length;
      
      const inProgressCourses = enrolledCourses.filter(course => 
        course.paymentStatus === 'pending'
      ).length;
      
      setStats({
        totalCourses: uniqueCourses.length,
        completedCourses,
        inProgressCourses,
        totalLessons: uniqueCourses.reduce((total, course) => total + (course.videos?.length || 0), 0),
        completedLessons: 0 // This would come from progress tracking
      });
      
    } catch (error) {
      console.error('Error loading student data:', error);
      showError('خطأ في تحميل البيانات', 'فشل في تحميل معلومات الطالب');
    } finally {
      setLoading(false);
    }
  };

  const CourseCard = ({ course, isEnrolled = false, paymentStatus = 'approved' }) => (
    <LuxuryCard 
      variant={isEnrolled && paymentStatus === 'approved' ? 'accent' : 'default'}
      hover={true}
      style={{ marginBottom: spacing.lg }}
    >
      <div style={{ display: 'flex', gap: spacing.lg }}>
        {/* Course Image */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '120px',
            height: '80px',
            background: colors.cardGradient,
            borderRadius: borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${colors.border}`,
            overflow: 'hidden'
          }}>
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <BookOpen size={32} color={colors.textMuted} />
            )}
          </div>
        </div>
        
        {/* Course Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
            <h3 style={{
              color: colors.text,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              lineHeight: 1.3
            }}>
              {course.title}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              {isEnrolled && paymentStatus === 'approved' && (
                <div style={{
                  background: colors.success,
                  color: colors.background,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <CheckCircle size={12} />
                  مسجل
                </div>
              )}
              
              {isEnrolled && paymentStatus === 'pending' && (
                <div style={{
                  background: colors.warning,
                  color: colors.background,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.full,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <Clock size={12} />
                  في الانتظار
                </div>
              )}
            </div>
          </div>
          
          <p style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            margin: 0,
            marginBottom: spacing.sm,
            lineHeight: 1.5
          }}>
            {course.description || 'لا يوجد وصف متاح'}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
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
              <TrendingUp size={14} color={colors.textMuted} />
              <span style={{ color: colors.textMuted, fontSize: typography.fontSize.sm }}>
                {course.subject || 'غير محدد'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <span style={{ 
                color: colors.accent, 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.bold 
              }}>
                {course.price} جنيه
              </span>
            </div>
            
            {isEnrolled && paymentStatus === 'approved' ? (
              <LuxuryButton
                variant="primary"
                size="sm"
                onClick={() => navigate(`/courses/${course._id}/content`)}
              >
                <Play size={16} />
                بدء التعلم
              </LuxuryButton>
            ) : isEnrolled && paymentStatus === 'pending' ? (
              <LuxuryButton
                variant="secondary"
                size="sm"
                disabled={true}
              >
                <Clock size={16} />
                في انتظار الموافقة
              </LuxuryButton>
            ) : (
              <LuxuryButton
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                عرض التفاصيل
              </LuxuryButton>
            )}
          </div>
        </div>
      </div>
    </LuxuryCard>
  );

  const StatCard = ({ title, value, icon: Icon, color = colors.accent, trend = null }) => (
    <LuxuryCard variant="elevated">
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <div style={{
          background: color,
          color: colors.background,
          padding: spacing.md,
          borderRadius: borderRadius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={24} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            color: colors.text,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold
          }}>
            {value}
          </h3>
          <p style={{
            margin: 0,
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm
          }}>
            {title}
          </p>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.xs
            }}>
              <TrendingUp size={12} color={colors.success} />
              <span style={{
                color: colors.success,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium
              }}>
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </LuxuryCard>
  );

  return (
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
          <div>
            <h1 style={{
              color: colors.text,
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              fontFamily: typography.fontFamily.heading,
              margin: 0,
              marginBottom: spacing.sm,
              background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              مرحباً، {user?.firstName} {user?.secondName}
            </h1>
            <p style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.lg,
              margin: 0
            }}>
              لوحة التحكم الخاصة بك - تابع تقدمك في التعلم
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <LuxuryButton
              variant="ghost"
              size="md"
              onClick={refreshUser}
              disabled={loading}
            >
              <Settings size={16} />
              تحديث البيانات
            </LuxuryButton>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: spacing.lg,
        marginBottom: spacing['2xl']
      }}>
        <StatCard
          title="إجمالي الدورات"
          value={stats.totalCourses}
          icon={BookOpen}
          color={colors.accent}
        />
        
        <StatCard
          title="الدورات المكتملة"
          value={stats.completedCourses}
          icon={CheckCircle}
          color={colors.success}
        />
        
        <StatCard
          title="في الانتظار"
          value={stats.inProgressCourses}
          icon={Clock}
          color={colors.warning}
        />
        
        <StatCard
          title="إجمالي الدروس"
          value={stats.totalLessons}
          icon={Play}
          color={colors.info}
        />
      </div>

      {/* Courses Section */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <h2 style={{
            color: colors.text,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            margin: 0
          }}>
            دوراتي
          </h2>
          
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
          >
            عرض جميع الدورات
          </LuxuryButton>
        </div>
        
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
        ) : courses.length > 0 ? (
          <AnimatePresence>
            {courses.map((course) => {
              const enrollment = user.enrolledCourses?.find(e => e.courseId._id === course._id);
              const isEnrolled = !!enrollment;
              const paymentStatus = enrollment?.paymentStatus || 'approved';
              
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseCard 
                    course={course} 
                    isEnrolled={isEnrolled}
                    paymentStatus={paymentStatus}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <LuxuryCard variant="glass" style={{ textAlign: 'center', padding: spacing['2xl'] }}>
            <BookOpen size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
            <h3 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
              لا توجد دورات مسجلة
            </h3>
            <p style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.lg }}>
              ابدأ رحلتك التعليمية بتسجيل في إحدى الدورات المتاحة
            </p>
            <LuxuryButton
              variant="primary"
              onClick={() => navigate('/courses')}
            >
              تصفح الدورات
            </LuxuryButton>
          </LuxuryCard>
        )}
      </div>

      {/* Recent Activity */}
      <LuxuryCard variant="elevated">
        <h3 style={{
          color: colors.text,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          margin: 0,
          marginBottom: spacing.lg
        }}>
          النشاط الأخير
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: spacing.md, background: colors.surface, borderRadius: borderRadius.lg, marginBottom: spacing.md }}>
          <div style={{
            background: colors.accent,
            color: colors.background,
            padding: spacing.sm,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, color: colors.text, fontSize: typography.fontSize.sm }}>
              مرحباً بك في منصة التعلم الإلكتروني
            </p>
            <p style={{ margin: 0, color: colors.textMuted, fontSize: typography.fontSize.xs }}>
              {new Date().toLocaleDateString('ar-EG')}
            </p>
          </div>
        </div>
        
        {user.enrolledCourses?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: spacing.md, background: colors.surface, borderRadius: borderRadius.lg }}>
            <div style={{
              background: colors.success,
              color: colors.background,
              padding: spacing.sm,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: colors.text, fontSize: typography.fontSize.sm }}>
                تم تسجيلك في {user.enrolledCourses.length} دورة
              </p>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: typography.fontSize.xs }}>
                {new Date().toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>
        )}
      </LuxuryCard>
    </div>
  );
};

export default LuxuryStudentDashboard;
