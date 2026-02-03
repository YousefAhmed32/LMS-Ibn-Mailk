import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  ShoppingBag,
  MapPin,
  Bell,
  Shield,
  BookOpen,
  Clock,
  CheckCircle,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  ChevronRight,
  Clipboard
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// لوحة ألوان فاخرة لمنصة تعليمية راقية — تعمل في الوضع الفاتح والداكن
const getPremiumPalette = (isDark) => (isDark ? {
  bg: 'linear-gradient(160deg, #0c0c14 0%, #12121f 50%, #0a0a12 100%)',
  card: 'rgba(18, 18, 28, 0.85)',
  cardBorder: 'rgba(180, 150, 80, 0.2)',
  cardAccent: 'linear-gradient(180deg, rgba(200, 165, 90, 0.35) 0%, transparent 100%)',
  gold: '#c9a227',
  goldLight: '#e0c45c',
  goldMuted: 'rgba(201, 162, 39, 0.25)',
  text: '#f5f5f7',
  textSoft: '#b8b8c0',
  textMuted: '#7a7a88',
  inputBg: 'rgba(26, 26, 38, 0.8)',
  inputBorder: 'rgba(60, 60, 75, 0.9)',
  success: '#34d399',
  successSoft: 'rgba(52, 211, 153, 0.2)',
  warning: '#fbbf24',
  warningSoft: 'rgba(251, 191, 36, 0.2)',
  shadow: '0 24px 48px -12px rgba(0,0,0,0.45)',
  glow: '0 0 32px rgba(201, 162, 39, 0.12)'
} : {
  bg: 'linear-gradient(160deg, #fafaf9 0%, #f5f3ef 50%, #f0ede8 100%)',
  card: 'rgba(255, 255, 255, 0.92)',
  cardBorder: 'rgba(180, 150, 80, 0.25)',
  cardAccent: 'linear-gradient(180deg, rgba(200, 165, 90, 0.2) 0%, transparent 100%)',
  gold: '#a67c00',
  goldLight: '#c9a227',
  goldMuted: 'rgba(166, 124, 0, 0.12)',
  text: '#1a1a1f',
  textSoft: '#4a4a52',
  textMuted: '#6b6b75',
  inputBg: 'rgba(255, 255, 255, 0.95)',
  inputBorder: 'rgba(0, 0, 0, 0.08)',
  success: '#059669',
  successSoft: 'rgba(5, 150, 105, 0.12)',
  warning: '#d97706',
  warningSoft: 'rgba(217, 119, 6, 0.12)',
  shadow: '0 24px 48px -12px rgba(0,0,0,0.08)',
  glow: '0 0 32px rgba(166, 124, 0, 0.08)'
});

const LuxuryMyAccountPage = () => {
  const theme = useTheme();
  const { typography } = theme;
  const palette = getPremiumPalette(theme.isDarkMode);
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchEnrollments is stable, avoid refetch loop
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

  const inputBase = {
    width: '100%',
    minHeight: '48px',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: `1px solid ${palette.inputBorder}`,
    background: palette.inputBg,
    color: palette.text,
    fontSize: typography.fontSize.base,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };
  const inputFocus = () => ({ borderColor: palette.gold, boxShadow: `0 0 0 3px ${palette.goldMuted}` });

  const ProfileTab = () => (
    <Motion.div
      className="rounded-2xl overflow-hidden border"
      style={{
        background: palette.card,
        borderColor: palette.cardBorder,
        boxShadow: palette.shadow,
        borderRight: `3px solid ${palette.gold}`
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold m-0" style={{ color: palette.text }}>
            الملف الشخصي
          </h3>
          <div className="flex gap-3 flex-shrink-0">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 min-h-[48px] px-5 rounded-xl font-medium transition-all duration-200 hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.goldLight} 100%)`,
                  color: theme.isDarkMode ? '#0c0c14' : '#fff',
                  border: 'none',
                  boxShadow: palette.glow
                }}
              >
                <Edit size={18} />
                تعديل
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 min-h-[48px] px-5 rounded-xl font-medium border transition-all duration-200"
                  style={{ borderColor: palette.inputBorder, color: palette.textSoft, background: 'transparent' }}
                >
                  <X size={18} />
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 min-h-[48px] px-5 rounded-xl font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.goldLight} 100%)`,
                    color: theme.isDarkMode ? '#0c0c14' : '#fff',
                    border: 'none',
                    boxShadow: palette.glow
                  }}
                >
                  {loading ? <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                  حفظ
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
          {/* صورة الملف */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-3xl font-bold relative"
              style={{
                background: `linear-gradient(145deg, ${palette.gold} 0%, ${palette.goldLight} 100%)`,
                color: theme.isDarkMode ? '#0c0c14' : '#fff',
                boxShadow: palette.glow
              }}
            >
              {user?.firstName?.charAt(0) || 'U'}
              {editing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105"
                  style={{
                    background: palette.card,
                    borderColor: palette.gold,
                    color: palette.gold
                  }}
                >
                  <Camera size={18} />
                </button>
              )}
            </div>
          </div>

          {/* نموذج البيانات */}
          <div className="flex-1 w-full min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                  <span className="flex items-center gap-2">
                    <User size={16} style={{ color: palette.gold }} />
                    الاسم الأول
                  </span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editing}
                  style={inputBase}
                  onFocus={(e) => editing && Object.assign(e.target.style, inputFocus())}
                  onBlur={(e) => { e.target.style.borderColor = palette.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>الاسم الثاني</label>
              <input type="text" name="secondName" value={formData.secondName} onChange={handleInputChange} disabled={!editing} style={inputBase} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>الاسم الثالث</label>
              <input type="text" name="thirdName" value={formData.thirdName} onChange={handleInputChange} disabled={!editing} style={inputBase} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>الاسم الرابع</label>
              <input type="text" name="fourthName" value={formData.fourthName} onChange={handleInputChange} disabled={!editing} style={inputBase} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                <span className="flex items-center gap-2"><Mail size={16} style={{ color: palette.gold }} /> البريد الإلكتروني</span>
              </label>
              <input type="email" name="userEmail" value={formData.userEmail} onChange={handleInputChange} disabled={!editing} style={inputBase} />
            </div>
            {user?.role === 'student' && user?._id && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>معرف الطالب</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={user._id} disabled readOnly style={{ ...inputBase, flex: 1, fontFamily: 'monospace' }} />
                  <button
                    type="button"
                    onClick={() => copyStudentId(user._id)}
                    className="min-h-[48px] px-4 rounded-xl flex items-center justify-center transition-all hover:opacity-90"
                    style={{ background: palette.goldMuted, color: palette.gold, border: 'none' }}
                  >
                    <Clipboard size={18} />
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                <span className="flex items-center gap-2"><Phone size={16} style={{ color: palette.gold }} /> رقم هاتف الطالب</span>
              </label>
              <input type="tel" name="phoneStudent" value={formData.phoneStudent} onChange={handleInputChange} disabled={!editing} placeholder="+201234567890" style={inputBase} />
            </div>
            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                  <span className="flex items-center gap-2"><Phone size={16} style={{ color: palette.success }} /> رقم هاتف ولي الأمر</span>
                </label>
                <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} disabled={!editing} placeholder="+201234567890" style={inputBase} />
                {!formData.guardianPhone && !editing && (
                  <p className="text-xs mt-1 italic" style={{ color: palette.textMuted }}>غير محدد</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                <span className="flex items-center gap-2"><MapPin size={16} style={{ color: palette.gold }} /> المحافظة</span>
              </label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleInputChange}
                disabled={!editing}
                style={inputBase}
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
              {!formData.governorate && !editing && <p className="text-xs mt-1 italic" style={{ color: palette.textMuted }}>غير محدد</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: palette.text }}>
                <span className="flex items-center gap-2"><BookOpen size={16} style={{ color: palette.gold }} /> الصف الدراسي</span>
              </label>
              <select name="grade" value={formData.grade} onChange={handleInputChange} disabled={!editing} style={inputBase}>
                <option value="">اختر الصف الدراسي</option>
                <option value="أولى إعدادي">أولى إعدادي</option>
                <option value="تانية إعدادي">تانية إعدادي</option>
                <option value="تالتة إعدادي">تالتة إعدادي</option>
                <option value="أولى ثانوي">أولى ثانوي</option>
                <option value="تانية ثانوي">تانية ثانوي</option>
                <option value="تالتة ثانوي">تالتة ثانوي</option>
              </select>
              {!formData.grade && !editing && <p className="text-xs mt-1 italic" style={{ color: palette.textMuted }}>غير محدد</p>}
            </div>
          </div>
        </div>
      </div>
      </div>
    </Motion.div>
  );

  function OrdersTab() {
    return (
    <Motion.div
      className="rounded-2xl overflow-hidden border p-5 sm:p-6 md:p-8"
      style={{
        background: palette.card,
        borderColor: palette.cardBorder,
        boxShadow: palette.shadow,
        borderRightWidth: 3,
        borderRightStyle: 'solid',
        borderRightColor: palette.gold
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: palette.text, margin: 0 }}>
        طلباتي
      </h3>
      
      {loadingEnrollments ? (
        <div className="text-center py-14">
          <div
            className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: palette.inputBorder, borderTopColor: palette.gold }}
          />
          <p className="text-base" style={{ color: palette.textSoft, margin: 0 }}>
            جاري تحميل طلباتك...
          </p>
        </div>
      ) : (enrollments.length > 0 || (user?.enrolledCourses && user.enrolledCourses.length > 0)) ? (
        <div className="flex flex-col gap-4">
          {(enrollments.length > 0 ? enrollments : user.enrolledCourses || []).map((enrollment, index) => {
            const courseTitle = enrollment.courseId?.title ||
              enrollment.courseId?.name ||
              enrollment.courseTitle ||
              enrollment.course?.title ||
              enrollment.course?.name ||
              enrollment.title ||
              enrollment.name ||
              'دورة غير محددة';
            return (
              <div
                key={enrollment._id || enrollment.id || `enrollment-${index}`}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border min-w-0 transition-all hover:shadow-lg"
                style={{
                  background: palette.inputBg,
                  borderColor: palette.inputBorder
                }}
              >
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${palette.gold} 0%, ${palette.goldLight} 100%)`,
                    color: theme.isDarkMode ? '#0c0c14' : '#fff',
                    boxShadow: palette.glow
                  }}
                >
                  <BookOpen size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base mb-1 truncate" style={{ color: palette.text }}>
                    {courseTitle}
                  </h4>
                  <p className="text-sm" style={{ color: palette.textMuted, margin: 0 }}>
                    {new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="flex items-center">
                  {enrollment.paymentStatus === 'approved' ? (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: palette.successSoft, color: palette.success }}
                    >
                      <CheckCircle size={14} />
                      موافق عليه
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: palette.warningSoft, color: palette.warning }}
                    >
                      <Clock size={14} />
                      في الانتظار
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14 px-4">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: palette.goldMuted }}>
            <ShoppingBag size={40} style={{ color: palette.gold }} />
          </div>
          <h4 className="text-lg font-semibold mb-2" style={{ color: palette.text, margin: 0 }}>
            لا توجد طلبات
          </h4>
          <p className="text-base" style={{ color: palette.textSoft, margin: 0 }}>
            لم تقم بطلب أي دورات حتى الآن
          </p>
        </div>
      )}
    </Motion.div>
    );
  }

  const AddressTab = () => (
    <Motion.div
      className="rounded-2xl overflow-hidden border p-5 sm:p-6 md:p-8"
      style={{
        background: palette.card,
        borderColor: palette.cardBorder,
        boxShadow: palette.shadow,
        borderRight: `3px solid ${palette.gold}`
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: palette.text, margin: 0 }}>
        العنوان
      </h3>
      <div className="text-center py-14 px-4">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: palette.goldMuted }}>
          <MapPin size={40} style={{ color: palette.gold }} />
        </div>
        <h4 className="text-lg font-semibold mb-2" style={{ color: palette.text, margin: 0 }}>
          لا يوجد عنوان محفوظ
        </h4>
        <p className="text-base mb-8" style={{ color: palette.textSoft, margin: 0 }}>
          يمكنك إضافة عنوانك للمساعدة في التسليم
        </p>
        <button
          type="button"
          className="min-h-[50px] px-8 rounded-xl font-semibold transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.goldLight} 100%)`,
            color: theme.isDarkMode ? '#0c0c14' : '#fff',
            border: 'none',
            boxShadow: palette.glow
          }}
        >
          إضافة عنوان
        </button>
      </div>
    </Motion.div>
  );

  const SettingsTab = () => (
    <Motion.div
      className="rounded-2xl overflow-hidden border p-5 sm:p-6 md:p-8"
      style={{
        background: palette.card,
        borderColor: palette.cardBorder,
        boxShadow: palette.shadow,
        borderRight: `3px solid ${palette.gold}`
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: palette.text, margin: 0 }}>
        الإعدادات
      </h3>
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border transition-all hover:shadow-md"
          style={{ background: palette.inputBg, borderColor: palette.inputBorder }}
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: palette.goldMuted }}>
              <Bell size={22} style={{ color: palette.gold }} />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-base m-0" style={{ color: palette.text }}>الإشعارات</h4>
              <p className="text-sm m-0 mt-1" style={{ color: palette.textSoft }}>تلقي إشعارات حول الدورات والتحديثات</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-center min-h-[48px]">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-amber-600" />
          </label>
        </div>
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl border transition-all hover:shadow-md"
          style={{ background: palette.inputBg, borderColor: palette.inputBorder }}
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: palette.goldMuted }}>
              <Shield size={22} style={{ color: palette.gold }} />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-base m-0" style={{ color: palette.text }}>الخصوصية</h4>
              <p className="text-sm m-0 mt-1" style={{ color: palette.textSoft }}>إعدادات الخصوصية والأمان</p>
            </div>
          </div>
          <button
            type="button"
            className="min-h-[48px] px-4 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: palette.goldMuted, color: palette.gold, border: 'none' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </Motion.div>
  );

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: palette.bg,
        padding: 'clamp(1.25rem, 5vw, 2rem)',
        paddingBottom: 'clamp(2.5rem, 10vw, 4rem)'
      }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Header فاخر */}
        <header className="mb-8 sm:mb-10">
          <h1
            className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold mb-2 tracking-tight"
            style={{
              margin: 0,
              fontFamily: typography.fontFamily.heading,
              background: `linear-gradient(135deg, ${palette.text} 0%, ${palette.goldLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}
          >
            حسابي
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: palette.textSoft, margin: 0, fontWeight: 400 }}
          >
            إدارة ملفك الشخصي وإعداداتك
          </p>
        </header>

        {/* Tabs أنيقة — أزرار حبوبية */}
        <nav
          role="tablist"
          aria-label="أقسام الحساب"
          className="mb-6 sm:mb-8 overflow-x-auto -mx-1 px-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-2 min-w-0 p-1 rounded-2xl w-fit mx-auto sm:mx-0" style={{ background: palette.goldMuted }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 py-3 px-5 sm:px-6 min-h-[48px] whitespace-nowrap flex-shrink-0 rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    background: isActive ? palette.gold : 'transparent',
                    color: isActive ? (theme.isDarkMode ? '#0c0c14' : '#fff') : palette.textSoft,
                    border: 'none',
                    boxShadow: isActive ? palette.glow : 'none',
                    '--tw-ring-color': palette.gold
                  }}
                >
                  <Icon size={20} className="flex-shrink-0" aria-hidden />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* المحتوى */}
        <AnimatePresence mode="wait">
          <Motion.div
            key={activeTab}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="focus:outline-none"
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'address' && <AddressTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LuxuryMyAccountPage;
