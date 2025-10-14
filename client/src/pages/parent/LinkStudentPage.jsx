import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { 
  Users, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Mail,
  Phone,
  UserCheck
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const LinkStudentPage = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [linkedParent, setLinkedParent] = useState(null);
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const handleSearchStudent = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال معرف الطالب",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/parent/search-student', {
        studentId: studentId.trim()
      });

      if (response.data.success) {
        setStudentInfo(response.data.student);
        setLinkedParent(null);
        // Send OTP
        await sendOTP(response.data.student);
      } else {
        // Check if student is already linked to another parent
        if (response.data.linkedParent) {
          setLinkedParent(response.data.linkedParent);
          setStudentInfo(null);
          toast({
            title: "الطالب مرتبط بالفعل",
            description: `هذا الطالب مرتبط بالفعل بحساب ولي أمر آخر`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "خطأ",
            description: response.data.message || "لم يتم العثور على الطالب",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء البحث عن الطالب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (student) => {
    try {
      const response = await axiosInstance.post('/api/parent/send-otp', {
        studentId: student._id,
        parentId: user._id
      });

      if (response.data.success) {
        setOtpSent(true);
        toast({
          title: "تم إرسال رمز التحقق",
          description: "تم إرسال رمز التحقق إلى البريد الإلكتروني أو الهاتف المسجل",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال رمز التحقق",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/parent/verify-otp', {
        studentId: studentInfo._id,
        parentId: user._id,
        otpCode: otpCode.trim()
      });

      if (response.data.success) {
        toast({
          title: "تم الربط بنجاح",
          description: "تم ربط حسابك بحساب الطالب بنجاح",
        });
        navigate('/parent/dashboard');
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "رمز التحقق غير صحيح",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في التحقق من الرمز",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyStudentId = async () => {
    try {
      await navigator.clipboard.writeText(studentId);
      toast({
        title: "تم النسخ",
        description: "تم نسخ معرف الطالب",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ معرف الطالب",
        variant: "destructive",
      });
    }
  };

  const navigateToParentAccount = () => {
    // Navigate to parent login page with pre-filled email
    navigate('/parent/login', { 
      state: { 
        preFilledEmail: linkedParent.userEmail,
        message: `هذا الطالب مرتبط بحساب ولي الأمر: ${linkedParent.firstName} ${linkedParent.lastName}`
      } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)'
            }}
          >
            <UserCheck size={32} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            ربط حساب الطالب
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300"
          >
            أدخل معرف الطالب لربط حسابك بحساب طفلك
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-6">البحث عن الطالب</h2>
            
            <form onSubmit={handleSearchStudent} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  معرف الطالب
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="أدخل معرف الطالب (مثال: STU12345678)"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  يمكنك الحصول على معرف الطالب من الإدارة أو من الطالب نفسه
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)'
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري البحث...
                  </div>
                ) : (
                  <>
                    <span>البحث عن الطالب</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Student Info & OTP */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Student Info */}
            {studentInfo && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={24} className="text-green-400" />
                  <h3 className="text-lg font-bold text-white">معلومات الطالب</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-orange-400" />
                    <div>
                      <p className="text-white font-semibold">
                        {studentInfo.firstName} {studentInfo.secondName}
                      </p>
                      <p className="text-gray-300 text-sm">
                        معرف الطالب: {studentInfo.studentId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-blue-400" />
                    <p className="text-gray-300">{studentInfo.userEmail}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-green-400" />
                    <p className="text-gray-300">{studentInfo.phoneStudent}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Parent Info */}
            {linkedParent && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={24} className="text-red-400" />
                  <h3 className="text-lg font-bold text-white">الطالب مرتبط بالفعل</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-300 text-sm mb-2">
                      هذا الطالب مرتبط بالفعل بحساب ولي أمر آخر
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Users size={20} className="text-red-400" />
                        <div>
                          <p className="text-white font-semibold">
                            {linkedParent.firstName} {linkedParent.lastName}
                          </p>
                          <p className="text-gray-300 text-sm">
                            ولي الأمر المرتبط
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Mail size={20} className="text-blue-400" />
                        <p className="text-gray-300">{linkedParent.userEmail}</p>
                      </div>
                      
                      {linkedParent.phoneParent && (
                        <div className="flex items-center gap-3">
                          <Phone size={20} className="text-green-400" />
                          <p className="text-gray-300">{linkedParent.phoneParent}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={navigateToParentAccount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <span>الانتقال لحساب ولي الأمر</span>
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              </div>
            )}

            {/* OTP Verification */}
            {otpSent && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={24} className="text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">التحقق من الهوية</h3>
                </div>
                
                <p className="text-gray-300 mb-4">
                  تم إرسال رمز التحقق إلى البريد الإلكتروني أو الهاتف المسجل للطالب
                </p>
                
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">
                      رمز التحقق
                    </label>
                    <input
                      type="text"
                      placeholder="أدخل رمز التحقق المكون من 6 أرقام"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 text-center text-2xl tracking-widest"
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري التحقق...
                      </div>
                    ) : (
                      <>
                        <span>التحقق من الرمز</span>
                        <CheckCircle size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-semibold mb-3">تعليمات مهمة:</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                  <span>تأكد من أن معرف الطالب صحيح ومطابق تماماً</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                  <span>سيتم إرسال رمز التحقق إلى الطالب للتحقق من الهوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                  <span>يمكن ربط طالب واحد فقط بحساب ولي الأمر</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LinkStudentPage;
