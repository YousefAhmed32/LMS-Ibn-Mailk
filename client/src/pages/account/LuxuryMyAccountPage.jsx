import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Settings,
  ShoppingBag,
  MapPin,
  Bell,
  Shield,
  CreditCard,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  Star,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Copy,
  Clipboard
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const LuxuryMyAccountPage = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  const { user, updateUser, refreshUser } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  // Add CSS for spinner animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    userEmail: '',
    phoneStudent: '',
    guardianPhone: '',
    governorate: '',
    grade: ''
  });
  
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        thirdName: user.thirdName || '',
        fourthName: user.fourthName || '',
        userEmail: user.userEmail || '',
        phoneStudent: user.phoneStudent || '',
        guardianPhone: user.guardianPhone || '',
        governorate: user.governorate || '',
        grade: user.grade || ''
      });
    }
  }, [user]);

  // Fetch enrollments with course details
  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const response = await axiosInstance.get('/api/student/enrollments');
      
      if (response.data.success) {
        setEnrollments(response.data.enrollments || []);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      showError('خطأ في جلب البيانات', 'فشل في تحميل طلباتك');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Fetch enrollments when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchEnrollments();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.put('/api/auth/update', formData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setEditing(false);
        showSuccess('تم تحديث الملف الشخصي', 'تم حفظ التغييرات بنجاح');
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('خطأ في التحديث', error.response?.data?.error || 'فشل في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user.firstName || '',
      secondName: user.secondName || '',
      thirdName: user.thirdName || '',
      fourthName: user.fourthName || '',
      userEmail: user.userEmail || '',
      phoneStudent: user.phoneStudent || '',
      guardianPhone: user.guardianPhone || '',
      governorate: user.governorate || '',
      grade: user.grade || ''
    });
    setEditing(false);
  };

  // Copy Student ID function
  const copyStudentId = async (studentId) => {
    try {
      console.log('Copying Student ID:', studentId);
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(studentId);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = studentId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Success notification
      showSuccess('تم نسخ معرف الطالب', `تم نسخ معرف الطالب: ${studentId}`);
    } catch (error) {
      console.error('Failed to copy student ID:', error);
      showError('خطأ في النسخ', 'فشل في نسخ معرف الطالب');
    }
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: User },
    { id: 'orders', label: 'طلباتي', icon: ShoppingBag },
    { id: 'address', label: 'العنوان', icon: MapPin },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  const ProfileTab = () => (
    <LuxuryCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <h3 style={{
          color: colors.text,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          margin: 0
        }}>
          الملف الشخصي
        </h3>
        
        {!editing ? (
          <LuxuryButton
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Edit size={16} />
            تعديل
          </LuxuryButton>
        ) : (
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <LuxuryButton
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X size={16} />
              إلغاء
            </LuxuryButton>
            <LuxuryButton
              variant="primary"
              size="sm"
              onClick={handleSaveProfile}
              loading={loading}
            >
              <Save size={16} />
              حفظ
            </LuxuryButton>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'flex-start' }}>
        {/* Profile Picture */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: colors.accent,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.background,
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            position: 'relative',
            marginBottom: spacing.md
          }}>
            {user?.firstName?.charAt(0) || 'U'}
            {editing && (
              <button
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '32px',
                  height: '32px',
                  background: colors.surface,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.full,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: colors.text
                }}
              >
                <Camera size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: spacing.lg 
          }}>
            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <User size={16} color={colors.accent} />
                  الاسم الأول
                </div>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  transition: `border-color ${theme.animations.duration.fast} ${theme.animations.easing.easeInOut}`
                }}
                onFocus={(e) => editing && (e.target.style.borderColor = colors.accent)}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                الاسم الثاني
              </label>
              <input
                type="text"
                name="secondName"
                value={formData.secondName}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                الاسم الثالث
              </label>
              <input
                type="text"
                name="thirdName"
                value={formData.thirdName}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                الاسم الرابع
              </label>
              <input
                type="text"
                name="fourthName"
                value={formData.fourthName}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <Mail size={16} color={colors.warning} />
                  البريد الإلكتروني
                </div>
              </label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              />
            </div>

            {/* Student ID Field - Only for students */}
            {user?.role === 'student' && user?._id && (
              <div>
                <label style={{
                  display: 'block',
                  color: colors.text,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  marginBottom: spacing.xs
                }}>
                  معرف الطالب
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm
                }}>
                  <input
                    type="text"
                    value={user._id}
                    disabled
                    style={{
                      flex: 1,
                      padding: spacing.md,
                      border: `2px solid ${colors.border}`,
                      borderRadius: borderRadius.lg,
                      background: colors.background,
                      color: colors.text,
                      fontSize: typography.fontSize.base,
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                  <LuxuryButton
                    variant="secondary"
                    size="sm"
                    onClick={() => copyStudentId(user._id)}
                    style={{
                      minWidth: 'auto',
                      padding: spacing.md
                    }}
                  >
                    <Clipboard size={16} />
                  </LuxuryButton>
                </div>
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <Phone size={16} color={colors.accent} />
                  رقم هاتف الطالب
                </div>
              </label>
              <input
                type="tel"
                name="phoneStudent"
                value={formData.phoneStudent}
                onChange={handleInputChange}
                disabled={!editing}
                placeholder="+201234567890"
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              />
            </div>

            {/* Guardian Phone Field - Only for students */}
            {user?.role === 'student' && (
              <div>
                <label style={{
                  display: 'block',
                  color: colors.text,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  marginBottom: spacing.xs
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <Phone size={16} color={colors.success} />
                    رقم هاتف ولي الأمر
                  </div>
                </label>
                <input
                  type="tel"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="+201234567890"
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    border: `2px solid ${colors.border}`,
                    borderRadius: borderRadius.lg,
                    background: editing ? colors.surface : colors.background,
                    color: colors.text,
                    fontSize: typography.fontSize.base,
                    outline: 'none'
                  }}
                />
                {!formData.guardianPhone && !editing && (
                  <p style={{
                    color: colors.textMuted,
                    fontSize: typography.fontSize.xs,
                    margin: `${spacing.xs} 0 0 0`,
                    fontStyle: 'italic'
                  }}>
                    غير محدد
                  </p>
                )}
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <MapPin size={16} color={colors.error} />
                  المحافظة
                </div>
              </label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              >
                <option value="">اختر المحافظة</option>
                <option value="Cairo">القاهرة</option>
                <option value="Giza">الجيزة</option>
                <option value="Alexandria">الإسكندرية</option>
                <option value="Sharqia">الشرقية</option>
                <option value="Gharbia">الغربية</option>
                <option value="Dakahlia">الدقهلية</option>
                <option value="Qalyubia">القليوبية</option>
                <option value="Monufia">المنوفية</option>
                <option value="Beheira">البحيرة</option>
                <option value="Kafr El-Sheikh">كفر الشيخ</option>
                <option value="Damietta">دمياط</option>
                <option value="Port Said">بورسعيد</option>
                <option value="Ismailia">الإسماعيلية</option>
                <option value="Suez">السويس</option>
              </select>
              {!formData.governorate && !editing && (
                <p style={{
                  color: colors.textMuted,
                  fontSize: typography.fontSize.xs,
                  margin: `${spacing.xs} 0 0 0`,
                  fontStyle: 'italic'
                }}>
                  غير محدد
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                marginBottom: spacing.xs
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <BookOpen size={16} color={colors.info} />
                  الصف الدراسي
                </div>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                disabled={!editing}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: editing ? colors.surface : colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none'
                }}
              >
                <option value="">اختر الصف الدراسي</option>
                <option value="أولى إعدادي">أولى إعدادي</option>
                <option value="تانية إعدادي">تانية إعدادي</option>
                <option value="تالتة إعدادي">تالتة إعدادي</option>
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
                <option value="تالتة ثانوي">تالتة ثانوي</option>
              </select>
              {!formData.grade && !editing && (
                <p style={{
                  color: colors.textMuted,
                  fontSize: typography.fontSize.xs,
                  margin: `${spacing.xs} 0 0 0`,
                  fontStyle: 'italic'
                }}>
                  غير محدد
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </LuxuryCard>
  );

  const OrdersTab = () => (
    <LuxuryCard>
      <h3 style={{
        color: colors.text,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        margin: 0,
        marginBottom: spacing.lg
      }}>
        طلباتي
      </h3>
      
      {loadingEnrollments ? (
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `3px solid ${colors.border}`,
            borderTop: `3px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
            marginBottom: spacing.md
          }}></div>
          <p style={{ color: colors.textMuted, margin: 0 }}>جاري تحميل طلباتك...</p>
        </div>
      ) : (enrollments.length > 0 || (user?.enrolledCourses && user.enrolledCourses.length > 0)) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {(enrollments.length > 0 ? enrollments : user.enrolledCourses || []).map((enrollment, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.lg,
                background: colors.surface,
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border}`
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: colors.accent,
                borderRadius: borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.background,
                flexShrink: 0
              }}>
                <BookOpen size={24} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  margin: 0,
                  marginBottom: spacing.xs
                }}>
                  {(() => {
                    // Debug: Log the enrollment data to see what's available
                    console.log('Enrollment data:', enrollment);
                    console.log('CourseId data:', enrollment.courseId);
                    
                    // Try different possible field names for course title
                    const courseTitle = enrollment.courseId?.title || 
                                      enrollment.courseId?.name || 
                                      enrollment.courseTitle || 
                                      enrollment.course?.title || 
                                      enrollment.course?.name ||
                                      enrollment.title ||
                                      enrollment.name;
                    
                    console.log('Course title found:', courseTitle);
                    
                    return courseTitle || 'دورة غير محددة';
                  })()}
                </h4>
                <p style={{
                  color: colors.textMuted,
                  fontSize: typography.fontSize.sm,
                  margin: 0
                }}>
                  {new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                {enrollment.paymentStatus === 'approved' ? (
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
                    موافق عليه
                  </div>
                ) : (
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
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <ShoppingBag size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
          <h4 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
            لا توجد طلبات
          </h4>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            لم تقم بطلب أي دورات حتى الآن
          </p>
        </div>
      )}
    </LuxuryCard>
  );

  const AddressTab = () => (
    <LuxuryCard>
      <h3 style={{
        color: colors.text,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        margin: 0,
        marginBottom: spacing.lg
      }}>
        العنوان
      </h3>
      
      <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
        <MapPin size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
        <h4 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
          لا يوجد عنوان محفوظ
        </h4>
        <p style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.lg }}>
          يمكنك إضافة عنوانك للمساعدة في التسليم
        </p>
        <LuxuryButton variant="primary">
          إضافة عنوان
        </LuxuryButton>
      </div>
    </LuxuryCard>
  );

  const SettingsTab = () => (
    <LuxuryCard>
      <h3 style={{
        color: colors.text,
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        margin: 0,
        marginBottom: spacing.lg
      }}>
        الإعدادات
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          background: colors.surface,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <Bell size={20} color={colors.textMuted} />
            <div>
              <h4 style={{
                color: colors.text,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                margin: 0
              }}>
                الإشعارات
              </h4>
              <p style={{
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                margin: 0
              }}>
                تلقي إشعارات حول الدورات والتحديثات
              </p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          background: colors.surface,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <Shield size={20} color={colors.textMuted} />
            <div>
              <h4 style={{
                color: colors.text,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                margin: 0
              }}>
                الخصوصية
              </h4>
              <p style={{
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                margin: 0
              }}>
                إعدادات الخصوصية والأمان
              </p>
            </div>
          </div>
          <LuxuryButton variant="ghost" size="sm">
            <ChevronRight size={16} />
          </LuxuryButton>
        </div>
      </div>
    </LuxuryCard>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.gradient,
      padding: spacing.xl 
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
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
          حسابي
        </h1>
        <p style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.lg,
          margin: 0
        }}>
          إدارة ملفك الشخصي وإعداداتك
        </p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: spacing.lg }}>
        <div style={{ 
          display: 'flex', 
          gap: spacing.sm,
          borderBottom: `2px solid ${colors.border}`,
          marginBottom: spacing.lg,
          overflowX: 'auto'
        }}>
          {tabs.map((tab) => {
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
                  transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.easeInOut}`,
                  whiteSpace: 'nowrap'
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
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'address' && <AddressTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LuxuryMyAccountPage;
