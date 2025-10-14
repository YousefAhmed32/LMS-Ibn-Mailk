import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { uploadPaymentProof } from '../../store/slices/paymentSlice';
import paymentService from '../../services/paymentService';
import LuxuryButton from '../ui/LuxuryButton';
import { 
  Upload, 
  Phone, 
  User, 
  Image, 
  CheckCircle, 
  AlertCircle,
  Send,
  X,
  DollarSign,
  Calendar,
  FileImage,
  Trash2,
  Eye,
  CreditCard,
  Smartphone
} from 'lucide-react';

const EnhancedPaymentProofUpload = ({ courseId, courseTitle, coursePrice, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { uploading } = useSelector(state => state.payment);
  
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    courseId: courseId,
    senderPhone: '',
    studentPhone: '',
    parentPhone: '',
    amount: coursePrice || 0,
    transferTime: new Date().toISOString().slice(0, 16),
    paymentMethod: 'vodafone_cash',
    proofImage: null
  });
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    const validationErrors = paymentService.validateFile(file);
    if (validationErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        proofImage: validationErrors[0]
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      proofImage: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.proofImage) {
      setErrors(prev => ({
        ...prev,
        proofImage: ''
      }));
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      proofImage: null
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate sender phone
    if (!formData.senderPhone.trim()) {
      newErrors.senderPhone = 'رقم المرسل مطلوب';
    } else if (!paymentService.validatePhoneNumber(formData.senderPhone)) {
      newErrors.senderPhone = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate student phone
    if (!formData.studentPhone.trim()) {
      newErrors.studentPhone = 'رقم الطالبة مطلوب';
    } else if (!paymentService.validatePhoneNumber(formData.studentPhone)) {
      newErrors.studentPhone = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate parent phone (optional)
    if (formData.parentPhone && !paymentService.validatePhoneNumber(formData.parentPhone)) {
      newErrors.parentPhone = 'رقم هاتف غير صحيح. يجب أن يبدأ بـ 01 ويحتوي على 11 رقم';
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'المبلغ مطلوب ويجب أن يكون أكبر من صفر';
    }

    // Validate transfer time
    if (!formData.transferTime) {
      newErrors.transferTime = 'وقت التحويل مطلوب';
    }

    // Validate proof image
    if (!formData.proofImage) {
      newErrors.proofImage = 'صورة إثبات الدفع مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    try {
      // Create FormData
      const submitData = new FormData();
      submitData.append('courseId', formData.courseId);
      submitData.append('senderPhone', formData.senderPhone);
      submitData.append('studentPhone', formData.studentPhone);
      submitData.append('parentPhone', formData.parentPhone);
      submitData.append('amount', formData.amount);
      submitData.append('transferTime', formData.transferTime);
      submitData.append('paymentMethod', formData.paymentMethod);
      submitData.append('proofImage', formData.proofImage);

      const result = await dispatch(uploadPaymentProof(submitData)).unwrap();
      
      setIsSuccess(true);
      toast({
        title: "✅ تم إرسال إثبات الدفع بنجاح",
        description: "سيتم المراجعة من قبل الإدارة"
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Payment proof upload error:', error);
      toast({
        title: "❌ خطأ في الإرسال",
        description: error || "حدث خطأ أثناء إرسال إثبات الدفع",
        variant: "destructive"
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      courseId: courseId,
      senderPhone: '',
      studentPhone: '',
      parentPhone: '',
      amount: coursePrice || 0,
      transferTime: new Date().toISOString().slice(0, 16),
      paymentMethod: 'vodafone_cash',
      proofImage: null
    });
    setErrors({});
    setImagePreview(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div 
          className="rounded-2xl p-8 text-center shadow-2xl"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: colors.success + '20',
              border: `2px solid ${colors.success}30`
            }}
          >
            <CheckCircle size={40} color={colors.success} />
          </motion.div>
          
          <h3 
            className="text-2xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            تم إرسال إثبات الدفع بنجاح
          </h3>
          
          <p 
            className="text-lg mb-6"
            style={{ color: colors.textMuted }}
          >
            في انتظار موافقة الإدارة
          </p>
          
          <div className="flex gap-4 justify-center">
            <LuxuryButton
              onClick={resetForm}
              variant="outline"
              className="px-6 py-3"
            >
              إرسال إثبات جديد
            </LuxuryButton>
            {onCancel && (
              <LuxuryButton
                onClick={onCancel}
                className="px-6 py-3"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`
                }}
              >
                إغلاق
              </LuxuryButton>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}
            >
              <Upload size={24} color={colors.accent} />
            </div>
            <div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                رفع إثبات الدفع
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                {courseTitle} - {paymentService.formatAmount(coursePrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Information */}
          <div 
            className="p-4 rounded-xl"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}
          >
            <h3 
              className="text-lg font-semibold mb-3 flex items-center gap-2"
              style={{ color: colors.text }}
            >
              <DollarSign size={20} color={colors.accent} />
              معلومات الدورة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  عنوان الدورة
                </label>
                <input
                  type="text"
                  value={courseTitle}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background + '50',
                    color: colors.textMuted
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  المبلغ المطلوب
                </label>
                <input
                  type="text"
                  value={paymentService.formatAmount(coursePrice)}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background + '50',
                    color: colors.textMuted
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Phone */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                رقم المرسل <span style={{ color: colors.error }}>*</span>
              </label>
              <div className="relative">
                <Phone 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.senderPhone ? 'border-red-500' : ''
                  }`}
                  style={{
                    borderColor: errors.senderPhone ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  dir="ltr"
                />
              </div>
              {errors.senderPhone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle size={16} className="mr-1" />
                  {errors.senderPhone}
                </motion.p>
              )}
            </div>

            {/* Student Phone */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                رقم الطالبة <span style={{ color: colors.error }}>*</span>
              </label>
              <div className="relative">
                <User 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type="tel"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.studentPhone ? 'border-red-500' : ''
                  }`}
                  style={{
                    borderColor: errors.studentPhone ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  dir="ltr"
                />
              </div>
              {errors.studentPhone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle size={16} className="mr-1" />
                  {errors.studentPhone}
                </motion.p>
              )}
            </div>

            {/* Parent Phone */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                رقم ولي الأمر (اختياري)
              </label>
              <div className="relative">
                <Phone 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  placeholder="01012345678"
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.parentPhone ? 'border-red-500' : ''
                  }`}
                  style={{
                    borderColor: errors.parentPhone ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  dir="ltr"
                />
              </div>
              {errors.parentPhone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle size={16} className="mr-1" />
                  {errors.parentPhone}
                </motion.p>
              )}
            </div>

            {/* Transfer Time */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                وقت التحويل <span style={{ color: colors.error }}>*</span>
              </label>
              <div className="relative">
                <Calendar 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: colors.textMuted }}
                />
                <input
                  type="datetime-local"
                  name="transferTime"
                  value={formData.transferTime}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.transferTime ? 'border-red-500' : ''
                  }`}
                  style={{
                    borderColor: errors.transferTime ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                />
              </div>
              {errors.transferTime && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1 flex items-center"
                >
                  <AlertCircle size={16} className="mr-1" />
                  {errors.transferTime}
                </motion.p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              طريقة الدفع
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'vodafone_cash', label: 'Vodafone Cash', icon: Smartphone },
                { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: DollarSign },
                { value: 'cash', label: 'Cash', icon: DollarSign }
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.paymentMethod === method.value ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: formData.paymentMethod === method.value ? colors.accent : colors.border,
                    backgroundColor: formData.paymentMethod === method.value ? colors.accent + '10' : colors.background,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <method.icon size={20} color={colors.accent} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              صورة إثبات الدفع <span style={{ color: colors.error }}>*</span>
            </label>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver ? 'scale-105' : ''
              }`}
              style={{
                borderColor: isDragOver ? colors.accent : colors.border,
                backgroundColor: isDragOver ? colors.accent + '10' : colors.background + '50'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="proof-image-upload"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Payment proof preview"
                      className="w-48 h-32 object-cover rounded-lg shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 p-1 rounded-full"
                      style={{
                        backgroundColor: colors.error,
                        color: 'white'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    تم رفع الصورة بنجاح
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: colors.accent + '20',
                      border: `2px solid ${colors.accent}30`
                    }}
                  >
                    <FileImage size={32} color={colors.accent} />
                  </div>
                  <div>
                    <p 
                      className="text-lg font-medium"
                      style={{ color: colors.text }}
                    >
                      اسحب وأفلت الصورة هنا
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      أو انقر لاختيار ملف (JPG, PNG, WebP - حد أقصى 5MB)
                    </p>
                  </div>
                  <label
                    htmlFor="proof-image-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: colors.accent + '20',
                      border: `1px solid ${colors.accent}30`,
                      color: colors.accent
                    }}
                  >
                    <Upload size={18} />
                    اختيار صورة
                  </label>
                </div>
              )}
            </div>
            
            {errors.proofImage && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-1 flex items-center"
              >
                <AlertCircle size={16} className="mr-1" />
                {errors.proofImage}
              </motion.p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            {onCancel && (
              <LuxuryButton
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={uploading}
                className="px-6 py-3"
              >
                إلغاء
              </LuxuryButton>
            )}
            <LuxuryButton
              type="submit"
              disabled={uploading}
              className="px-6 py-3 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                boxShadow: `0 4px 16px ${colors.accent}30`
              }}
            >
              {uploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send size={18} />
                  </motion.div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send size={18} />
                  إرسال إثبات الدفع
                </>
              )}
            </LuxuryButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EnhancedPaymentProofUpload;
