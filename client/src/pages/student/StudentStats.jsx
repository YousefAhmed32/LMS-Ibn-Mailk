import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import { 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity, 
  Star,
  CheckCircle,
  AlertTriangle,
  X,
  BarChart3,
  PieChart,
  LineChart,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Zap,
  Trophy,
  Crown,
  Flame,
  Rocket,
  Users
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// Luxury Card Component
const LuxuryCard = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const StudentStats = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Charts data
  const [gradeProgression, setGradeProgression] = useState([
    { month: 'يناير', grade: 75 },
    { month: 'فبراير', grade: 82 },
    { month: 'مارس', grade: 78 },
    { month: 'أبريل', grade: 85 },
    { month: 'مايو', grade: 88 },
    { month: 'يونيو', grade: 92 },
    { month: 'يوليو', grade: 89 },
    { month: 'أغسطس', grade: 91 },
    { month: 'سبتمبر', grade: 87 },
    { month: 'أكتوبر', grade: 94 }
  ]);
  const [subjectDistribution, setSubjectDistribution] = useState([
    { subject: 'الرياضيات', score: 92 },
    { subject: 'العلوم', score: 88 },
    { subject: 'اللغة العربية', score: 85 },
    { subject: 'اللغة الإنجليزية', score: 90 },
    { subject: 'التاريخ', score: 87 },
    { subject: 'الجغرافيا', score: 83 }
  ]);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [completionRates, setCompletionRates] = useState([
    { name: 'مكتمل', value: 75, color: '#10B981' },
    { name: 'قيد التقدم', value: 20, color: '#F59E0B' },
    { name: 'لم يبدأ', value: 5, color: '#EF4444' }
  ]);
  
  // Ref to prevent multiple API calls
  const isFetchingRef = useRef(false);

  // Fetch student statistics data
  const fetchStudentStats = useCallback(async () => {
    if (!user?._id) return;
    
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      // Use the comprehensive API endpoint
      const response = await axiosInstance.get(`/api/parent/student/${user._id}/comprehensive`, {
        timeout: 30000
      });
      
      if (response.data.success) {
        const data = response.data;
        
        // Update student data
        setStudentData(data.student);
        setStatistics(data.statistics);
        setEnrolledCourses(data.enrolledCourses || []);
        setGradesData(data.examResults || []);
        
        // Update charts data
        if (data.progressCharts) {
          const charts = data.progressCharts;
          setGradeProgression(charts.gradeProgression || []);
          setSubjectDistribution(charts.subjectDistribution || []);
          setAttendanceChart(charts.attendanceChart || []);
          setCompletionRates(charts.completionRates || []);
        }
        
      } else {
        console.error('API returned error:', response.data.message);
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل الإحصائيات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل إحصائياتك من قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?._id]);

  useEffect(() => {
    fetchStudentStats();
  }, [fetchStudentStats]);

  // Handle refresh
  const handleRefresh = () => {
    fetchStudentStats();
  };

  // Handle back to dashboard
  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">جاري تحميل إحصائياتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Luxury Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <motion.button
                onClick={handleBack}
                className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </motion.button>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <BarChart3 size={28} className="text-white" />
                </div>
                <div>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                  >
                    إحصائياتي الأكاديمية
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-yellow-500" />
                    {studentData?.firstName} {studentData?.secondName} - {studentData?.grade}
                  </motion.p>
                </div>
              </div>
              
              {/* Parent Dashboard Button - Only show if user is a parent */}
              {user?.role === 'parent' && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/parent/dashboard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Users size={18} />
                  لوحة تحكم ولي الأمر
                </motion.button>
              )}
            </div>
            
            <motion.button
              onClick={handleRefresh}
              className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={24} className="text-white group-hover:animate-spin" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {studentData && statistics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Luxury Stats Overview */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <BookOpen size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">إجمالي الكورسات</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.totalCourses || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">مقررات مسجلة</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Trophy size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">الكورسات المكتملة</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.completedCourses || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">مقررات منجزة</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-8 shadow-2xl hover:shadow-orange-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Star size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">متوسط الدرجات</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.averageGrade || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">تقييم ممتاز</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Calendar size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">معدل الحضور</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.attendanceRate || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">حضور منتظم</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>
              </motion.div>

              {/* Additional Luxury Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 p-8 shadow-2xl hover:shadow-rose-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Target size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">الاختبارات المجتازة</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.examsPassed || 0}
                        </p>
                        <p className="text-white/60 text-xs">من أصل {statistics.totalExams || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Rocket size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">أداء مميز</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-8 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Award size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">أعلى درجة</p>
                        <p className="text-4xl font-bold text-white">
                          {statistics.highestGrade || 0}%
                        </p>
                        <p className="text-white/60 text-xs">أفضل أداء</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">إنجاز رائع</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 p-8 shadow-2xl hover:shadow-teal-500/25 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Activity size={28} className="text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-sm font-medium">آخر نشاط</p>
                        <p className="text-2xl font-bold text-white">
                          {statistics.lastActivity || 'غير محدد'}
                        </p>
                        <p className="text-white/60 text-xs">نشاط حديث</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-300" />
                      <p className="text-white/70 text-sm">نشط ومتفاعل</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </motion.div>
              </motion.div>

              {/* Luxury Course Progress Summary */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
                      <BarChart3 size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        تقدم الكورسات
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        متابعة مستمرة لتقدمك الأكاديمي
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses && enrolledCourses.length > 0 ? (
                      enrolledCourses.map((course, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-600/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex-1">
                                <h5 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-1">
                                  {course.courseName || 'كورس غير محدد'}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {course.instructorName || 'غير محدد'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                  {course.progress || 0}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {course.completedLessons || 0}/{course.totalLessons || 0}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress || 0}%` }}
                                  transition={{ delay: 0.2 * index, duration: 1 }}
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    (course.progress || 0) >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                    (course.progress || 0) >= 70 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                    (course.progress || 0) >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                                    'bg-gradient-to-r from-red-400 to-pink-500'
                                  }`}
                                ></motion.div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                course.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                course.subscriptionStatus === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {course.subscriptionStatus === 'Active' ? 'نشط' :
                                 course.subscriptionStatus === 'Completed' ? 'مكتمل' : 
                                 course.subscriptionStatus === 'Expired' ? 'منتهي' : 'غير محدد'}
                              </span>
                              <div className="flex items-center gap-1">
                                {(course.progress || 0) >= 90 ? (
                                  <Trophy size={16} className="text-yellow-500" />
                                ) : (course.progress || 0) >= 70 ? (
                                  <Star size={16} className="text-blue-500" />
                                ) : (course.progress || 0) >= 50 ? (
                                  <Target size={16} className="text-orange-500" />
                                ) : (
                                  <Clock size={16} className="text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full text-center py-12"
                      >
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 inline-block">
                          <BookOpen size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                          لا توجد كورسات مسجلة حالياً
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          ابدأ رحلتك التعليمية بتسجيل كورسات جديدة
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Luxury Recent Exam Results */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                      <Award size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        آخر نتائج الامتحانات
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        تتبع أداءك في الاختبارات الأخيرة
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {gradesData && gradesData.length > 0 ? (
                      gradesData.slice(0, 5).map((grade, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-600/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6 rtl:space-x-reverse">
                                <div className={`p-4 rounded-2xl shadow-lg ${
                                  (grade.percentage || 0) >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                  (grade.percentage || 0) >= 70 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                                  (grade.percentage || 0) >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                                  'bg-gradient-to-r from-red-400 to-pink-500'
                                }`}>
                                  {(grade.percentage || 0) >= 90 ? (
                                    <Trophy size={24} className="text-white" />
                                  ) : (grade.percentage || 0) >= 70 ? (
                                    <Star size={24} className="text-white" />
                                  ) : (grade.percentage || 0) >= 50 ? (
                                    <Target size={24} className="text-white" />
                                  ) : (
                                    <AlertTriangle size={24} className="text-white" />
                                  )}
                                </div>
                                <div>
                                  <h5 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                    {grade.examTitle || 'امتحان غير محدد'}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {grade.courseName || 'غير محدد'} • {grade.examDate || 'غير محدد'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                  {grade.studentScore || 0}/{grade.totalScore || 0}
                                </div>
                                <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                                  (grade.percentage || 0) >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  (grade.percentage || 0) >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  (grade.percentage || 0) >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {grade.percentage || 0}% - {grade.grade || 'غير محدد'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 inline-block">
                          <Award size={64} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                          لا توجد نتائج امتحانات
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">
                          ابدأ أداء الامتحانات لرؤية نتائجك هنا
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Charts Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Grade Progression Line Chart */}
                <LuxuryCard className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <LineChart size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        تطور الدرجات عبر الوقت
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        تتبع تقدمك الأكاديمي
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={gradeProgression}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6B7280"
                          fontSize={12}
                          tick={{ fill: '#6B7280' }}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          fontSize={12}
                          tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="grade" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </LuxuryCard>

                {/* Test Scores Distribution Bar Chart */}
                <LuxuryCard className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                      <BarChart3 size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        توزيع درجات الاختبارات
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        أداءك في كل مادة
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={subjectDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="subject" 
                          stroke="#6B7280"
                          fontSize={12}
                          tick={{ fill: '#6B7280' }}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          fontSize={12}
                          tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Bar 
                          dataKey="score" 
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </LuxuryCard>

                {/* Completion Rates Pie Chart */}
                <LuxuryCard className="p-8 col-span-1 lg:col-span-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
                      <PieChart size={32} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        معدلات إكمال المهام
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-500" />
                        توزيع إنجازاتك
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={completionRates}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {completionRates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </LuxuryCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentStats;
