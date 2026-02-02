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
  X
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
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;

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
  const [checkingTransactionId, setCheckingTransactionId] = useState(false);
  const [transactionIdStatus, setTransactionIdStatus] = useState(null); // 'valid', 'invalid', 'checking'

  // Vodafone Cash number
  const VODAFONE_NUMBER = '01022880651';

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
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
  const checkTransactionId = async (transactionId) => {
    if (!transactionId || transactionId.length < 5) {
      setTransactionIdStatus(null);
      return;
    }

    setCheckingTransactionId(true);
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
    } finally {
      setCheckingTransactionId(false);
    }
  };

  // Debounced transaction ID checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.transactionId) {
        checkTransactionId(formData.transactionId);
      } else {
        setTransactionIdStatus(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CreditCard size={48} color={colors.accent} />
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
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing['2xl']} ${spacing.lg}`
      }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <LuxuryButton
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              العودة
            </LuxuryButton>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6" style={{
              background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
              border: `2px solid ${colors.accent}30`
            }}>
              <CreditCard size={40} color={colors.accent} />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: colors.text }}>
              دفع رسوم الدورة
            </h1>
            <p className="text-lg mb-2" style={{ color: colors.textMuted }}>
              {course ? course.title : 'جاري التحميل...'}
            </p>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              {course ? `${course.subject} • الصف ${course.grade}` : 'جاري التحميل...'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vodafone Cash Info */}
          <LuxuryCard className="h-fit" style={{
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.lg
          }}>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  border: `2px solid ${colors.accent}30`
                }}>
                  <Smartphone size={32} color={colors.accent} />
                </div>
                
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                  Vodafone Cash
                </h2>
                <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                  قم بتحويل المبلغ إلى الرقم التالي
                </p>
              </div>

              {/* Vodafone Number - Large and Bold */}
              <div className="text-center mb-8">
                <div className="inline-block p-6 rounded-2xl" style={{
                  background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
                  border: `2px solid ${colors.accent}30`
                }}>
                  <p className="text-sm font-medium mb-2" style={{ color: colors.textMuted }}>
                    رقم Vodafone Cash
                  </p>
                  <p className="text-4xl font-bold" style={{ color: colors.accent }}>
                    {VODAFONE_NUMBER}
                  </p>
                </div>
              </div>

              {/* Course Price */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{
                  background: `linear-gradient(135deg, ${colors.success}20, ${colors.success}10)`,
                  border: `1px solid ${colors.success}30`
                }}>
                  <DollarSign size={20} color={colors.success} />
                  <span className="text-lg font-bold" style={{ color: colors.success }}>
                    {course ? formatCurrency(course.price) : '0 جنيه'}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{
                    background: `${colors.accent}20`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <span className="text-xs font-bold" style={{ color: colors.accent }}>1</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    افتح تطبيق Vodafone Cash على هاتفك
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{
                    background: `${colors.accent}20`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <span className="text-xs font-bold" style={{ color: colors.accent }}>2</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    اختر "إرسال أموال" وأدخل الرقم: <strong>{VODAFONE_NUMBER}</strong>
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{
                    background: `${colors.accent}20`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <span className="text-xs font-bold" style={{ color: colors.accent }}>3</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    أدخل المبلغ: <strong>{formatCurrency(course.price)}</strong>
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{
                    background: `${colors.accent}20`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <span className="text-xs font-bold" style={{ color: colors.accent }}>4</span>
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    أكمل العملية والتقط صورة للإثبات
                  </p>
                </div>
              </div>
            </div>
          </LuxuryCard>

          {/* Payment Form */}
          <LuxuryCard style={{
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.lg
          }}>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                تفاصيل الدفع
              </h3>

              <form className="space-y-6">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="أدخل الاسم الكامل"
                      className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                    />
                  </div>
                </div>

                {/* Student Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    رقم الهاتف <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="rounded-xl border-2 transition-all duration-200 focus-within:ring-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      '--tw-ring-color': colors.accent + '30'
                    }}
                  >
                    <PhoneInput
                      value={formData.studentPhone}
                      onChange={handlePhoneChange}
                      placeholder="+201234567890"
                      defaultCountry="EG"
                      className="!border-0 !bg-transparent"
                      id="studentPhone"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    المبلغ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      readOnly
                    />
                  </div>
                </div>

                {/* Transaction ID (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    رقم المعاملة (اختياري)
                    <button
                      type="button"
                      onClick={generateTransactionId}
                      className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={submitting}
                    >
                      🎲 توليد تلقائي
                    </button>
                  </label>
                  <div className="relative">
                    <CreditCard size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="رقم المعاملة من Vodafone Cash أو اتركه فارغاً للتوليد التلقائي"
                      className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: transactionIdStatus === 'invalid' ? '#dc3545' : transactionIdStatus === 'valid' ? '#28a745' : colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      disabled={submitting}
                    />
                    {/* Status indicator */}
                    {transactionIdStatus === 'checking' && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                    {transactionIdStatus === 'valid' && (
                      <CheckCircle size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {transactionIdStatus === 'invalid' && (
                      <AlertCircle size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    💡 إذا تركت هذا الحقل فارغاً، سيتم توليد رقم معاملة فريد تلقائياً
                  </p>
                  
                  {/* Transaction ID status messages */}
                  {transactionIdStatus === 'checking' && (
                    <p className="text-xs mt-1 text-blue-500">
                      🔄 جاري التحقق من رقم المعاملة...
                    </p>
                  )}
                  {transactionIdStatus === 'valid' && (
                    <p className="text-xs mt-1 text-green-500">
                      ✅ رقم المعاملة متاح للاستخدام
                    </p>
                  )}
                  {transactionIdStatus === 'invalid' && (
                    <p className="text-xs mt-1 text-red-500">
                      ❌ رقم المعاملة موجود مسبقاً، يرجى استخدام رقم آخر
                    </p>
                  )}
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    صورة إثبات الدفع <span className="text-red-500">*</span>
                  </label>
                  
                  {!screenshot ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 hover:border-opacity-60" style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background + '50'
                      }}>
                        <Upload size={32} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
                        <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
                          اضغط لرفع صورة إثبات الدفع
                        </p>
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          JPG, PNG أو WebP - حد أقصى 5 ميجابايت
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="Payment proof"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-2 left-2 p-2 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: colors.error + '20',
                          color: colors.error
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <LuxuryButton
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  disabled={submitting}
                  className="w-full py-4 text-lg font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`
                  }}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock size={20} />
                      </motion.div>
                      جاري الإرسال...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Shield size={20} />
                      إرسال طلب الدفع
                    </div>
                  )}
                </LuxuryButton>
              </form>
            </div>
          </LuxuryCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <LuxuryCard style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.xl
              }}>
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{
                    background: `linear-gradient(135deg, ${colors.warning}20, ${colors.warning}10)`,
                    border: `2px solid ${colors.warning}30`
                  }}>
                    <AlertCircle size={32} color={colors.warning} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
                    تأكيد الدفع
                  </h3>
                  
                  <p className="text-lg mb-6" style={{ color: colors.textMuted }}>
                    هل أنت متأكد من أنك قمت بتحويل المبلغ إلى الرقم
                  </p>
                  
                  <div className="inline-block p-4 rounded-xl mb-6" style={{
                    background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
                    border: `2px solid ${colors.accent}30`
                  }}>
                    <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {VODAFONE_NUMBER}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <LuxuryButton
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      className="flex-1"
                    >
                      إلغاء
                    </LuxuryButton>
                    <LuxuryButton
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1"
                      style={{
                        background: `linear-gradient(135deg, ${colors.success}, ${colors.success}CC)`,
                        boxShadow: `0 8px 32px ${colors.success}30`
                      }}
                    >
                      تأكيد الإرسال
                    </LuxuryButton>
                  </div>
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
