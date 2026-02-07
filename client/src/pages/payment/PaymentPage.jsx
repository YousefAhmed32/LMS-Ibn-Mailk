import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../hooks/use-toast';
import {
  CreditCard,
  Smartphone,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  User,
  Phone,
  FileImage,
  Shield,
  Clock,
  BookOpen,
  Camera,
  X,
  Sparkles,
  Zap,
  Star,
  Copy,
  CheckCircle2
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import PhoneInput from '../../components/ui/PhoneInput';
import { isValidPhone } from '../../utils/phoneUtils';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  // State management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    studentPhone: '',
    amount: '',
    transactionId: ''
  });

  const [screenshot, setScreenshot] = useState(null);
  const [transactionIdStatus, setTransactionIdStatus] = useState(null); // 'valid', 'invalid', 'checking'
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Vodafone Cash number
  const VODAFONE_NUMBER = '01022880651';

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching course details for ID:', courseId);
      
      const response = await axiosInstance.get(`/api/courses/${courseId}`);
      console.log('Course API response:', response.data);
      
      // Check different possible response structures
      let courseData = null;
      
      if (response.data.success && response.data.course) {
        // Regular course endpoint: { success: true, course: courseData }
        courseData = response.data.course;
      } else if (response.data.success && response.data.data && response.data.data.course) {
        // Admin course endpoint: { success: true, data: { course, enrolledStudents } }
        courseData = response.data.data.course;
      } else if (response.data.success && response.data.data) {
        // Direct data response
        courseData = response.data.data;
      } else if (response.data && !response.data.success) {
        // Direct course object without success wrapper
        courseData = response.data;
      }
      
      if (courseData && courseData._id) {
        console.log('Course data found:', courseData);
        setCourse(courseData);
        setFormData(prev => ({
          ...prev,
          amount: courseData.price ? courseData.price.toString() : '0'
        }));
      } else {
        console.error('Course data not found or invalid response structure:', response.data);
        toast({
          title: 'خطأ في تحميل بيانات الدورة',
          description: 'لم يتم العثور على بيانات الدورة أو أن الدورة غير موجودة',
          variant: 'destructive',
          duration: 5000
        });
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'حدث خطأ أثناء تحميل تفاصيل الدورة';
      if (error.response?.status === 404) {
        errorMessage = 'الدورة غير موجودة';
      } else if (error.response?.status === 401) {
        errorMessage = 'يرجى تسجيل الدخول أولاً';
      }
      
      toast({
        title: 'خطأ في تحميل بيانات الدورة',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, studentPhone: value || '' }));
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'نوع ملف غير مدعوم',
          description: 'يرجى اختيار صورة بصيغة JPG, PNG أو WebP',
          variant: 'destructive',
          duration: 5000
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'حجم الملف كبير جداً',
          description: 'يرجى اختيار صورة بحجم أقل من 5 ميجابايت',
          variant: 'destructive',
          duration: 5000
        });
        return;
      }

      setScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshotPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      toast({
        title: 'الاسم مطلوب',
        description: 'يرجى إدخال الاسم الكامل',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    if (!formData.studentPhone.trim()) {
      toast({
        title: 'رقم الهاتف مطلوب',
        description: 'يرجى إدخال رقم الهاتف',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    if (!isValidPhone(formData.studentPhone)) {
      toast({
        title: 'رقم هاتف غير صحيح',
        description: 'يرجى إدخال رقم هاتف دولي صحيح (مثال: +201234567890)',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    if (!formData.amount || !course || parseFloat(formData.amount) !== course.price) {
      toast({
        title: 'المبلغ غير صحيح',
        description: course ? `يجب أن يكون المبلغ ${course.price} جنيه` : 'يرجى تحميل بيانات الدورة أولاً',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    if (!screenshot) {
      toast({
        title: 'صورة الإثبات مطلوبة',
        description: 'يرجى رفع صورة إثبات الدفع',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    // Check transaction ID status if provided
    if (formData.transactionId && transactionIdStatus === 'invalid') {
      toast({
        title: 'رقم المعاملة موجود مسبقاً',
        description: 'يرجى استخدام رقم معاملة مختلف أو ترك الحقل فارغاً للتوليد التلقائي',
        variant: 'destructive',
        duration: 5000
      });
      return false;
    }

    // Check if transaction ID is still being validated
    if (formData.transactionId && transactionIdStatus === 'checking') {
      toast({
        title: 'جاري التحقق من رقم المعاملة',
        description: 'يرجى انتظار انتهاء التحقق من رقم المعاملة',
        variant: 'destructive',
        duration: 4000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('courseId', courseId);
      formDataToSend.append('studentName', formData.studentName.trim());
      formDataToSend.append('studentPhone', formData.studentPhone.trim());
      formDataToSend.append('amount', formData.amount);
      if (formData.transactionId.trim()) {
        formDataToSend.append('transactionId', formData.transactionId.trim());
      }
      formDataToSend.append('image', screenshot);

      const response = await axiosInstance.post('/api/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast({
          title: 'تم إرسال طلب الدفع بنجاح',
          description: 'تم إرسال تفاصيل الدفع. يرجى انتظار موافقة الإدارة.',
          variant: 'success',
          duration: 6000
        });
        
        // Use redirectUrl from server response, fallback to home page
        const redirectUrl = response.data.redirectUrl || "/";
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      
      // Handle specific error types
      let errorTitle = 'خطأ في إرسال الطلب';
      let errorMessage = 'حدث خطأ أثناء إرسال طلب الدفع';
      let errorVariant = 'destructive';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 409:
            // Duplicate transaction ID
            errorTitle = 'رقم المعاملة موجود مسبقاً';
            errorMessage = data.message || 'رقم المعاملة هذا تم استخدامه من قبل. يرجى استخدام رقم معاملة مختلف.';
            break;
          case 400:
            // Validation error or duplicate pending payment
            if (data.code === 'DUPLICATE_PENDING_PAYMENT') {
              errorTitle = 'طلب دفع معلق موجود';
              errorMessage = 'لديك طلب دفع معلق لهذه الدورة. يرجى انتظار موافقة الإدارة.';
            } else if (data.code === 'VALIDATION_ERROR') {
              errorTitle = 'خطأ في البيانات';
              errorMessage = 'يرجى التحقق من البيانات المدخلة والمحاولة مرة أخرى.';
            } else {
              errorMessage = data.message || data.error || errorMessage;
            }
            break;
          case 404:
            errorTitle = 'الدورة غير موجودة';
            errorMessage = 'الدورة المطلوبة غير موجودة.';
            break;
          case 500:
            errorTitle = 'خطأ في الخادم';
            errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
            break;
          default:
            errorMessage = data.message || data.error || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorTitle = 'خطأ في الاتصال';
        errorMessage = 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: errorVariant,
        duration: 8000
      });
    } finally {
      setSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 جنيه';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  // Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const phoneSuffix = formData.studentPhone ? formData.studentPhone.slice(-4) : '';
    
    const generatedId = `TXN_${timestamp}_${random}${phoneSuffix}`;
    
    setFormData(prev => ({
      ...prev,
      transactionId: generatedId
    }));

    toast({
      title: 'تم توليد رقم معاملة جديد',
      description: `رقم المعاملة: ${generatedId}`,
      variant: 'success',
      duration: 4000
    });
  };

  // Check if transaction ID exists
  const checkTransactionId = React.useCallback(async (transactionId) => {
    if (!transactionId || transactionId.length < 5) {
      setTransactionIdStatus(null);
      return;
    }

    setTransactionIdStatus('checking');

    try {
      const response = await axiosInstance.get('/api/payments/check-transaction-id', {
        params: { transactionId: transactionId.trim() }
      });

      if (response.data.success) {
        setTransactionIdStatus(response.data.exists ? 'invalid' : 'valid');
      } else {
        setTransactionIdStatus(null);
      }
    } catch (error) {
      console.error('Error checking transaction ID:', error);
      setTransactionIdStatus(null);
    }
  }, []);

  // Debounced transaction ID checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.transactionId && formData.transactionId.length >= 5) {
        checkTransactionId(formData.transactionId);
      } else {
        setTransactionIdStatus(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.transactionId, checkTransactionId]);

  // Copy phone number to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(VODAFONE_NUMBER);
      setCopiedNumber(true);
      toast({
        title: 'تم النسخ',
        description: 'تم نسخ رقم Vodafone Cash إلى الحافظة',
        variant: 'success',
        duration: 2000
      });
      setTimeout(() => setCopiedNumber(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <CreditCard size={64} color={colors.accent} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium"
            style={{ color: colors.textMuted }}
          >
            جاري تحميل بيانات الدورة...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle size={48} color={colors.error} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>
            الدورة غير موجودة
          </h2>
          <LuxuryButton onClick={() => navigate('/courses')}>
            العودة للدورات
          </LuxuryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Static Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
          }}
        />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-15"
          style={{
            background: `radial-gradient(circle, ${colors.success} 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 50%, ${colors.background} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: `${spacing['2xl']} ${spacing.lg}`,
          boxShadow: `0 4px 20px ${colors.shadow}20`
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <LuxuryButton
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 group"
              style={{
                borderColor: colors.border,
                color: colors.text,
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowLeft size={18} />
              العودة
            </LuxuryButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 relative"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                border: `2px solid ${colors.accent}40`,
                boxShadow: `0 8px 32px ${colors.accent}30`
              }}
            >
              <CreditCard size={48} color={colors.accent} />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              دفع رسوم الدورة
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl sm:text-2xl mb-3 font-semibold"
              style={{ color: colors.text }}
            >
              {course ? course.title : 'جاري التحميل...'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ color: colors.textMuted }}
            >
              <BookOpen size={16} />
              <span>{course ? `${course.subject} • الصف ${course.grade}` : 'جاري التحميل...'}</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Payment Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Vodafone Cash Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <LuxuryCard className="h-fit relative overflow-hidden group" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceElevated} 100%)`,
              border: `2px solid ${colors.border}`,
              boxShadow: `0 20px 60px ${colors.shadow}30`,
              transition: 'all 0.3s ease'
            }}>
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)` }}
              />
              
              <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl mb-6 relative" style={{
                    background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}15)`,
                    border: `3px solid ${colors.accent}40`,
                    boxShadow: `0 8px 32px ${colors.accent}40`
                  }}>
                    <Smartphone size={40} color={colors.accent} />
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r bg-clip-text" style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Vodafone Cash
                  </h2>
                  <p className="text-base sm:text-lg mb-8" style={{ color: colors.textMuted }}>
                    قم بتحويل المبلغ إلى الرقم التالي
                  </p>
                </motion.div>

                {/* Vodafone Number - Large and Bold with Copy Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8"
                >
                  <div className="relative inline-block p-6 sm:p-8 rounded-3xl group/number" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `2px solid ${colors.accent}40`,
                    boxShadow: `0 8px 32px ${colors.accent}30`,
                    transition: 'all 0.3s ease'
                  }}>
                    <p className="text-xs sm:text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: colors.textMuted }}>
                      رقم Vodafone Cash
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider" style={{ color: colors.accent }}>
                        {VODAFONE_NUMBER}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyToClipboard}
                        className="p-2 sm:p-3 rounded-xl transition-all duration-200"
                        style={{
                          background: copiedNumber ? colors.success + '20' : colors.accent + '20',
                          border: `2px solid ${copiedNumber ? colors.success + '40' : colors.accent + '40'}`,
                          color: copiedNumber ? colors.success : colors.accent
                        }}
                        title="نسخ الرقم"
                      >
                        {copiedNumber ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Copy size={20} />
                        )}
                      </motion.button>
                    </div>
                    {copiedNumber && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs mt-2 font-medium"
                        style={{ color: colors.success }}
                      >
                        تم النسخ!
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Course Price */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 rounded-2xl relative overflow-hidden group/price" style={{
                    background: `linear-gradient(135deg, ${colors.success}25, ${colors.success}15)`,
                    border: `2px solid ${colors.success}40`,
                    boxShadow: `0 8px 24px ${colors.success}30`
                  }}>
                    <DollarSign size={24} color={colors.success} />
                    <span className="text-2xl sm:text-3xl font-black" style={{ color: colors.success }}>
                      {course ? formatCurrency(course.price) : '0 جنيه'}
                    </span>
                  </div>
                </motion.div>

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  {[
                    { step: 1, text: 'افتح تطبيق Vodafone Cash على هاتفك', icon: Smartphone },
                    { step: 2, text: `اختر "إرسال أموال" وأدخل الرقم: ${VODAFONE_NUMBER}`, icon: Phone },
                    { step: 3, text: `أدخل المبلغ: ${formatCurrency(course?.price || 0)}`, icon: DollarSign },
                    { step: 4, text: 'أكمل العملية والتقط صورة للإثبات', icon: Camera }
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl group/step transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center relative overflow-hidden" style={{
                          background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}15)`,
                          border: `2px solid ${colors.accent}40`,
                          boxShadow: `0 4px 12px ${colors.accent}30`
                        }}>
                          <span className="text-sm sm:text-base font-black relative z-10" style={{ color: colors.accent }}>
                            {item.step}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: colors.text }}>
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <LuxuryCard className="relative overflow-hidden group" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceElevated} 100%)`,
              border: `2px solid ${colors.border}`,
              boxShadow: `0 20px 60px ${colors.shadow}30`
            }}>
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: `radial-gradient(circle, ${colors.success} 0%, transparent 70%)` }}
              />
              
              <div className="relative z-10 p-6 sm:p-8 lg:p-10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                    background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}15)`,
                    border: `2px solid ${colors.accent}40`
                  }}>
                    <Shield size={24} color={colors.accent} />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text" style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.accent}, ${colors.success})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    تفاصيل الدفع
                  </h3>
                </motion.div>

                <form className="space-y-6">
                  {/* Student Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="flex text-sm sm:text-base font-semibold mb-3 items-center gap-2" style={{ color: colors.text }}>
                      <User size={18} />
                      <span>الاسم الكامل <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}10, ${colors.accent}05)`,
                          boxShadow: `0 0 0 2px ${colors.accent}30`
                        }}
                      />
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="أدخل الاسم الكامل"
                        className="relative w-full pr-12 pl-5 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-base"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.base
                        }}
                      />
                      <User size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200" style={{ color: colors.textMuted }} />
                    </div>
                  </motion.div>

                  {/* Student Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="flex text-sm sm:text-base font-semibold mb-3 items-center gap-2" style={{ color: colors.text }}>
                      <Phone size={18} />
                      <span>رقم الهاتف <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative group/phone">
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/phone:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}10, ${colors.accent}05)`,
                          boxShadow: `0 0 0 2px ${colors.accent}30`
                        }}
                      />
                      <div
                        className="relative rounded-2xl border-2 transition-all duration-300 focus-within:ring-0"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background
                        }}
                      >
                        <PhoneInput
                          value={formData.studentPhone}
                          onChange={handlePhoneChange}
                          placeholder="+201234567890"
                          defaultCountry="EG"
                          className="!border-0 !bg-transparent h-14 text-base"
                          id="studentPhone"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Amount */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="flex text-sm sm:text-base font-semibold mb-3 items-center gap-2" style={{ color: colors.text }}>
                      <DollarSign size={18} />
                      <span>المبلغ <span className="text-red-500">*</span></span>
                    </label>
                    <div className="relative group/amount">
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/amount:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.success}10, ${colors.success}05)`,
                          boxShadow: `0 0 0 2px ${colors.success}30`
                        }}
                      />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="relative w-full pr-12 pl-5 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-lg font-bold"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.success,
                          fontSize: typography.fontSize.lg
                        }}
                        readOnly
                      />
                      <DollarSign size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2" style={{ color: colors.success }} />
                    </div>
                  </motion.div>

                  {/* Transaction ID (Optional) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="flex text-sm sm:text-base font-semibold mb-3 items-center gap-2 flex-wrap" style={{ color: colors.text }}>
                      <CreditCard size={18} />
                      <span className="flex-1">رقم المعاملة (اختياري)</span>
                      <motion.button
                        type="button"
                        onClick={generateTransactionId}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}DD)`,
                          color: colors.background,
                          boxShadow: `0 4px 12px ${colors.accent}30`
                        }}
                        disabled={submitting}
                      >
                        <Zap size={14} />
                        توليد تلقائي
                      </motion.button>
                    </label>
                    <div className="relative group/txn">
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within/txn:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}10, ${colors.accent}05)`,
                          boxShadow: `0 0 0 2px ${colors.accent}30`
                        }}
                      />
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        placeholder="رقم المعاملة من Vodafone Cash أو اتركه فارغاً للتوليد التلقائي"
                        className="relative w-full pr-12 pl-12 py-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-0 text-base"
                        style={{
                          borderColor: transactionIdStatus === 'invalid' ? colors.error : transactionIdStatus === 'valid' ? colors.success : colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.base
                        }}
                        disabled={submitting}
                      />
                      {/* Status indicator */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {transactionIdStatus === 'checking' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent"
                          />
                        )}
                        {transactionIdStatus === 'valid' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle size={20} className="text-green-500" />
                          </motion.div>
                        )}
                        {transactionIdStatus === 'invalid' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <AlertCircle size={20} className="text-red-500" />
                          </motion.div>
                        )}
                      </div>
                      <CreditCard size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200" style={{ color: colors.textMuted }} />
                    </div>
                    <p className="text-xs sm:text-sm mt-2 flex items-center gap-2" style={{ color: colors.textMuted }}>
                      <Sparkles size={14} />
                      إذا تركت هذا الحقل فارغاً، سيتم توليد رقم معاملة فريد تلقائياً
                    </p>
                    
                    {/* Transaction ID status messages */}
                    <AnimatePresence>
                      {transactionIdStatus === 'checking' && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs sm:text-sm mt-2 flex items-center gap-2 font-medium"
                          style={{ color: colors.info }}
                        >
                          <Clock size={14} className="animate-spin" />
                          جاري التحقق من رقم المعاملة...
                        </motion.p>
                      )}
                      {transactionIdStatus === 'valid' && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs sm:text-sm mt-2 flex items-center gap-2 font-medium"
                          style={{ color: colors.success }}
                        >
                          <CheckCircle size={14} />
                          رقم المعاملة متاح للاستخدام
                        </motion.p>
                      )}
                      {transactionIdStatus === 'invalid' && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs sm:text-sm mt-2 flex items-center gap-2 font-medium"
                          style={{ color: colors.error }}
                        >
                          <AlertCircle size={14} />
                          رقم المعاملة موجود مسبقاً، يرجى استخدام رقم آخر
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Screenshot Upload */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <label className="flex text-sm sm:text-base font-semibold mb-3 items-center gap-2" style={{ color: colors.text }}>
                      <Camera size={18} />
                      <span>صورة إثبات الدفع <span className="text-red-500">*</span></span>
                    </label>
                    
                    {!screenshot ? (
                      <div className="relative group/upload">
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="hidden"
                            id="screenshot-upload"
                          />
                          <div className="border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 relative overflow-hidden hover:scale-[1.02] active:scale-[0.98]" style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background + '80',
                            background: `linear-gradient(135deg, ${colors.background}80, ${colors.surface}80)`,
                            cursor: 'pointer'
                          }}>
                            {/* Animated background */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${colors.accent}10, ${colors.success}10)`
                              }}
                            />
                            <div className="relative z-10">
                              <div
                                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6"
                                style={{
                                  background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                                  border: `2px solid ${colors.accent}40`,
                                  boxShadow: `0 8px 24px ${colors.accent}30`
                                }}
                              >
                                <Upload size={40} color={colors.accent} />
                              </div>
                              <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: colors.text }}>
                                اضغط لرفع صورة إثبات الدفع
                              </p>
                              <p className="text-xs sm:text-sm flex items-center justify-center gap-2" style={{ color: colors.textMuted }}>
                                <FileImage size={14} />
                                JPG, PNG أو WebP - حد أقصى 5 ميجابايت
                              </p>
                              <div
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                                style={{
                                  background: `${colors.accent}15`,
                                  border: `1px solid ${colors.accent}30`
                                }}
                              >
                                <Camera size={16} color={colors.accent} />
                                <span className="text-xs font-medium" style={{ color: colors.accent }}>
                                  التقط صورة أو اختر من الملفات
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group/preview"
                      >
                        <div className="relative rounded-2xl overflow-hidden border-2" style={{
                          borderColor: colors.border,
                          boxShadow: `0 8px 32px ${colors.shadow}30`
                        }}>
                          <img
                            src={screenshotPreview}
                            alt="Payment proof"
                            className="w-full h-64 sm:h-80 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300" />
                        </div>
                        <motion.button
                          type="button"
                          onClick={removeScreenshot}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-4 left-4 p-3 rounded-2xl transition-all duration-200 backdrop-blur-sm"
                          style={{
                            backgroundColor: colors.error + '90',
                            color: colors.background,
                            boxShadow: `0 4px 16px ${colors.error}40`
                          }}
                        >
                          <X size={20} />
                        </motion.button>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute bottom-4 left-4 right-4"
                        >
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm" style={{
                            backgroundColor: colors.success + '90',
                            color: colors.background
                          }}>
                            <CheckCircle size={18} />
                            <span className="text-sm font-semibold">تم رفع الصورة بنجاح</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <LuxuryButton
                      type="button"
                      onClick={() => setShowConfirmation(true)}
                      disabled={submitting}
                      className="w-full py-5 sm:py-6 text-lg sm:text-xl font-bold relative overflow-hidden group/btn"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}DD)`,
                        boxShadow: `0 12px 40px ${colors.accent}40`,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {submitting ? (
                        <div className="relative flex items-center justify-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Clock size={24} />
                          </motion.div>
                          <span>جاري الإرسال...</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center gap-3">
                          <Shield size={24} />
                          <span>إرسال طلب الدفع</span>
                        </div>
                      )}
                    </LuxuryButton>
                  </motion.div>
                </form>
              </div>
            </LuxuryCard>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => !submitting && setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <LuxuryCard className="relative overflow-hidden" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceElevated} 100%)`,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 25px 80px ${colors.shadow}50`
              }}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
                  style={{ background: `radial-gradient(circle, ${colors.warning} 0%, transparent 70%)` }}
                />
                
                <div className="relative z-10 p-8 sm:p-10 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl mb-6 relative"
                    style={{
                      background: `linear-gradient(135deg, ${colors.warning}30, ${colors.warning}15)`,
                      border: `3px solid ${colors.warning}40`,
                      boxShadow: `0 8px 32px ${colors.warning}40`
                    }}
                  >
                    <AlertCircle size={40} color={colors.warning} />
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${colors.warning}, ${colors.accent})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    تأكيد الدفع
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg sm:text-xl mb-8 font-medium"
                    style={{ color: colors.textMuted }}
                  >
                    هل أنت متأكد من أنك قمت بتحويل المبلغ إلى الرقم
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block p-6 sm:p-8 rounded-3xl mb-8 relative group/number"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 8px 32px ${colors.accent}40`
                    }}
                  >
                    <p className="text-3xl sm:text-4xl font-black tracking-wider" style={{ color: colors.accent }}>
                      {VODAFONE_NUMBER}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <LuxuryButton
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      disabled={submitting}
                      className="flex-1 py-4 text-base sm:text-lg font-semibold"
                      style={{
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      إلغاء
                    </LuxuryButton>
                    <LuxuryButton
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 py-4 text-base sm:text-lg font-bold relative overflow-hidden group/confirm"
                      style={{
                        background: `linear-gradient(135deg, ${colors.success}, ${colors.success}DD)`,
                        boxShadow: `0 12px 40px ${colors.success}40`
                      }}
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        <CheckCircle2 size={20} />
                        تأكيد الإرسال
                      </span>
                    </LuxuryButton>
                  </motion.div>
                </div>
              </LuxuryCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
