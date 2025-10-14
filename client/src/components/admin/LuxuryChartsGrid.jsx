import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Users,
  DollarSign,
  Eye,
  Clock,
  Calendar,
  Zap,
  BookOpen,
  CreditCard,
  Target,
  Award
} from 'lucide-react';

const LuxuryChart = ({ 
  title, 
  data = [], 
  type = 'bar', 
  height = 'h-64',
  isLoading = false,
  delay = 0,
  icon: Icon = BarChart3,
  color = 'text-blue-500',
  bgColor = 'bg-blue-50 dark:bg-blue-900/20',
  description = null
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

  const getMaxValue = () => {
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map(item => item.value || 0));
  };

  const maxValue = getMaxValue();

  const renderBarChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              لا توجد بيانات للعرض
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-end justify-between h-full px-4 pb-4">
        {data.map((item, index) => {
          const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <motion.div
              key={item.label || index}
              initial={{ height: 0 }}
              animate={{ height: `${heightPercentage}%` }}
              transition={{ delay: delay + index * 0.1, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center flex-1 mx-1"
            >
              <div className="text-center mb-2">
                <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {formatValue(item.value)}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  {item.label}
                </div>
              </div>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: delay + index * 0.1 + 0.3, duration: 0.6 }}
                className={`w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 min-h-[20px]`}
                style={{ 
                  height: `${Math.max(heightPercentage, 5)}%`,
                  transformOrigin: 'bottom'
                }}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <TrendingUp className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              لا توجد بيانات للعرض
            </p>
          </div>
        </div>
      );
    }

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 50;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative h-full p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeInOut" }}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={points}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 50;
          return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + index * 0.1 + 0.5 }}
              className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"
              style={{ 
                left: `calc(${x}% - 6px)`, 
                top: `calc(${y}% - 6px)` 
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <PieChart className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              لا توجد بيانات للعرض
            </p>
          </div>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative h-full flex items-center justify-center">
        <svg className="w-32 h-32" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const colors = [
              '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', 
              '#10B981', '#EF4444', '#06B6D4', '#84CC16'
            ];
            
            cumulativePercentage += percentage;
            
            return (
              <motion.path
                key={index}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: delay + index * 0.1, duration: 0.8 }}
                d={`M 50 50 L ${50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180)} ${50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180)} A 40 40 0 ${percentage > 50 ? 1 : 0} 1 ${50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180)} ${50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180)} Z`}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {data.length}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              عنصر
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">
            <div className={`h-8 w-8 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded-full mx-auto mb-4`} />
            <div className={`h-4 w-24 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} rounded mx-auto`} />
          </div>
        </div>
      );
    }

    switch (type) {
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'bar':
      default:
        return renderBarChart();
    }
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
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-5 ${bgColor.replace('bg-', 'bg-gradient-to-br from-')}`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              {description && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className={`${height} w-full`}>
          {renderChart()}
        </div>

        {/* Legend for pie charts */}
        {type === 'pie' && data && data.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item, index) => {
              const colors = [
                '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', 
                '#10B981', '#EF4444', '#06B6D4', '#84CC16'
              ];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + index * 0.1 + 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Icon className={`h-16 w-16 ${color}`} />
      </div>
    </motion.div>
  );
};

const LuxuryChartsGrid = ({ analytics, isLoading = false, timePeriod = 'all' }) => {
  const { isDark } = useTheme();

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <LuxuryChart
            key={i}
            title="لا توجد بيانات"
            data={[]}
            isLoading={false}
            delay={i * 0.1}
          />
        ))}
      </div>
    );
  }

  const { users, courses, payments, activity } = analytics;

  // Prepare chart data
  const usersByGradeData = users?.byGrade?.map(item => ({
    label: `الصف ${item._id}`,
    value: item.count
  })) || [];

  const coursesBySubjectData = courses?.bySubject?.map(item => ({
    label: item._id,
    value: item.count
  })) || [];

  const monthlyRevenueData = payments?.monthlyRevenue?.map(item => ({
    label: `${item._id.month}/${item._id.year}`,
    value: item.revenue
  })) || [];

  const paymentMethodData = payments?.paymentMethodDistribution?.map(item => ({
    label: item._id,
    value: item.count
  })) || [];

  const activityTrendData = activity?.activityTrend?.map(item => ({
    label: `${item._id.day}/${item._id.month}`,
    value: item.views
  })) || [];

  const topCoursesData = courses?.topCourses?.slice(0, 5).map(item => ({
    label: item.title,
    value: item.enrollmentCount || 0
  })) || [];

  return (
    <div className="space-y-8">
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LuxuryChart
          title="الطلاب حسب الصف"
          data={usersByGradeData}
          type="bar"
          height="h-64"
          icon={Users}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
          description="توزيع الطلاب حسب المراحل الدراسية"
          isLoading={isLoading}
          delay={0}
        />

        <LuxuryChart
          title="الدورات حسب المادة"
          data={coursesBySubjectData}
          type="pie"
          height="h-64"
          icon={BookOpen}
          color="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
          description="توزيع الدورات حسب المواد الدراسية"
          isLoading={isLoading}
          delay={0.1}
        />

        <LuxuryChart
          title="الإيرادات الشهرية"
          data={monthlyRevenueData}
          type="line"
          height="h-64"
          icon={DollarSign}
          color="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
          description="نمو الإيرادات عبر الأشهر"
          isLoading={isLoading}
          delay={0.2}
        />

        <LuxuryChart
          title="طرق الدفع"
          data={paymentMethodData}
          type="pie"
          height="h-64"
          icon={CreditCard}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
          description="توزيع طرق الدفع المستخدمة"
          isLoading={isLoading}
          delay={0.3}
        />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LuxuryChart
          title="نشاط المشاهدة"
          data={activityTrendData}
          type="line"
          height="h-48"
          icon={Activity}
          color="text-indigo-500"
          bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          description="اتجاه المشاهدات في آخر 7 أيام"
          isLoading={isLoading}
          delay={0.4}
        />

        <LuxuryChart
          title="أفضل الدورات"
          data={topCoursesData}
          type="bar"
          height="h-48"
          icon={TrendingUp}
          color="text-teal-500"
          bgColor="bg-teal-50 dark:bg-teal-900/20"
          description="الدورات الأكثر اشتراكاً"
          isLoading={isLoading}
          delay={0.5}
        />
      </div>
    </div>
  );
};

export default LuxuryChartsGrid;
