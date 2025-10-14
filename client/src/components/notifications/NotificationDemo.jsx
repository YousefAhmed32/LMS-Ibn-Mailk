import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Settings, CreditCard, BookOpen, Star, Clock, MessageSquare, GraduationCap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationButton from './NotificationButton';
import EnhancedNotificationsPage from '../../pages/notifications/EnhancedNotificationsPage';

const NotificationDemo = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { addNotification } = useNotifications();
  const [showFullPage, setShowFullPage] = useState(false);

  const notificationTypes = [
    {
      type: 'payment',
      title: 'تم تأكيد الدفع',
      message: 'تم تأكيد دفعك لدورة الرياضيات المتقدمة بنجاح',
      priority: 'high',
      category: 'financial',
      icon: CreditCard
    },
    {
      type: 'course',
      title: 'محتوى جديد متاح',
      message: 'تم إضافة فصل جديد "المعادلات الخطية" لدورة الفيزياء',
      priority: 'medium',
      category: 'academic',
      icon: BookOpen
    },
    {
      type: 'welcome',
      title: 'مرحباً بك!',
      message: 'مرحباً بك في منصة ابن مالك للتعلم! نتمنى لك تجربة تعليمية ممتعة',
      priority: 'low',
      category: 'system',
      icon: Star
    },
    {
      type: 'reminder',
      title: 'تذكير مهم',
      message: 'تذكير: موعد الاختبار النصفي لدورة الرياضيات غداً في تمام الساعة 10:00 صباحاً',
      priority: 'urgent',
      category: 'academic',
      icon: Clock
    },
    {
      type: 'achievement',
      title: 'إنجاز جديد',
      message: 'تهانينا! لقد أكملت 75% من دورة اللغة العربية وحصلت على شارة التقدم',
      priority: 'medium',
      category: 'academic',
      icon: GraduationCap
    },
    {
      type: 'message',
      title: 'رسالة من المعلم',
      message: 'أستاذ أحمد يرسل لك رسالة: "أداءك ممتاز في الواجب الأخير، استمر في التميز!"',
      priority: 'low',
      category: 'communication',
      icon: MessageSquare
    }
  ];

  const addRandomNotification = () => {
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    addNotification(randomType);
  };

  if (showFullPage) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
          <motion.button
            onClick={() => setShowFullPage(false)}
            className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md border border-gray-200/50 dark:border-luxury-navy-600/30 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            العودة للعرض التوضيحي
          </motion.button>
          <NotificationButton />
        </div>
        <EnhancedNotificationsPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-luxury-navy-900 dark:via-luxury-navy-800 dark:to-luxury-navy-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md border-b border-gray-200/50 dark:border-luxury-navy-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                نظام الإشعارات المتقدم
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationButton />
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-luxury-navy-700 hover:bg-gray-200 dark:hover:bg-luxury-navy-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            نظام إشعارات متطور ومتجاوب
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            تجربة إشعارات حديثة مع تأثيرات بصرية متقدمة، دعم الوضع المظلم والفاتح، 
            وتصميم متجاوب يعمل على جميع الأجهزة
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={addRandomNotification}
              className="bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-600 hover:to-luxury-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-5 w-5 mr-2 inline" />
              إضافة إشعار تجريبي
            </motion.button>
            
            <motion.button
              onClick={() => setShowFullPage(true)}
              className="border border-luxury-gold-500/30 text-luxury-gold-600 dark:text-luxury-gold-400 hover:bg-luxury-gold-50 dark:hover:bg-luxury-gold-900/20 px-6 py-3 rounded-lg font-medium transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              عرض الصفحة الكاملة
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              زر الإشعارات الذكي
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              زر دائري بتدرج لوني جميل مع تأثيرات hover ناعمة وشارة متحركة للإشعارات الجديدة
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-luxury-emerald-500 to-luxury-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              الوضع المظلم والفاتح
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              دعم كامل للوضع المظلم والفاتح مع تدرجات لونية متكيفة وتأثيرات بصرية متقدمة
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-luxury-sky-500 to-luxury-sky-600 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              تصنيف الإشعارات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              تصنيف الإشعارات إلى مقروءة وغير مقروءة مع تأثيرات بصرية مميزة لكل نوع
            </p>
          </motion.div>
        </div>

        {/* Notification Types Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            أنواع الإشعارات المتاحة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notificationTypes.map((notification, index) => (
              <motion.button
                key={notification.type}
                onClick={() => addNotification(notification)}
                className="p-4 rounded-xl border border-gray-200/50 dark:border-luxury-navy-600/30 hover:shadow-lg transition-all duration-300 text-right"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <notification.icon className="h-5 w-5 text-luxury-gold-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationDemo;
