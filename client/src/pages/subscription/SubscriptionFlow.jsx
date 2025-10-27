import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import Badge from '../../components/ui/badge';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Phone, 
  CreditCard, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Copy,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  FileText,
  Smartphone,
  Shield,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const SubscriptionFlow = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    senderPhone: '',
    studentPhone: user?.phoneStudent || '',
    parentPhone: '',
    transferTime: '',
    proofImage: null
  });
  const [errors, setErrors] = useState({});
  const [showVodafoneNumber, setShowVodafoneNumber] = useState(false);

  const vodafoneNumber = "01022880651";

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Update student phone when user data is available
  useEffect(() => {
    if (user?.phoneStudent) {
      setPaymentForm(prev => ({
        ...prev,
        studentPhone: user.phoneStudent
      }));
    }
  }, [user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setPaymentForm(prev => ({
          ...prev,
          amount: data.course.price.toString()
        }));
      } else {
        toast({
          title: "خطأ في تحميل الدورة",
          description: "حدث خطأ أثناء تحميل بيانات الدورة",
          variant: "destructive"
        });
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "خطأ في تحميل الدورة",
        description: "حدث خطأ أثناء تحميل بيانات الدورة",
        variant: "destructive"
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate sender phone
    if (!paymentForm.senderPhone) {
      newErrors.senderPhone = 'رقم هاتف المرسل مطلوب';
    } else if (!/^01[0-9]{9}$/.test(paymentForm.senderPhone)) {
      newErrors.senderPhone = 'رقم هاتف غير صحيح (مثال: 01012345678)';
    }

    // Validate student phone
    if (!paymentForm.studentPhone) {
      newErrors.studentPhone = 'رقم هاتف الطالب مطلوب';
    } else if (!/^01[0-9]{9}$/.test(paymentForm.studentPhone)) {
      newErrors.studentPhone = 'رقم هاتف غير صحيح (مثال: 01012345678)';
    }

    // Validate parent phone (optional)
    if (paymentForm.parentPhone && !/^01[0-9]{9}$/.test(paymentForm.parentPhone)) {
      newErrors.parentPhone = 'رقم هاتف غير صحيح (مثال: 01012345678)';
    }

    // Validate transfer time
    if (!paymentForm.transferTime) {
      newErrors.transferTime = 'وقت التحويل مطلوب';
    } else {
      const transferDate = new Date(paymentForm.transferTime);
      const now = new Date();
      if (transferDate > now) {
        newErrors.transferTime = 'وقت التحويل لا يمكن أن يكون في المستقبل';
      }
    }

    // Validate proof image
    if (!paymentForm.proofImage) {
      newErrors.proofImage = 'صورة إثبات الدفع مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          proofImage: 'يجب أن يكون الملف صورة'
        }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          proofImage: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت'
        }));
        return;
      }

      setPaymentForm(prev => ({
        ...prev,
        proofImage: file
      }));
      
      setErrors(prev => ({
        ...prev,
        proofImage: ''
      }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الرقم إلى الحافظة"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء قبل المتابعة",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('proofImage', paymentForm.proofImage);
      formData.append('amount', course?.price || 0); // Auto-fill from course price
      formData.append('senderPhone', paymentForm.senderPhone);
      formData.append('studentPhone', paymentForm.studentPhone);
      formData.append('parentPhone', paymentForm.parentPhone);
      formData.append('transferTime', paymentForm.transferTime);

      const response = await fetch(`/api/courses/${courseId}/upload-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "✅ تم إرسال إثبات الدفع بنجاح",
          description: "تم إرسال إثبات الدفع بنجاح، في انتظار مراجعة المشرف."
        });
        
        // Reset form
        setPaymentForm({
          senderPhone: '',
          studentPhone: user?.phoneStudent || '',
          parentPhone: '',
          transferTime: '',
          proofImage: null
        });
        setShowForm(false);
        
        // Navigate to course details after a delay
        setTimeout(() => {
          navigate(`/courses/${courseId}`);
        }, 2000);
      } else {
        throw new Error(data.error || 'حدث خطأ أثناء رفع إثبات الدفع');
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: "❌ حدث خطأ أثناء إرسال البيانات",
        description: "حدث خطأ أثناء إرسال البيانات، برجاء المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات الدورة...</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">الدورة غير موجودة</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              الدورة المطلوبة غير موجودة أو تم حذفها
            </p>
            <Button onClick={() => navigate('/courses')}>
              العودة إلى الدورات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="mb-6 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة إلى الدورة
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              اشتراك في الدورة
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              أكمل عملية الدفع لتفعيل الدورة
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  معلومات الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {course.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{course.grade}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">الصف</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{course.subject}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">المادة</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">سعر الدورة</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {course.price} ج.م
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Vodafone Cash Instructions */}
            <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
                  <Smartphone className="h-5 w-5 mr-2" />
                  تعليمات الدفع عبر Vodafone Cash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">رقم Vodafone Cash</p>
                      <p className="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                        {showVodafoneNumber ? vodafoneNumber : '••••••••••'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVodafoneNumber(!showVodafoneNumber)}
                    >
                      {showVodafoneNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(vodafoneNumber)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      افتح تطبيق Vodafone Cash على هاتفك
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      أرسل مبلغ <strong>{course.price} ج.م</strong> إلى الرقم أعلاه
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      التقط صورة لإثبات التحويل
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      املأ النموذج أدناه وارفع الصورة
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => setShowForm(!showForm)}
                className="w-full"
                size="lg"
              >
                {showForm ? 'إخفاء النموذج' : 'بدء عملية الدفع'}
                <CreditCard className="h-4 w-4 mr-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Payment Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    نموذج إثبات الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Sender Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="senderPhone">رقم هاتف من أرسل المال</Label>
                        <Input
                          id="senderPhone"
                          type="tel"
                          value={paymentForm.senderPhone}
                          onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className={errors.senderPhone ? 'border-red-500' : ''}
                        />
                        {errors.senderPhone && (
                          <p className="text-sm text-red-500">{errors.senderPhone}</p>
                        )}
                        <p className="text-xs text-gray-500">رقم هاتف الشخص الذي أرسل المال عبر Vodafone Cash</p>
                      </div>

                      {/* Student Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="studentPhone">رقم هاتف الطالب</Label>
                        <Input
                          id="studentPhone"
                          type="tel"
                          value={paymentForm.studentPhone}
                          onChange={(e) => handleInputChange('studentPhone', e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className={errors.studentPhone ? 'border-red-500' : ''}
                        />
                        {errors.studentPhone && (
                          <p className="text-sm text-red-500">{errors.studentPhone}</p>
                        )}
                        <p className="text-xs text-gray-500">رقم هاتف الطالب المسجل في النظام</p>
                      </div>

                      {/* Parent Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">رقم هاتف ولي الأمر (اختياري)</Label>
                        <Input
                          id="parentPhone"
                          type="tel"
                          value={paymentForm.parentPhone}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          placeholder="01xxxxxxxxx"
                        />
                      </div>


                      {/* Transfer Time */}
                      <div className="space-y-2">
                        <Label htmlFor="transferTime">وقت التحويل</Label>
                        <Input
                          id="transferTime"
                          type="datetime-local"
                          value={paymentForm.transferTime}
                          onChange={(e) => handleInputChange('transferTime', e.target.value)}
                          className={errors.transferTime ? 'border-red-500' : ''}
                        />
                        {errors.transferTime && (
                          <p className="text-sm text-red-500">{errors.transferTime}</p>
                        )}
                      </div>
                    </div>

                    {/* Proof Image Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="proofImage">صورة إثبات الدفع</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          id="proofImage"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label htmlFor="proofImage" className="cursor-pointer">
                          {paymentForm.proofImage ? (
                            <div className="space-y-2">
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                              <p className="text-sm text-green-600 dark:text-green-400">
                                تم اختيار الصورة: {paymentForm.proofImage.name}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                اضغط لاختيار صورة إثبات الدفع
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, JPEG حتى 5 ميجابايت
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                      {errors.proofImage && (
                        <p className="text-sm text-red-500">{errors.proofImage}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        disabled={uploading}
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="submit"
                        disabled={uploading}
                        className="min-w-[120px]"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            رفع الإثبات
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="backdrop-blur-sm bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    ملاحظة أمنية
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    جميع البيانات محمية ومشفرة. لن يتم مشاركة معلوماتك الشخصية مع أي طرف ثالث.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionFlow;