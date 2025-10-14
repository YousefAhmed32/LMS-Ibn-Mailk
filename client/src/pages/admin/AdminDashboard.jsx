import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/use-toast';
import {
  fetchAdminAnalytics,
  fetchAllUsers,
  fetchAllCourses,
  fetchAllPayments
} from "../../store/slices/adminSlice";
import AdminOverview from "../../components/admin/AdminOverview";
import UsersManagement from "../../components/admin/UsersManagement";
import CoursesManagement from "../../components/admin/CoursesManagement";
import PaymentsManagement from "../../components/admin/PaymentsManagement";
import PaymentProofManagement from "../../components/admin/PaymentProofManagement";
import MessagingSystem from "../../components/admin/MessagingSystem";
import Settings from "../../components/admin/Settings";
import AdminNavigation from "../../components/admin/AdminNavigation";
import { 
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  MessageSquare,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  Activity,
  Zap,
  FileCheck,
  Target
} from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, users, courses, payments, loading } = useSelector((state) => state.admin);
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        dispatch(fetchAdminAnalytics()),
        dispatch(fetchAllUsers()),
        dispatch(fetchAllCourses()),
        dispatch(fetchAllPayments())
      ]);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "تم تحديث البيانات",
      description: "تم تحديث جميع البيانات بنجاح"
    });
  };

  const navigationItems = [
    {
      id: 'overview',
      name: 'نظرة عامة',
      icon: BarChart3,
      description: 'إحصائيات وإحصائيات عامة',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'users',
      name: 'إدارة المستخدمين',
      icon: Users,
      description: 'إدارة الطلاب والمعلمين',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'courses',
      name: 'إدارة الدورات',
      icon: BookOpen,
      description: 'إدارة الدورات والفيديوهات',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'payments',
      name: 'إدارة المدفوعات',
      icon: CreditCard,
      description: 'مراجعة وتأكيد المدفوعات',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'payment-proofs',
      name: 'إثباتات الدفع',
      icon: FileCheck,
      description: 'إدارة إثباتات الدفع',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800'
    },
    {
      id: 'quizzes',
      name: 'إدارة الاختبارات',
      icon: Target,
      description: 'إنشاء وإدارة الاختبارات',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800'
    },
    {
      id: 'messages',
      name: 'نظام الرسائل',
      icon: MessageSquare,
      description: 'التواصل مع الطلاب',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800'
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      icon: SettingsIcon,
      description: 'إعدادات النظام والتكوين',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800'
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <AdminNavigation />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              جاري تحميل لوحة التحكم...
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              يرجى الانتظار بينما نقوم بجمع البيانات
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleAnalyticsRefresh = async (timePeriod = 'all') => {
    try {
      setRefreshing(true);
      await Promise.all([
        dispatch(fetchAdminAnalytics({ timePeriod })),
        dispatch(fetchAllUsers()),
        dispatch(fetchAllCourses()),
        dispatch(fetchAllPayments())
      ]);
    } catch (error) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات لوحة التحكم",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminOverview 
            analytics={analytics} 
            users={users} 
            courses={courses} 
            payments={payments}
            onRefresh={handleAnalyticsRefresh}
            isLoading={loading}
          />
        );
      case 'users':
        return <UsersManagement users={users} />;
      case 'courses':
        return <CoursesManagement courses={courses} />;
      case 'payments':
        return <PaymentsManagement payments={payments} />;
      case 'payment-proofs':
        return <PaymentProofManagement />;
      case 'quizzes':
        return <div className="p-6 text-center text-gray-500">Quiz management has been removed.</div>;
      case 'messages':
        return <MessagingSystem />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <AdminOverview 
            analytics={analytics} 
            users={users} 
            courses={courses} 
            payments={payments}
            onRefresh={handleAnalyticsRefresh}
            isLoading={loading}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <AdminNavigation />
      
      {/* Main Content - No sidebar, full width layout */}
      <div className="pt-16">
        {/* Enhanced Top Bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b backdrop-blur-sm`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div>
                  <motion.h1 
                    key={activeTab}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {navigationItems.find(item => item.id === activeTab)?.name || 'لوحة التحكم'}
                  </motion.h1>
                  <motion.p 
                    key={`${activeTab}-desc`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {navigationItems.find(item => item.id === activeTab)?.description || 'إدارة النظام'}
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    تحديث البيانات
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-4">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? `${item.bgColor} ${item.borderColor} ${item.color} border-l-4 shadow-md`
                        : `${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Page Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
