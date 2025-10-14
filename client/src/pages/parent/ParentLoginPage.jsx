import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { Eye, EyeOff, Lock, Mail, Users, ArrowRight, AlertCircle } from 'lucide-react';

const ParentLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle pre-filled email and message from navigation
  useEffect(() => {
    if (location.state) {
      if (location.state.preFilledEmail) {
        setFormData(prev => ({
          ...prev,
          email: location.state.preFilledEmail
        }));
      }
      if (location.state.message) {
        setMessage(location.state.message);
        toast({
          title: "معلومة مهمة",
          description: location.state.message,
          variant: "default",
        });
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast({
          title: "مرحباً بك",
          description: "تم تسجيل الدخول بنجاح",
        });
        
        // Get user data from localStorage to check role
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);
        
        // Redirect based on user role
        if (userData && userData.role === 'parent') {
          console.log('Redirecting to parent dashboard');
          navigate('/parent/dashboard');
        } else {
          console.log('Redirecting to general dashboard');
          navigate('/dashboard');
        }
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
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
            <Users size={32} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2"
          >
            لوحة تحكم ولي الأمر
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300"
          >
            تابع أداء طفلك الأكاديمي
          </motion.p>
          
          {/* Message from navigation */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-blue-400" />
                <p className="text-blue-300 text-sm">{message}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <Link
              to="/register"
              className="block text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
            >
              ليس لديك حساب؟ إنشاء حساب جديد
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-gray-300 text-sm">أو</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>
            
            <Link
              to="/login"
              className="block text-gray-300 hover:text-white transition-colors duration-200"
            >
              تسجيل دخول كطالب أو معلم
            </Link>
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Users size={24} className="text-orange-400" />
            </div>
            <h3 className="text-white font-semibold mb-1">متابعة الأداء</h3>
            <p className="text-gray-300 text-sm">تابع درجات طفلك وتقدمه الأكاديمي</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-1">التقارير التفصيلية</h3>
            <p className="text-gray-300 text-sm">احصل على تقارير شاملة عن أداء طفلك</p>
          </div>
          
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users size={24} className="text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-1">التواصل المباشر</h3>
            <p className="text-gray-300 text-sm">تواصل مع المعلمين والإدارة</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParentLoginPage;
