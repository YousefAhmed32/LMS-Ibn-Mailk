import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Target,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';

const SummaryCards = ({ analytics, users, courses, payments }) => {
  const { isDark } = useTheme();

  // Calculate metrics
  const totalUsers = users?.total || 0;
  const activeUsers = users?.active || 0;
  const totalCourses = courses?.total || 0;
  const activeCourses = courses?.active || 0;
  const totalRevenue = payments?.revenue || 0;
  const pendingPayments = payments?.pending || 0;
  const totalViews = analytics?.totalViews || 0;
  const watchTime = analytics?.watchTime || 0;

  const summaryCards = [
    {
      title: 'إجمالي الطلاب',
      value: totalUsers.toLocaleString(),
      subtitle: `${activeUsers} نشط`,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      shadowColor: 'shadow-blue-100 dark:shadow-blue-900/20'
    },
    {
      title: 'إجمالي الدورات',
      value: totalCourses.toLocaleString(),
      subtitle: `${activeCourses} نشط`,
      change: '+8%',
      changeType: 'positive',
      icon: BookOpen,
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      shadowColor: 'shadow-green-100 dark:shadow-green-900/20'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${totalRevenue.toLocaleString()} ج.م`,
      subtitle: 'هذا الشهر',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'from-purple-500 via-violet-600 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      shadowColor: 'shadow-purple-100 dark:shadow-purple-900/20'
    },
    {
      title: 'المدفوعات المعلقة',
      value: pendingPayments.toLocaleString(),
      subtitle: 'تحتاج مراجعة',
      change: '-5%',
      changeType: 'negative',
      icon: CreditCard,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      shadowColor: 'shadow-orange-100 dark:shadow-orange-900/20'
    },
    {
      title: 'إجمالي المشاهدات',
      value: totalViews.toLocaleString(),
      subtitle: 'هذا الشهر',
      change: '+18%',
      changeType: 'positive',
      icon: Eye,
      gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      shadowColor: 'shadow-indigo-100 dark:shadow-indigo-900/20'
    },
    {
      title: 'ساعات المشاهدة',
      value: `${watchTime.toLocaleString()} ساعة`,
      subtitle: 'هذا الشهر',
      change: '+25%',
      changeType: 'positive',
      icon: Clock,
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      shadowColor: 'shadow-pink-100 dark:shadow-pink-900/20'
    }
  ];

  const getTrendIcon = (changeType) => {
    return changeType === 'positive' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (changeType) => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = getTrendIcon(card.changeType);
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="group cursor-pointer"
          >
            <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${card.bgColor} ${card.borderColor} border-2 ${card.shadowColor}`}>
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-4 w-4 ${getTrendColor(card.changeType)}`} />
                    <span className={`text-sm font-semibold ${getTrendColor(card.changeType)}`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    {card.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {card.subtitle}
                  </p>
                </div>
                
                {/* Animated border */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
