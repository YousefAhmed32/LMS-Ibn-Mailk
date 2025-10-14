import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from '../hooks/use-toast';
import PageWrapper from '../components/layout/PageWrapper';
import LuxuryCard from '../components/ui/LuxuryCard';
import LuxuryButton from '../components/ui/LuxuryButton';
import {
  BookOpen,
  Play,
  Clock,
  Star,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Users,
  GraduationCap,
  Zap,
  Brain,
  Trophy,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import axiosInstance from '../api/axiosInstance';

const ModernDashboardUser = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalWatchTime: 0,
    averageScore: 0,
    completionPercentage: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [chartData, setChartData] = useState({
    progressOverTime: [],
    scoreDistribution: [],
    weeklyWatchTime: []
  });

  // Fetch user statistics
  const fetchUserStats = async () => {
    // Validate user and userId before making API call
    if (!user || !user.id) {
      console.warn('User or user.id is not available');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/user/${user.id}/stats`);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل الإحصائيات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإحصائيات",
        variant: "destructive",
      });
    }
  };

  // Fetch recent courses
  const fetchRecentCourses = async () => {
    // Validate user and userId before making API call
    if (!user || !user.id) {
      console.warn('User or user.id is not available');
      return;
    }

    try {
      const response = await axiosInstance.get(`/api/user/${user.id}/courses/recent`);
      
      if (response.data.success) {
        setRecentCourses(response.data.data);
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل الكورسات الأخيرة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الكورسات الأخيرة",
        variant: "destructive",
      });
    }
  };

  // Generate mock chart data (replace with real API data)
  const generateChartData = () => {
    const progressOverTime = [
      { month: 'يناير', progress: 65 },
      { month: 'فبراير', progress: 72 },
      { month: 'مارس', progress: 78 },
      { month: 'أبريل', progress: 85 },
      { month: 'مايو', progress: 88 },
      { month: 'يونيو', progress: 92 }
    ];

    const scoreDistribution = [
      { name: 'ممتاز (90-100)', value: 35, color: '#10B981' },
      { name: 'جيد جداً (80-89)', value: 40, color: '#3B82F6' },
      { name: 'جيد (70-79)', value: 20, color: '#F59E0B' },
      { name: 'مقبول (60-69)', value: 5, color: '#EF4444' }
    ];

    const weeklyWatchTime = [
      { week: 'الأسبوع 1', hours: 12 },
      { week: 'الأسبوع 2', hours: 18 },
      { week: 'الأسبوع 3', hours: 15 },
      { week: 'الأسبوع 4', hours: 22 },
      { week: 'الأسبوع 5', hours: 20 },
      { week: 'الأسبوع 6', hours: 25 }
    ];

    setChartData({
      progressOverTime,
      scoreDistribution,
      weeklyWatchTime
    });
  };

  useEffect(() => {
    const loadData = async () => {
      // Only load data if user is available
      if (!user || !user.id) {
        console.log('User not available, skipping data load');
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchUserStats(),
        fetchRecentCourses(),
        generateChartData()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.id]); // Only depend on user.id

  // Format time duration
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  // Stats cards data
  const statsCards = [
    {
      title: 'إجمالي الكورسات',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'وقت المشاهدة',
      value: formatTime(stats.totalWatchTime),
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'متوسط الدرجات',
      value: stats.averageScore.toFixed(1),
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      change: '+0.3',
      changeType: 'positive'
    },
    {
      title: 'نسبة الإكمال',
      value: `${stats.completionPercentage}%`,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      change: '+8%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="p-8 rounded-full bg-white dark:bg-gray-800 shadow-lg"
          >
            <Brain size={32} className="text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // Show message if user is not available
  if (!user || !user.id) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center max-w-md mx-auto p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center"
            >
              <Users size={48} className="text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              يرجى تسجيل الدخول
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              يجب عليك تسجيل الدخول أولاً لعرض لوحة التحكم
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <Users size={20} />
              تسجيل الدخول
            </motion.button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                >
                  <GraduationCap size={32} className="text-white" />
                </motion.div>
                
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
                  >
                    مرحباً {user.firstName} {user.secondName}
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block ml-2"
                    >
                      👋
                    </motion.span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-gray-600 dark:text-gray-300 text-lg"
                  >
                    تابع تقدمك التعليمي واستكشف إنجازاتك
                  </motion.p>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <LuxuryButton
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  تحديث البيانات
                </LuxuryButton>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Sparkles size={16} />
                  <span className="font-medium">طالب مميز</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <LuxuryCard className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={stat.iconColor} />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">
                          {stat.value}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        <TrendingUp size={14} />
                        {stat.change}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        من الشهر الماضي
                      </span>
                    </div>
                  </LuxuryCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Progress Over Time Chart */}
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    تطور التقدم
                  </h3>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  آخر 6 أشهر
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.progressOverTime}>
                    <defs>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#progressGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </LuxuryCard>

            {/* Score Distribution Chart */}
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <PieChart size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    توزيع الدرجات
                  </h3>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  هذا الفصل
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {chartData.scoreDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Weekly Watch Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="mb-8"
          >
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Activity size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    وقت المشاهدة الأسبوعي
                  </h3>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  آخر 6 أسابيع
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.weeklyWatchTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </LuxuryCard>
          </motion.div>

          {/* Recent Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <BookOpen size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    الكورسات الأخيرة
                  </h3>
                </div>
                <LuxuryButton variant="outline" className="flex items-center gap-2">
                  <Eye size={16} />
                  عرض الكل
                  <ArrowRight size={16} />
                </LuxuryButton>
              </div>
              
              <div className="space-y-4">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen size={20} className="text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {course.lastAccessed}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatTime(course.duration || 0)}
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress}%` }}
                              transition={{ delay: 1.8 + index * 0.1, duration: 1 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600 dark:text-gray-400">التقدم</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {course.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <LuxuryButton className="flex items-center gap-2">
                        <Play size={16} />
                        متابعة
                      </LuxuryButton>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      لا توجد كورسات متاحة حالياً
                    </p>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ModernDashboardUser;
