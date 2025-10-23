import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import axiosInstance from '../../api/axiosInstance';
// import dashboardService from '../../services/dashboardService'; // Removed - student dashboard service
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  Filter,
  Settings,
  UserPlus,
  BookOpenCheck,
  Clock,
  Star,
  Award,
  GraduationCap,
  FileText,
  Bell,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';

const ModernAdminDashboard = () => {
  const { isDark } = useTheme();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Chart colors with modern palette
  const colors = {
    primary: '#6366F1',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    teal: '#14B8A6',
    indigo: '#6366F1',
    orange: '#F97316',
    cyan: '#06B6D4',
    emerald: '#10B981',
    rose: '#F43F5E'
  };

  // Time period options
  const timePeriods = [
    { value: 'today', label: 'اليوم', icon: Calendar },
    { value: 'week', label: 'هذا الأسبوع', icon: Calendar },
    { value: 'month', label: 'هذا الشهر', icon: Calendar },
    { value: 'year', label: 'هذا العام', icon: Calendar },
    { value: 'all', label: 'الكل', icon: Calendar }
  ];

  // Navigation tabs
  const navigationTabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'students', label: 'الطلاب', icon: Users },
    { id: 'courses', label: 'الدورات', icon: BookOpen },
    { id: 'payments', label: 'المدفوعات', icon: CreditCard },
    { id: 'analytics', label: 'التحليلات', icon: TrendingUp }
  ];

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (timePeriod = selectedTimePeriod) => {
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data for period:', timePeriod);
      console.log('🔐 Using axiosInstance with baseURL:', axiosInstance.defaults.baseURL);
      
      // Check authentication state
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('🔐 Auth state:', { 
        hasToken: !!token, 
        hasUser: !!user,
        tokenLength: token?.length || 0,
        userData: user ? JSON.parse(user) : null
      });
      
      // Fetch real data from API with time period parameter
      console.log('🔐 AxiosInstance config:', {
        baseURL: axiosInstance.defaults.baseURL,
        timeout: axiosInstance.defaults.timeout,
        headers: axiosInstance.defaults.headers
      });
      
      const response = await axiosInstance.get(`/api/admin/dashboard-stats-simple?period=${timePeriod}`);
      console.log('✅ API response received:', response.data);
      console.log('🔍 Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        message: response.data.message,
        error: response.data.error
      });
      
      if (!response.data.success) {
        console.error('❌ API Error Details:', {
          success: response.data.success,
          message: response.data.message,
          error: response.data.error,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`API error: ${response.data.message || response.data.error || 'Unknown error'}`);
      }
      
      const data = response.data;
      setDashboardData(data);
      console.log('✅ Real API data loaded successfully:', data);
    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      setError(error.message || 'حدث خطأ في تحميل البيانات من الخادم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimePeriod]);

  // Handle time period change
  const handleTimePeriodChange = async (period) => {
    setSelectedTimePeriod(period);
    await fetchDashboardData(period);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  // Initialize dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">جاري تحميل لوحة التحكم</h3>
            <p className="text-gray-600 dark:text-gray-400">يرجى الانتظار...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={handleRefresh} disabled={refreshing} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, coursePerformance, studentEngagement } = dashboardData;

  // Ensure all required data exists with fallbacks
  const safeStats = {
    overview: stats?.overview || {
      totalStudents: 0,
      totalCourses: 0,
      totalRevenue: 0,
      totalPayments: 0,
      revenueGrowthPercent: 0
    },
    paymentStats: stats?.paymentStats || {
      pending: 0,
      accepted: 0,
      rejected: 0,
      pendingAmount: 0,
      acceptedAmount: 0,
      rejectedAmount: 0
    },
    charts: {
      revenueGrowth: stats?.charts?.revenueGrowth || [],
      usersByGrade: stats?.charts?.usersByGrade || [],
      courseDistribution: stats?.charts?.courseDistribution || []
    },
    recentPayments: stats?.recentPayments || [],
    topCourses: stats?.topCourses || [],
    recentStudents: stats?.recentStudents || []
  };

  const safeCoursePerformance = coursePerformance || [];
  const safeStudentEngagement = studentEngagement || [];

  // Calculate percentage changes
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // KPI Cards with modern design
  const kpiCards = [
    {
      title: 'إجمالي الطلاب',
      value: safeStats.overview.totalStudents,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: colors.primary,
      bgGradient: 'from-blue-500 to-indigo-600',
      description: 'جميع الطلاب المسجلين'
    },
    {
      title: 'إجمالي الدورات',
      value: safeStats.overview.totalCourses,
      change: '+8%',
      changeType: 'positive',
      icon: BookOpen,
      color: colors.secondary,
      bgGradient: 'from-emerald-500 to-teal-600',
      description: 'جميع الدورات المتاحة'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(safeStats.overview.totalRevenue || 0).toLocaleString()} ج.م`,
      change: `${safeStats.overview.revenueGrowthPercent > 0 ? '+' : ''}${safeStats.overview.revenueGrowthPercent}%`,
      changeType: safeStats.overview.revenueGrowthPercent >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: colors.accent,
      bgGradient: 'from-amber-500 to-orange-600',
      description: 'من المدفوعات المؤكدة'
    },
    {
      title: 'إجمالي المدفوعات',
      value: safeStats.overview.totalPayments,
      change: '+15%',
      changeType: 'positive',
      icon: CreditCard,
      color: colors.purple,
      bgGradient: 'from-purple-500 to-pink-600',
      description: 'جميع المعاملات'
    }
  ];

  // Payment status cards
  const paymentStatusCards = [
    {
      title: 'في الانتظار',
      value: safeStats.paymentStats.pending,
      amount: safeStats.paymentStats.pendingAmount,
      icon: AlertCircle,
      color: colors.accent,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      title: 'مؤكدة',
      value: safeStats.paymentStats.accepted,
      amount: safeStats.paymentStats.acceptedAmount,
      icon: CheckCircle,
      color: colors.secondary,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      title: 'مرفوضة',
      value: safeStats.paymentStats.rejected,
      amount: safeStats.paymentStats.rejectedAmount,
      icon: XCircle,
      color: colors.danger,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-xl shadow-xl border backdrop-blur-sm ${isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.name}: <span className="font-bold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
                لوحة التحكم الإدارية
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                نظرة شاملة على أداء المنصة والإحصائيات المهمة
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Period Filter */}
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
                {timePeriods.map((period) => {
                  const Icon = period.icon;
                  return (
                    <Button
                      key={period.value}
                      variant={selectedTimePeriod === period.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleTimePeriodChange(period.value)}
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        selectedTimePeriod === period.value 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{period.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">تحديث</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">تصدير</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.bgGradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        {card.changeType === 'positive' ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-semibold ${
                          card.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {card.change}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {card.value}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {paymentStatusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={`border-l-4 ${card.borderColor} hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5`} style={{ color: card.color }} />
                      </div>
                      <Badge className={`${card.bgColor} text-gray-700 dark:text-gray-300 border-0`}>
                        {card.value}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        المبلغ: <span className="font-semibold">{(card.amount || 0).toLocaleString()} ج.م</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  نمو الإيرادات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={safeStats.charts.revenueGrowth}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={colors.primary} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users by Grade Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  الطلاب حسب الصف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeStats.charts.usersByGrade}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="grade" 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDark ? '#9CA3AF' : '#6B7280'}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      fill={colors.secondary} 
                      radius={[8, 8, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

              {/* Recent Payments and Top Courses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          آخر المدفوعات
                        </div>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                          عرض الكل
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {safeStats.recentPayments.slice(0, 5).map((payment, index) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                payment.status === 'accepted' ? 'bg-emerald-500' : 
                                payment.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                              }`}></div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {payment.studentName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{payment.courseTitle}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">{(payment.amount || 0).toLocaleString()} ج.م</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(payment.date).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Top Courses */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          أفضل الدورات
                        </div>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                          عرض الكل
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {safeStats.topCourses.slice(0, 5).map((course, index) => (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                #{index + 1}
                              </Badge>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {course.title}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {course.subject} • {course.enrollments} طالب
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white">{(course.price || 0).toLocaleString()} ج.م</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">السعر</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Students by Grade Chart */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      توزيع الطلاب حسب الصف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={safeStats.charts.usersByGrade}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {safeStats.charts.usersByGrade.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Student Engagement */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      مشاركة الطلاب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {safeStudentEngagement.map((engagement, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{engagement.percentage}%</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{engagement.category}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{engagement.count} طالب</p>
                            </div>
                          </div>
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${engagement.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Students Table */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      قائمة الطلاب
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الاسم</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الصف</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المحافظة</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">تاريخ الانضمام</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeStats.recentStudents.slice(0, 10).map((student, index) => (
                          <tr key={student.id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{student.name?.charAt(0) || 'ط'}</span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{student.name || 'طالب'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.grade || 'غير محدد'}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.governorate || 'غير محدد'}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {student.joinDate ? new Date(student.joinDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle size={12} className="ml-1" />
                                نشط
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Course Performance */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      أداء الدورات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {safeCoursePerformance.map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{course.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{course.enrollments} طالب</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{course.completionRate}%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">معدل الإكمال</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Categories */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                        <PieChart className="h-4 w-4 text-white" />
                      </div>
                      توزيع الدورات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={safeStats.charts.courseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {safeStats.charts.courseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Courses Table */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      قائمة الدورات
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">اسم الدورة</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المادة</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الطلاب</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">السعر</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeStats.topCourses.slice(0, 10).map((course, index) => (
                          <tr key={course.id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{course.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.subject}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.enrollments}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{(course.price || 0).toLocaleString()} ج.م</td>
                            <td className="py-3 px-4">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle size={12} className="ml-1" />
                                نشط
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Payment Status Overview */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      حالة المدفوعات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentStatusCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                                <Icon className={`h-6 w-6`} style={{ color: card.color }} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{card.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{card.value} معاملة</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">{(card.amount || 0).toLocaleString()} ج.م</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">المبلغ الإجمالي</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Trend */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      اتجاه الإيرادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={safeStats.charts.revenueGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                        <XAxis 
                          dataKey="month" 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={colors.primary} 
                          strokeWidth={3}
                          dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Table */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      قائمة المدفوعات
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      عرض الكل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الطالب</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الدورة</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المبلغ</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التاريخ</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeStats.recentPayments.slice(0, 10).map((payment, index) => (
                          <tr key={payment.id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">{payment.studentName?.charAt(0) || 'ط'}</span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{payment.studentName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{payment.courseTitle}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{(payment.amount || 0).toLocaleString()} ج.م</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {new Date(payment.date).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${
                                payment.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                payment.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {payment.status === 'accepted' ? 'مؤكد' : 
                                 payment.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Performance Metrics */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      مؤشرات الأداء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">معدل التسجيل</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">85%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">معدل الإكمال</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">72%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">معدل الدفع</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Growth Metrics */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      مؤشرات النمو
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">نمو الطلاب</span>
                        </div>
                        <span className="font-bold text-emerald-600">+12%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">نمو الدورات</span>
                        </div>
                        <span className="font-bold text-emerald-600">+8%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">نمو الإيرادات</span>
                        </div>
                        <span className="font-bold text-emerald-600">+15%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      صحة النظام
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">الخادم</span>
                        </div>
                        <span className="font-bold text-green-600">ممتاز</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">قاعدة البيانات</span>
                        </div>
                        <span className="font-bold text-green-600">ممتاز</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">الأداء</span>
                        </div>
                        <span className="font-bold text-green-600">ممتاز</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      تحليل الأداء الشهري
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={safeStats.charts.revenueGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                        <XAxis 
                          dataKey="month" 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="revenue" 
                          fill={colors.purple} 
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                        <LineChart className="h-4 w-4 text-white" />
                      </div>
                      اتجاهات النمو
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={safeStats.charts.revenueGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                        <XAxis 
                          dataKey="month" 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke={isDark ? '#9CA3AF' : '#6B7280'}
                          fontSize={12}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={colors.orange} 
                          strokeWidth={3}
                          dot={{ fill: colors.orange, strokeWidth: 2, r: 6 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time Data Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6"
        >
          <Card className="bg-emerald-50/90 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 backdrop-blur-sm shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  البيانات محدثة
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernAdminDashboard;