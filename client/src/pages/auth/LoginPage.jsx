import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { Eye, EyeOff, Lock, Phone, Users, Star, Sparkles, Rocket } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Generate floating stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 5
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.phoneNumber || !formData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01234567890)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Use the correct login method from AuthContext
      const result = await login(formData.phoneNumber, formData.password);
      
      if (result && result.success) {
        // Get user data from localStorage to determine role
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = userData?.role;
        
        // Check if user role has changed
        const previousRole = localStorage.getItem('previousRole');
        const roleChanged = previousRole && previousRole !== userRole;
        
        // Store current role for next login
        localStorage.setItem('previousRole', userRole);
        
        // Show appropriate message based on role change
        if (roleChanged) {
          toast({
            title: "تم تغيير نوع الحساب",
            description: `تم تغيير نوع حسابك من ${getRoleText(previousRole)} إلى ${getRoleText(userRole)}`,
            variant: "default",
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحباً بك في منصة ابن مالك${userRole === 'admin' ? ' - لوحة الإدارة' : ''}`,
          });
        }
        
        // Role-based redirect - immediate redirect for better UX
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else if (userRole === 'parent') {
          navigate('/parent/dashboard', { replace: true });
        } else {
          navigate('/courses', { replace: true });
        }
        
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result?.error || "حدث خطأ أثناء تسجيل الدخول",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get role text in Arabic
  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'student':
        return 'طالب';
      case 'parent':
        return 'ولي أمر';
      default:
        return 'مستخدم';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.3, star.opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: star.animationDelay,
            }}
          />
        ))}
        
        {/* Floating Particles */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-80"
          animate={{
            y: [0, -30, 0],
            x: [0, -15, 0],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-70"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Additional Space Elements */}
        <motion.div
          className="absolute top-1/6 right-1/6 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60"
          animate={{
            y: [0, -15, 0],
            x: [0, -10, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md sm:max-w-lg lg:max-w-xl"
        >
          {/* Glowing Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-slate-800/90 backdrop-blur-xl">
            {/* Card Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-lg blur-xl"></div>
            
            {/* Card Border Glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 p-[1px]">
              <div className="h-full w-full rounded-lg bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-slate-800/90"></div>
            </div>

            <CardHeader className="relative text-center pb-6">
              {/* Logo with Space Theme */}
              <motion.div 
                className="flex justify-center mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl">
                    <Rocket className="text-white text-2xl" />
                  </div>
                  {/* Orbiting Stars */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <CardTitle className="text-3xl p-2 font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  تسجيل الدخول
                </CardTitle>
                <p className="text-gray-300 text-lg">
                  مرحباً بك في منصة ابن مالك التعليمية
                </p>
                <div className="flex justify-center mt-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="text-yellow-400 w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Field */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="phoneNumber" className="text-gray-200 font-semibold text-lg">
                    رقم الهاتف
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="أدخل رقم هاتفك (مثال: 01234567890)"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="pl-12 h-14 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 relative z-10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Label htmlFor="password" className="text-gray-200 font-semibold text-lg">
                    كلمة المرور
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-12 pr-12 h-14 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 relative z-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors z-20"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 hover:from-blue-600 hover:via-purple-700 hover:to-cyan-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <motion.div 
                          className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="group-hover:text-blue-100 transition-colors">جاري تسجيل الدخول...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Rocket className="h-5 w-5 mr-2" />
                        </motion.div>
                        <span className="group-hover:text-blue-100 transition-colors">تسجيل الدخول</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Footer Links */}
              <motion.div 
                className="mt-8 text-center space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <motion.p 
                  className="text-gray-300 text-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  ليس لديك حساب؟{' '}
                  <Link
                    to="/register"
                    className="text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 hover:underline hover:text-blue-200"
                  >
                    إنشاء حساب جديد
                  </Link>
                </motion.p>
                
                <div className="flex items-center gap-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                  <motion.span 
                    className="text-gray-400 text-lg font-bold"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    أو
                  </motion.span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to="/parent/login"
                    className="inline-flex items-center gap-4 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-xl transform bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Users size={20} />
                    </motion.div>
                    <span className="group-hover:text-orange-100 transition-colors">تسجيل دخول كولي أمر</span>
                  </Link>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
