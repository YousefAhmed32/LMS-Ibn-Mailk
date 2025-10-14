import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Plus, 
  Users, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  BarChart3,
  Settings,
  Download,
  Upload,
  Bell,
  Zap,
  TrendingUp,
  FileText,
  Shield,
  Activity
} from 'lucide-react';

const QuickActions = ({ onAction }) => {
  const { isDark } = useTheme();

  const quickActions = [
    {
      id: 'add-course',
      title: 'إضافة دورة جديدة',
      description: 'إنشاء دورة تعليمية جديدة',
      icon: BookOpen,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      hoverGradient: 'from-blue-600 via-blue-700 to-indigo-700',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      shadowColor: 'shadow-blue-100 dark:shadow-blue-900/20'
    },
    {
      id: 'add-user',
      title: 'إضافة مستخدم',
      description: 'تسجيل مستخدم جديد',
      icon: Users,
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      hoverGradient: 'from-green-600 via-emerald-700 to-teal-700',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      shadowColor: 'shadow-green-100 dark:shadow-green-900/20'
    },
    {
      id: 'view-payments',
      title: 'مراجعة المدفوعات',
      description: 'عرض ومراجعة المدفوعات المعلقة',
      icon: CreditCard,
      gradient: 'from-purple-500 via-violet-600 to-purple-600',
      hoverGradient: 'from-purple-600 via-violet-700 to-purple-700',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      shadowColor: 'shadow-purple-100 dark:shadow-purple-900/20'
    },
    {
      id: 'view-messages',
      title: 'الرسائل الجديدة',
      description: 'عرض الرسائل غير المقروءة',
      icon: MessageSquare,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      hoverGradient: 'from-orange-600 via-amber-700 to-yellow-700',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      shadowColor: 'shadow-orange-100 dark:shadow-orange-900/20'
    },
    {
      id: 'analytics',
      title: 'التحليلات',
      description: 'عرض التقارير والإحصائيات',
      icon: BarChart3,
      gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
      hoverGradient: 'from-indigo-600 via-blue-700 to-cyan-700',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      shadowColor: 'shadow-indigo-100 dark:shadow-indigo-900/20'
    },
    {
      id: 'export-data',
      title: 'تصدير البيانات',
      description: 'تصدير تقارير النظام',
      icon: Download,
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      hoverGradient: 'from-pink-600 via-rose-700 to-red-700',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      shadowColor: 'shadow-pink-100 dark:shadow-pink-900/20'
    }
  ];

  return (
    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
            إجراءات سريعة
          </span>
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          الوصول السريع إلى المهام الأساسية
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
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
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
                onClick={() => onAction && onAction(action.id)}
              >
                <div className={`relative overflow-hidden rounded-2xl ${action.bgColor} ${action.borderColor} border-2 ${action.shadowColor} shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-opacity-60`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    
                    {/* Animated border */}
                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${action.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
