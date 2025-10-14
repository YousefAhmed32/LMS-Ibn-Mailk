import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Users, 
  GraduationCap,
  Heart,
  Calendar,
  UserCheck,
  Star,
  Sparkles,
  Rocket,
  Circle,
  Zap
} from 'lucide-react';

const RegisterPage = () => {
  const [accountType, setAccountType] = useState('student');
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneStudent: '',
    guardianPhone: '', // Added guardian phone field
    governorate: '',
    grade: '',
    age: '',
    studentRelation: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState([]);
  const [planets, setPlanets] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate floating stars and planets
  useEffect(() => {
    const generateSpaceElements = () => {
      const newStars = [];
      const newPlanets = [];
      
      // Generate stars
      for (let i = 0; i < 80; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.9 + 0.1,
          animationDelay: Math.random() * 5,
          color: ['white', 'blue', 'purple', 'cyan'][Math.floor(Math.random() * 4)]
        });
      }
      
      // Generate planets
      for (let i = 0; i < 5; i++) {
        newPlanets.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 10,
          color: ['blue', 'purple', 'cyan', 'orange', 'pink'][i],
          animationDelay: Math.random() * 3
        });
      }
      
      setStars(newStars);
      setPlanets(newPlanets);
    };
    generateSpaceElements();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent password field from getting email values
    if (name === 'password' && value.includes('@')) {
      // If somehow an email is being set as password, clear it
      console.warn('Preventing email from being set as password');
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAccountTypeChange = (value) => {
    setAccountType(value);
    setFormData({
      ...formData,
      role: value,
      // Clear role-specific fields when switching
      grade: value === 'parent' ? '' : formData.grade,
      age: value === 'parent' ? '' : formData.age,
      studentRelation: value === 'student' ? '' : formData.studentRelation
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Log form data before submission
    console.log('Form data before submission:', formData);
    console.log('Password field value:', formData.password);
    console.log('Email field value:', formData.email);
    
    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    
    // Validate password is not an email address
    if (emailRegex.test(formData.password)) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور لا يمكن أن تكون عنوان بريد إلكتروني",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    // Validate Egyptian phone numbers
    if (formData.role === 'student') {
      if (!phoneRegex.test(formData.phoneStudent)) {
        toast({
          title: "خطأ في رقم الهاتف",
          description: "يرجى إدخال رقم هاتف مصري صحيح (مثال: 01234567890)",
          variant: "destructive",
        });
        return;
      }
      
      if (!phoneRegex.test(formData.guardianPhone)) {
        toast({
          title: "خطأ في رقم هاتف ولي الأمر",
          description: "يرجى إدخال رقم هاتف ولي الأمر صحيح (مثال: 01234567890)",
          variant: "destructive",
        });
        return;
      }
    }

    // Map frontend data to backend schema
    const backendData = {
      firstName: formData.firstName.trim(),
      secondName: formData.secondName.trim(),
      thirdName: formData.thirdName.trim(),
      fourthName: formData.fourthName.trim(),
      email: formData.email.toLowerCase().trim(), // Backend expects 'email', not 'userEmail'
      password: formData.password,
      role: formData.role
    };

    // Add role-specific fields
    if (formData.role === 'student') {
      backendData.phoneStudent = formData.phoneStudent.trim();
      backendData.guardianPhone = formData.guardianPhone.trim();
      backendData.governorate = formData.governorate;
      backendData.grade = formData.grade; // This will be the Arabic grade value
    } else if (formData.role === 'parent') {
      backendData.phoneNumber = formData.phoneStudent.trim();
      backendData.relation = formData.studentRelation;
    }

    console.log('📤 Sending to backend:', backendData);

    setLoading(true);

    try {
      const result = await register(backendData);
      if (result.success) {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `مرحباً بك في منصة ابن مالك${accountType === 'parent' ? ' - لوحة أولياء الأمور' : ''}`,
        });
        
        // Redirect based on account type
        if (accountType === 'parent') {
          navigate('/parent/dashboard');
        } else {
          navigate('/courses');
        }
      } else {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: result.error || "حدث خطأ أثناء إنشاء الحساب",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const studentRelationOptions = [
    { value: 'father', label: 'أب' },
    { value: 'mother', label: 'أم' },
    { value: 'guardian', label: 'ولي أمر' },
    { value: 'grandfather', label: 'جد' },
    { value: 'grandmother', label: 'جدة' },
    { value: 'uncle', label: 'عم/خال' },
    { value: 'aunt', label: 'عمة/خالة' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Stars */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute rounded-full bg-${star.color}-400`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.3, star.opacity],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: star.animationDelay,
            }}
          />
        ))}
        
        {/* Floating Planets */}
        {planets.map((planet) => (
          <motion.div
            key={planet.id}
            className={`absolute rounded-full bg-${planet.color}-500/20 border border-${planet.color}-400/30`}
            style={{
              left: `${planet.x}%`,
              top: `${planet.y}%`,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + planet.id * 2,
              repeat: Infinity,
              ease: "linear",
              delay: planet.animationDelay,
            }}
          />
        ))}
        
        {/* Comet Trail */}
        <motion.div
          className="absolute top-1/3 left-0 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
          animate={{
            x: ['-100%', '100vw'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Additional Space Elements */}
        <motion.div
          className="absolute top-1/6 right-1/6 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-50"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60"
          animate={{
            y: [0, -20, 0],
            x: [0, -15, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        <motion.div
          className="absolute top-2/3 right-1/5 w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-70"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl"
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
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl">
                    <Circle className="text-white text-3xl" />
                  </div>
                  {/* Orbiting Elements */}
                  <motion.div
                    className="absolute -top-3 -right-3 w-4 h-4 bg-yellow-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -bottom-3 -left-3 w-3 h-3 bg-blue-400 rounded-full"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute top-1/2 -right-6 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
              </div>
            </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              إنشاء حساب جديد
            </CardTitle>
                <p className="text-gray-300 text-xl">
              انضم إلى منصة ابن مالك التعليمية
            </p>
                <div className="flex justify-center mt-4 gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="text-yellow-400 w-6 h-6" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="text-blue-400 w-5 h-5" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="text-purple-400 w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
          </CardHeader>
          
            <CardContent className="relative space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Type Selection */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label className="text-gray-200 text-xl font-bold">
                  نوع الحساب
                </Label>
                <div className="grid grid-cols-2 gap-6">
                  <motion.button
                    type="button"
                    onClick={() => handleAccountTypeChange('student')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                      accountType === 'student'
                        ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-2xl shadow-blue-500/25 scale-105'
                        : 'border-slate-600 bg-slate-700/30 hover:border-blue-400 hover:bg-blue-500/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <div className="relative flex items-center justify-center space-x-4">
                      <GraduationCap 
                        className={`h-8 w-8 ${
                          accountType === 'student' 
                            ? 'text-blue-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <span className={`font-bold text-lg ${
                        accountType === 'student' 
                          ? 'text-blue-300' 
                          : 'text-gray-300'
                      }`}>
                        طالب
                      </span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => handleAccountTypeChange('parent')}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                      accountType === 'parent'
                        ? 'border-orange-400 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-2xl shadow-orange-500/25 scale-105'
                        : 'border-slate-600 bg-slate-700/30 hover:border-orange-400 hover:bg-orange-500/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    />
                    <div className="relative flex items-center justify-center space-x-4">
                      <Heart 
                        className={`h-8 w-8 ${
                          accountType === 'parent' 
                            ? 'text-orange-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <span className={`font-bold text-lg ${
                        accountType === 'parent' 
                          ? 'text-orange-300' 
                          : 'text-gray-300'
                      }`}>
                        ولي أمر
                      </span>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Basic Information */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-gray-200 font-bold text-lg">
                    الاسم الأول
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="الاسم الأول"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="pl-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="secondName" className="text-gray-200 font-bold text-lg">
                    الاسم الثاني
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                      id="secondName"
                      name="secondName"
                      type="text"
                      placeholder="الاسم الثاني"
                      value={formData.secondName}
                      onChange={handleChange}
                      required
                      className="pl-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="thirdName" className="text-gray-200 font-bold text-lg">
                    الاسم الثالث
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="thirdName"
                      name="thirdName"
                      type="text"
                      placeholder="الاسم الثالث"
                      value={formData.thirdName}
                      onChange={handleChange}
                      required
                      className="pl-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="fourthName" className="text-gray-200 font-bold text-lg">
                    الاسم الرابع
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="fourthName"
                      name="fourthName"
                      type="text"
                      placeholder="الاسم الرابع"
                      value={formData.fourthName}
                      onChange={handleChange}
                      required
                      className="pl-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Email */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="email" className="text-gray-200 font-bold text-lg">
                  البريد الإلكتروني
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-purple-400 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-lg relative z-10"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                    initial={false}
                  />
                </div>
              </motion.div>

              {/* Dynamic Fields Based on Account Type */}
              <AnimatePresence mode="wait">
                {accountType === 'student' ? (
                  <motion.div
                    key="student-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    {/* Student Specific Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-gray-700 dark:text-gray-300 font-medium">
                          الصف الدراسي
                        </Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                          <Select value={formData.grade} onValueChange={(value) => handleSelectChange('grade', value)}>
                            <SelectTrigger className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-300">
                              <SelectValue placeholder="اختر الصف" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="أولى إعدادي">أولى إعدادي</SelectItem>
                              <SelectItem value="تانية إعدادي">تانية إعدادي</SelectItem>
                              <SelectItem value="تالتة إعدادي">تالتة إعدادي</SelectItem>
                              <SelectItem value="أولى ثانوي">أولى ثانوي</SelectItem>
                              <SelectItem value="تانية ثانوي">تانية ثانوي</SelectItem>
                              <SelectItem value="تالتة ثانوي">تالتة ثانوي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-700 dark:text-gray-300 font-medium">
                          العمر
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="العمر"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            min="12"
                            max="18"
                            className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phoneStudent" className="text-gray-700 dark:text-gray-300 font-medium">
                          رقم الهاتف
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="phoneStudent"
                            name="phoneStudent"
                            type="tel"
                            placeholder="01234567890"
                            value={formData.phoneStudent}
                            onChange={handleChange}
                            required
                            className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          مثال: 01234567890 أو +201234567890
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guardianPhone" className="text-gray-700 dark:text-gray-300 font-medium">
                          رقم هاتف ولي الأمر
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="guardianPhone"
                            name="guardianPhone"
                            type="tel"
                            placeholder="01234567890"
                            value={formData.guardianPhone}
                            onChange={handleChange}
                            required
                            className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-300"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          مثال: 01234567890 أو +201234567890
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="governorate" className="text-gray-700 dark:text-gray-300 font-medium">
                        المحافظة
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                        <Select value={formData.governorate} onValueChange={(value) => handleSelectChange('governorate', value)}>
                          <SelectTrigger className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500 transition-all duration-300">
                            <SelectValue placeholder="اختر المحافظة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cairo">القاهرة</SelectItem>
                            <SelectItem value="Giza">الجيزة</SelectItem>
                            <SelectItem value="Qalyubia">القليوبية</SelectItem>
                            <SelectItem value="Alexandria">الإسكندرية</SelectItem>
                            <SelectItem value="Port Said">بورسعيد</SelectItem>
                            <SelectItem value="Ismailia">الإسماعيلية</SelectItem>
                            <SelectItem value="Suez">السويس</SelectItem>
                            <SelectItem value="Damietta">دمياط</SelectItem>
                            <SelectItem value="Dakahlia">الدقهلية</SelectItem>
                            <SelectItem value="Sharqia">الشرقية</SelectItem>
                            <SelectItem value="Gharbia">الغربية</SelectItem>
                            <SelectItem value="Monufia">المنوفية</SelectItem>
                            <SelectItem value="Kafr El-Sheikh">كفر الشيخ</SelectItem>
                            <SelectItem value="Beheira">البحيرة</SelectItem>
                            <SelectItem value="Marsa Matrouh">مرسى مطروح</SelectItem>
                            <SelectItem value="Fayoum">الفيوم</SelectItem>
                            <SelectItem value="Beni Suef">بني سويف</SelectItem>
                            <SelectItem value="Minya">المنيا</SelectItem>
                            <SelectItem value="Assiut">أسيوط</SelectItem>
                            <SelectItem value="Sohag">سوهاج</SelectItem>
                            <SelectItem value="Qena">قنا</SelectItem>
                            <SelectItem value="Luxor">الأقصر</SelectItem>
                            <SelectItem value="Aswan">أسوان</SelectItem>
                            <SelectItem value="Red Sea">البحر الأحمر</SelectItem>
                            <SelectItem value="New Valley">الوادي الجديد</SelectItem>
                            <SelectItem value="North Sinai">شمال سيناء</SelectItem>
                            <SelectItem value="South Sinai">جنوب سيناء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="parent-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    {/* Parent Specific Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phoneStudent" className="text-gray-700 dark:text-gray-300 font-medium">
                          رقم الهاتف
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="phoneStudent"
                            name="phoneStudent"
                            type="tel"
                            placeholder="01234567890"
                            value={formData.phoneStudent}
                            onChange={handleChange}
                            required
                            className="pl-12 h-12 rounded-xl border-2 focus:border-orange-500 transition-all duration-300"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          مثال: 01234567890 أو +201234567890
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentRelation" className="text-gray-700 dark:text-gray-300 font-medium">
                          صلة القرابة
                        </Label>
                        <div className="relative">
                          <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                          <Select value={formData.studentRelation} onValueChange={(value) => handleSelectChange('studentRelation', value)}>
                            <SelectTrigger className="pl-12 h-12 rounded-xl border-2 focus:border-orange-500 transition-all duration-300">
                              <SelectValue placeholder="اختر صلة القرابة" />
                            </SelectTrigger>
                            <SelectContent>
                              {studentRelationOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Fields */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-200 font-bold text-lg">
                    كلمة المرور
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="كلمة المرور"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className="pl-14 pr-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 z-20"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-gray-200 font-bold text-lg">
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="تأكيد كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      className="pl-14 pr-14 h-16 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-lg relative z-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200 z-20"
                    >
                      {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-20 rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${
                    accountType === 'student'
                      ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-500 hover:from-blue-600 hover:via-purple-700 hover:to-cyan-600 hover:shadow-blue-500/25'
                      : 'bg-gradient-to-r from-orange-500 via-red-600 to-pink-500 hover:from-orange-600 hover:via-red-700 hover:to-pink-600 hover:shadow-orange-500/25'
                  } text-white`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <motion.div 
                        className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      جاري إنشاء الحساب...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {accountType === 'student' ? (
                        <GraduationCap className="h-6 w-6 mr-3" />
                      ) : (
                        <Heart className="h-6 w-6 mr-3" />
                      )}
                      إنشاء حساب {accountType === 'student' ? 'طالب' : 'ولي أمر'}
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Footer Links */}
            <motion.div 
              className="mt-10 text-center space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <motion.p 
                className="text-gray-300 text-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                لديك حساب بالفعل؟{' '}
                <Link
                  to="/login"
                  className="text-blue-400 hover:text-blue-300 font-bold transition-all duration-300 hover:underline hover:text-blue-200"
                >
                  تسجيل الدخول
                </Link>
              </motion.p>
              
              <div className="flex items-center gap-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <motion.span 
                  className="text-gray-400 text-xl font-bold"
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
                  className="inline-flex items-center gap-4 px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 hover:shadow-xl transform bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white relative overflow-hidden group"
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
                    <Users size={24} />
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

export default RegisterPage;