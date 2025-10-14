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
// import CoursesManagement from "../../components/admin/CoursesManagementUpdated";
import PaymentsManagement from "../../components/admin/PaymentsManagement";
import PaymentProofManagement from "../../components/admin/PaymentProofManagement";
import MessagingSystem from "../../components/admin/MessagingSystem";
import Settings from "../../components/admin/Settings";
import AdminLayout from "../../components/admin/AdminLayout";
import MobileNavigation from "../../components/admin/MobileNavigation";
import {
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  FileCheck,
  Target,
  MessageSquare,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Download,
  Plus,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, users, courses, payments, loading } = useSelector((state) => state.admin);
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      description: 'عرض وإدارة جميع المستخدمين',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'courses',
      name: 'إدارة الدورات',
      icon: BookOpen,
      description: 'إدارة الدورات والمحتوى التعليمي',
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
      description: 'مراجعة وإدارة إثباتات الدفع',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
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
      name: 'الرسائل',
      icon: MessageSquare,
      description: 'التواصل مع الطلاب',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800'
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 mx-auto mb-4"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              جاري تحميل لوحة التحكم...
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              يرجى الانتظار بينما نقوم بجمع البيانات
            </p>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview analytics={analytics} />;
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
        return <AdminOverview analytics={analytics} />;
    }
  };

  return (
    <AdminLayout>
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={sidebarOpen && isMobile}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex">
        {/* Enhanced Sidebar */}
        <motion.div 
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`fixed inset-y-0 left-0 z-50 w-72 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="h-full flex flex-col">
            {/* Enhanced Sidebar Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xl font-bold">A</span>
                </motion.div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    لوحة التحكم
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    إدارة النظام
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Enhanced Sidebar Navigation */}
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <nav className="mt-2 flex-1 px-3 space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(item.id)}
                      className={`${
                        isActive
                          ? `${item.bgColor} ${item.borderColor} ${item.color} border-l-4`
                          : `${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                      } group flex items-center px-4 py-4 text-sm font-medium rounded-xl border border-transparent transition-all duration-300 w-full backdrop-blur-sm`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? item.bgColor : 'bg-transparent'} transition-colors duration-200`}>
                        <Icon className={`h-5 w-5 ${isActive ? item.color : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div className="text-right mr-3 flex-1">
                        <div className={`font-semibold ${isActive ? item.color : ''}`}>
                          {item.name}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-72">
          {/* Enhanced Top Bar */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-b backdrop-blur-sm`}
          >
            <div className="px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
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
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="relative hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      الإشعارات
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Page Content */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8"
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
    </AdminLayout>
  );
};

export default AdminDashboard;
