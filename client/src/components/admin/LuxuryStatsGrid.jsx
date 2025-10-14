import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp, 
  Eye, 
  Clock,
  DollarSign,
  Target,
  Activity,
  Zap,
  BarChart3,
  Percent,
  Timer,
  UserCheck,
  Award
} from 'lucide-react';

const LuxuryStatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon, 
  color, 
  bgColor, 
  description,
  isLoading = false,
  delay = 0,
  trend = null,
  subtitle = null
}) => {
  const { isDark } = useTheme();

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`
        relative overflow-hidden rounded-3xl p-6
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border-2 shadow-xl hover:shadow-2xl
        transition-all duration-300 ease-out
        ${isLoading ? 'animate-pulse' : ''}
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-5 ${bgColor.replace('bg-', 'bg-gradient-to-br from-')}`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          
          {change && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={`
                flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium
                ${changeType === 'positive' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }
              `}
            >
              <TrendingUp className={`h-3 w-3 ${changeType === 'positive' ? 'rotate-0' : 'rotate-180'}`} />
              <span>{change}</span>
            </motion.div>
          )}
        </div>

        {/* Main Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="mb-2"
        >
          <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            ) : (
              formatValue(value)
            )}
          </h3>
        </motion.div>

        {/* Title */}
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={`text-lg font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
        >
          {title}
        </motion.h4>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </motion.p>
        )}

        {/* Trend Line */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.8 }}
            className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ transformOrigin: 'left' }}
          />
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Icon className={`h-16 w-16 ${color}`} />
      </div>
    </motion.div>
  );
};

const LuxuryStatsGrid = ({ analytics, isLoading = false, timePeriod = 'all' }) => {
  const { isDark } = useTheme();

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <LuxuryStatCard
            key={i}
            title="لا توجد بيانات"
            value={0}
            icon={Activity}
            color="text-gray-400"
            bgColor="bg-gray-100"
            isLoading={false}
            delay={i * 0.1}
          />
        ))}
      </div>
    );
  }

  const { users, courses, payments, activity, performance } = analytics;

  // Calculate percentage changes (mock for now, in real app would compare with previous period)
  const getPercentageChange = (current, previous = 0) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const stats = [
    {
      title: 'إجمالي الطلاب',
      value: users?.total || 0,
      change: getPercentageChange(users?.total || 0, (users?.total || 0) * 0.8),
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'جميع الطلاب المسجلين',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'إجمالي الدورات',
      value: courses?.total || 0,
      change: getPercentageChange(courses?.total || 0, (courses?.total || 0) * 0.9),
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'جميع الدورات المتاحة',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'إجمالي المدفوعات',
      value: payments?.total || 0,
      change: getPercentageChange(payments?.total || 0, (payments?.total || 0) * 0.85),
      changeType: 'positive',
      icon: CreditCard,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'جميع طلبات الدفع',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${payments?.revenue || 0} ج.م`,
      change: getPercentageChange(payments?.revenue || 0, (payments?.revenue || 0) * 0.8),
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'من المدفوعات المعتمدة',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'إجمالي المشاهدات',
      value: activity?.totalViews || 0,
      change: getPercentageChange(activity?.totalViews || 0, (activity?.totalViews || 0) * 0.9),
      changeType: 'positive',
      icon: Eye,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'من جميع الفيديوهات',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'ساعات المشاهدة',
      value: `${activity?.watchTime || 0} ساعة`,
      change: getPercentageChange(activity?.watchTime || 0, (activity?.watchTime || 0) * 0.85),
      changeType: 'positive',
      icon: Clock,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      description: 'إجمالي وقت المشاهدة',
      subtitle: timePeriod === 'all' ? 'منذ البداية' : `في ${timePeriod}`,
      trend: true
    },
    {
      title: 'معدل التحويل',
      value: `${performance?.conversionRate || 0}%`,
      change: getPercentageChange(performance?.conversionRate || 0, (performance?.conversionRate || 0) * 0.9),
      changeType: performance?.conversionRate > 10 ? 'positive' : 'negative',
      icon: Target,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'من المستخدمين إلى العملاء',
      subtitle: 'معدل التحويل العام',
      trend: true
    },
    {
      title: 'معدل الإكمال',
      value: `${performance?.completionRate || 0}%`,
      change: getPercentageChange(performance?.completionRate || 0, (performance?.completionRate || 0) * 0.95),
      changeType: performance?.completionRate > 50 ? 'positive' : 'negative',
      icon: Award,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      description: 'إكمال الدورات',
      subtitle: 'معدل إكمال الدورات',
      trend: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <LuxuryStatCard
            key={stat.title}
            {...stat}
            isLoading={isLoading}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Payment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LuxuryStatCard
          title="في الانتظار"
          value={payments?.pending || 0}
          change={getPercentageChange(payments?.pending || 0, (payments?.pending || 0) * 0.8)}
          changeType="neutral"
          icon={Clock}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          description="تتطلب مراجعة"
          subtitle="مدفوعات معلقة"
          delay={0.8}
        />
        
        <LuxuryStatCard
          title="معتمدة"
          value={payments?.approved || 0}
          change={getPercentageChange(payments?.approved || 0, (payments?.approved || 0) * 0.9)}
          changeType="positive"
          icon={UserCheck}
          color="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
          description={`إيرادات: ${payments?.revenue || 0} ج.م`}
          subtitle="مدفوعات معتمدة"
          delay={0.9}
        />
        
        <LuxuryStatCard
          title="مرفوضة"
          value={payments?.rejected || 0}
          change={getPercentageChange(payments?.rejected || 0, (payments?.rejected || 0) * 0.7)}
          changeType="negative"
          icon={Target}
          color="text-red-500"
          bgColor="bg-red-50 dark:bg-red-900/20"
          description="تم رفضها من قبل الإدارة"
          subtitle="مدفوعات مرفوضة"
          delay={1.0}
        />
      </div>
    </div>
  );
};

export default LuxuryStatsGrid;