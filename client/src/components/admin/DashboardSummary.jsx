import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  CreditCard, 
  Eye,
  Clock,
  DollarSign,
  Activity,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const DashboardSummary = ({ analytics, users, courses, payments }) => {
  const { isDark } = useTheme();

  // Calculate key metrics
  const totalUsers = users?.total || 0;
  const totalCourses = courses?.total || 0;
  const totalRevenue = payments?.revenue || 0;
  const totalViews = analytics?.totalViews || 0;
  const activeUsers = users?.active || 0;
  const pendingPayments = payments?.pending || 0;

  const summaryCards = [
    {
      title: 'المستخدمين النشطين',
      value: activeUsers,
      total: totalUsers,
      percentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: 'up'
    },
    {
      title: 'الدورات المتاحة',
      value: totalCourses,
      total: totalCourses,
      percentage: 100,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: 'up'
    },
    {
      title: 'المدفوعات المعلقة',
      value: pendingPayments,
      total: payments?.total || 0,
      percentage: payments?.total > 0 ? Math.round((pendingPayments / payments.total) * 100) : 0,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: 'down'
    },
    {
      title: 'إجمالي المشاهدات',
      value: totalViews,
      total: totalViews,
      percentage: 100,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      trend: 'up'
    }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          ملخص الأداء
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            const TrendIcon = getTrendIcon(card.trend);
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 ${card.bgColor} border-l-4 border-l-blue-500`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${getTrendColor(card.trend)}`} />
                    <span className={`text-sm font-medium ${getTrendColor(card.trend)}`}>
                      {card.percentage}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  {card.total !== card.value && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      من أصل {card.total.toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                النظام يعمل بكفاءة
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                جميع الخدمات متاحة
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Target className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                الأهداف محققة
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                نمو إيجابي في جميع المؤشرات
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Zap className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                الأداء ممتاز
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                استجابة سريعة ومستقرة
              </p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
