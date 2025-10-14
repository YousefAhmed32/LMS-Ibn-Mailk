import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Input from '../ui/input';
import Label from '../ui/label';
import Button from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { 
  Upload, 
  Phone, 
  User, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Send,
  X
} from 'lucide-react';
import axios from 'axios';

const PaymentProofUpload = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    senderNumber: '',
    studentNumber: '',
    parentNumber: '',
    paymentImage: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Phone number validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // File validation
  const validateFile = (file) => {
    if (!file) return 'صورة إثبات الدفع مطلوبة';
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يرجى اختيار صورة JPG أو PNG أو GIF';
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت';
    }
    
    return null;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate sender number
    if (!formData.senderNumber.trim()) {
      newErrors.senderNumber = 'رقم المرسل مطلوب';
    } else if (!validatePhoneNumber(formData.senderNumber)) {
      newErrors.senderNumber = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate student number
    if (!formData.studentNumber.trim()) {
      newErrors.studentNumber = 'رقم الطالبة مطلوب';
    } else if (!validatePhoneNumber(formData.studentNumber)) {
      newErrors.studentNumber = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate parent number (required)
    if (!formData.parentNumber.trim()) {
      newErrors.parentNumber = 'رقم ولي الأمر مطلوب';
    } else if (!validatePhoneNumber(formData.parentNumber)) {
      newErrors.parentNumber = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate payment image
    const fileError = validateFile(formData.paymentImage);
    if (fileError) {
      newErrors.paymentImage = fileError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      paymentImage: file
    }));
    
    // Clear error when user selects a file
    if (errors.paymentImage) {
      setErrors(prev => ({
        ...prev,
        paymentImage: ''
      }));
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      paymentImage: null
    }));
    // Reset file input
    const fileInput = document.getElementById('paymentImage');
    if (fileInput) fileInput.value = '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء قبل الإرسال",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append('senderNumber', formData.senderNumber);
      submitData.append('studentNumber', formData.studentNumber);
      submitData.append('parentNumber', formData.parentNumber);
      submitData.append('paymentImage', formData.paymentImage);

      // Submit to backend
      const response = await axios.post('/api/payment-proof', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "✅ تم إرسال إثبات الدفع بنجاح",
          description: "سيتم المراجعة من قبل الإدارة"
        });
        
        // Reset form after success
        setTimeout(() => {
          resetForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Payment proof upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || "حدث خطأ أثناء إرسال إثبات الدفع";
      toast({
        title: "❌ خطأ في الإرسال",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      senderNumber: '',
      studentNumber: '',
      parentNumber: '',
      paymentImage: null
    });
    setErrors({});
    setIsSuccess(false);
    // Reset file input
    const fileInput = document.getElementById('paymentImage');
    if (fileInput) fileInput.value = '';
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              تم إرسال إثبات الدفع بنجاح
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              في انتظار موافقة الإدارة
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full"
            >
              إرسال إثبات جديد
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-4"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            رفع إثبات الدفع
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            يرجى ملء البيانات المطلوبة ورفع صورة إثبات الدفع
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Number */}
            <div>
              <Label htmlFor="senderNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم المرسل <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="senderNumber"
                  name="senderNumber"
                  type="tel"
                  value={formData.senderNumber}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`pr-10 ${errors.senderNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.senderNumber && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.senderNumber}
                </motion.p>
              )}
            </div>

            {/* Student Number */}
            <div>
              <Label htmlFor="studentNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم الطالبة <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  type="tel"
                  value={formData.studentNumber}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`pr-10 ${errors.studentNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.studentNumber && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.studentNumber}
                </motion.p>
              )}
            </div>

            {/* Parent Number (Required) */}
            <div>
              <Label htmlFor="parentNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                رقم ولي الأمر <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="parentNumber"
                  name="parentNumber"
                  type="tel"
                  value={formData.parentNumber}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`pr-10 ${errors.parentNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  dir="ltr"
                />
              </div>
              {errors.parentNumber && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.parentNumber}
                </motion.p>
              )}
            </div>


            {/* Payment Image Upload */}
            <div>
              <Label htmlFor="paymentImage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                صورة إيصال الدفع <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1">
                {!formData.paymentImage ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      id="paymentImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="paymentImage" className="cursor-pointer">
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          اضغط لاختيار صورة إثبات الدفع
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, GIF حتى 5 ميجابايت
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Image className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.paymentImage.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(formData.paymentImage.size / 1024 / 1024).toFixed(2)} ميجابايت
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {errors.paymentImage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.paymentImage}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    إرسال إثبات الدفع
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentProofUpload;
