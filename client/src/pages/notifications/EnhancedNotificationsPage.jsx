import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  Settings,
  Search,
  Filter,
  CheckCheck,
  Clock,
  CreditCard,
  BookOpen,
  Star,
  MessageSquare,
  GraduationCap,
  RefreshCw,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

const EnhancedNotificationsPage = () => {
  const { isDarkMode } = useTheme();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState(10);

  // Enhanced notification data with more realistic content
  const [enhancedNotifications, setEnhancedNotifications] = useState([
    {
      id: 1,
      title: 'تم تأكيد الدفع',
      message: 'تم تأكيد دفعك لدورة الرياضيات المتقدمة للصف السابع بنجاح',
      isRead: false,
      type: 'payment',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      category: 'financial'
    },
    {
      id: 2,
      title: 'محتوى جديد متاح',
      message: 'تم إضافة فصل جديد "المعادلات الخطية" لدورة الفيزياء الأساسية',
      isRead: true,
      type: 'course',
      priority: 'medium',
      createdAt: '2024-01-14T15:45:00Z',
      category: 'academic'
    },
    {
      id: 3,
      title: 'مرحباً بك!',
      message: 'مرحباً بك في منصة ابن مالك للتعلم! نتمنى لك تجربة تعليمية ممتعة ومثمرة',
      isRead: true,
      type: 'welcome',
      priority: 'low',
      createdAt: '2024-01-10T09:00:00Z',
      category: 'system'
    },
    {
      id: 4,
      title: 'تذكير مهم',
      message: 'تذكير: موعد الاختبار النصفي لدورة الرياضيات غداً في تمام الساعة 10:00 صباحاً',
      isRead: false,
      type: 'reminder',
      priority: 'urgent',
      createdAt: '2024-01-13T14:20:00Z',
      category: 'academic'
    },
    {
      id: 5,
      title: 'إنجاز جديد',
      message: 'تهانينا! لقد أكملت 75% من دورة اللغة العربية وحصلت على شارة التقدم',
      isRead: false,
      type: 'achievement',
      priority: 'medium',
      createdAt: '2024-01-12T16:30:00Z',
      category: 'academic'
    },
    {
      id: 6,
      title: 'رسالة من المعلم',
      message: 'أستاذ أحمد يرسل لك رسالة: "أداءك ممتاز في الواجب الأخير، استمر في التميز!"',
      isRead: true,
      type: 'message',
      priority: 'low',
      createdAt: '2024-01-11T11:15:00Z',
      category: 'communication'
    }
  ]);

  // Enhanced type configuration with icons and colors
  const notificationTypes = {
    payment: {
      icon: CreditCard,
      label: 'دفع',
      color: 'from-luxury-emerald-500 to-luxury-emerald-600',
      bgColor: 'from-luxury-emerald-50 to-luxury-emerald-100 dark:from-luxury-emerald-900/20 dark:to-luxury-emerald-800/20',
      textColor: 'text-luxury-emerald-700 dark:text-luxury-emerald-300',
      borderColor: 'border-luxury-emerald-200 dark:border-luxury-emerald-700'
    },
    course: {
      icon: BookOpen,
      label: 'دورة',
      color: 'from-luxury-sky-500 to-luxury-sky-600',
      bgColor: 'from-luxury-sky-50 to-luxury-sky-100 dark:from-luxury-sky-900/20 dark:to-luxury-sky-800/20',
      textColor: 'text-luxury-sky-700 dark:text-luxury-sky-300',
      borderColor: 'border-luxury-sky-200 dark:border-luxury-sky-700'
    },
    welcome: {
      icon: Star,
      label: 'ترحيب',
      color: 'from-luxury-gold-500 to-luxury-gold-600',
      bgColor: 'from-luxury-gold-50 to-luxury-gold-100 dark:from-luxury-gold-900/20 dark:to-luxury-gold-800/20',
      textColor: 'text-luxury-gold-700 dark:text-luxury-gold-300',
      borderColor: 'border-luxury-gold-200 dark:border-luxury-gold-700'
    },
    reminder: {
      icon: Clock,
      label: 'تذكير',
      color: 'from-luxury-orange-500 to-luxury-orange-600',
      bgColor: 'from-luxury-orange-50 to-luxury-orange-100 dark:from-luxury-orange-900/20 dark:to-luxury-orange-800/20',
      textColor: 'text-luxury-orange-700 dark:text-luxury-orange-300',
      borderColor: 'border-luxury-orange-200 dark:border-luxury-orange-700'
    },
    achievement: {
      icon: GraduationCap,
      label: 'إنجاز',
      color: 'from-luxury-gold-500 to-luxury-orange-500',
      bgColor: 'from-luxury-gold-50 to-luxury-orange-50 dark:from-luxury-gold-900/20 dark:to-luxury-orange-900/20',
      textColor: 'text-luxury-gold-700 dark:text-luxury-gold-300',
      borderColor: 'border-luxury-gold-200 dark:border-luxury-gold-700'
    },
    message: {
      icon: MessageSquare,
      label: 'رسالة',
      color: 'from-luxury-sky-500 to-luxury-emerald-500',
      bgColor: 'from-luxury-sky-50 to-luxury-emerald-50 dark:from-luxury-sky-900/20 dark:to-luxury-emerald-900/20',
      textColor: 'text-luxury-sky-700 dark:text-luxury-sky-300',
      borderColor: 'border-luxury-sky-200 dark:border-luxury-sky-700'
    }
  };

  const priorityConfig = {
    urgent: {
      label: 'عاجل',
      color: 'text-luxury-rose-600 dark:text-luxury-rose-400',
      bgColor: 'bg-luxury-rose-100 dark:bg-luxury-rose-900/20',
      borderColor: 'border-luxury-rose-200 dark:border-luxury-rose-700'
    },
    high: {
      label: 'مهم',
      color: 'text-luxury-orange-600 dark:text-luxury-orange-400',
      bgColor: 'bg-luxury-orange-100 dark:bg-luxury-orange-900/20',
      borderColor: 'border-luxury-orange-200 dark:border-luxury-orange-700'
    },
    medium: {
      label: 'متوسط',
      color: 'text-luxury-sky-600 dark:text-luxury-sky-400',
      bgColor: 'bg-luxury-sky-100 dark:bg-luxury-sky-900/20',
      borderColor: 'border-luxury-sky-200 dark:border-luxury-sky-700'
    },
    low: {
      label: 'منخفض',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700'
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'منذ دقائق';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const handleMarkAsRead = (id) => {
    setEnhancedNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setIsLoading(true);
    setTimeout(() => {
      setEnhancedNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteNotification = (id) => {
    setEnhancedNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addTestNotification = () => {
    const newNotification = {
      id: Date.now(),
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي لاختبار الواجهة الجديدة',
      isRead: false,
      type: 'course',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      category: 'system'
    };
    
    setEnhancedNotifications(prev => [newNotification, ...prev]);
  };

  const filteredNotifications = enhancedNotifications.filter(notification => {
    if (showUnreadOnly && notification.isRead) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
  const readNotifications = filteredNotifications.filter(n => n.isRead);
  const unreadCount = enhancedNotifications.filter(n => !n.isRead).length;

  const loadMoreNotifications = () => {
    setDisplayedNotifications(prev => prev + 10);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-luxury-navy-900 dark:via-luxury-navy-800 dark:to-luxury-navy-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold-400/10 via-luxury-orange-400/10 to-luxury-gold-400/10 rounded-3xl blur-xl" />
              
              <div className="relative bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-gradient-to-br from-luxury-gold-500/20 to-luxury-orange-500/20 rounded-2xl border border-luxury-gold-500/30 shadow-lg">
                      <Bell className="h-8 w-8 text-luxury-gold-600 dark:text-luxury-gold-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-luxury-gold-600 via-luxury-orange-500 to-luxury-gold-500 bg-clip-text text-transparent">
                        الإشعارات
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                        {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-luxury-orange-500/10 to-luxury-gold-500/10 text-luxury-orange-600 dark:text-luxury-orange-400 border border-luxury-orange-200 dark:border-luxury-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Bell className="h-4 w-4 mr-2 inline" />
                        {unreadCount} غير مقروءة
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {unreadCount > 0 && (
                        <motion.button 
                          onClick={handleMarkAllAsRead} 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-luxury-emerald-500 to-luxury-emerald-600 hover:from-luxury-emerald-600 hover:to-luxury-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-2 rounded-lg font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />
                          ) : (
                            <CheckCheck className="h-4 w-4 mr-2 inline" />
                          )}
                          تحديد الكل كمقروء
                        </motion.button>
                      )}
                      
                      <motion.button 
                        onClick={addTestNotification}
                        className="border-luxury-gold-500/30 text-luxury-gold-600 dark:text-luxury-gold-400 hover:bg-luxury-gold-50 dark:hover:bg-luxury-gold-900/20 border px-4 py-2 rounded-lg font-medium transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="h-4 w-4 mr-2 inline" />
                        إضافة إشعار تجريبي
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث في الإشعارات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-luxury-navy-700/50 border border-gray-200 dark:border-luxury-navy-600/50 rounded-xl focus:ring-2 focus:ring-luxury-gold-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">النوع:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(notificationTypes).map(([type, config]) => (
                      <motion.button
                        key={type}
                        onClick={() => setFilter(filter === type ? 'all' : type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          filter === type 
                            ? `bg-gradient-to-r ${config.color} text-white shadow-lg` 
                            : 'border-gray-200 dark:border-luxury-navy-600/50 hover:bg-gray-50 dark:hover:bg-luxury-navy-700/50 border'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <config.icon className="h-4 w-4 mr-2 inline" />
                        {config.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Unread Only Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="unreadOnly"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                    className="w-4 h-4 text-luxury-gold-600 bg-gray-100 border-gray-300 rounded focus:ring-luxury-gold-500 focus:ring-2"
                  />
                  <label htmlFor="unreadOnly" className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    {showUnreadOnly ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    إظهار غير المقروءة فقط
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Notifications List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <div className="w-3 h-3 bg-luxury-gold-500 rounded-full mr-3 animate-pulse"></div>
                  الإشعارات غير المقروءة ({unreadNotifications.length})
                </h2>
                <div className="space-y-4">
                  {unreadNotifications.map((notification, index) => {
                    const typeConfig = notificationTypes[notification.type];
                    const priorityConfig = priorityConfig[notification.priority];
                    const Icon = typeConfig.icon;
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 dark:border-luxury-navy-600/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ring-2 ring-luxury-gold-500/20 shadow-gold-glow"
                      >
                        {/* Priority indicator */}
                        {notification.priority === 'urgent' && (
                          <div className="absolute top-4 left-4 w-3 h-3 bg-luxury-rose-500 rounded-full animate-pulse" />
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Enhanced Icon */}
                              <div className={`p-3 bg-gradient-to-br ${typeConfig.bgColor} rounded-2xl border ${typeConfig.borderColor} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                                <Icon className={`h-6 w-6 ${typeConfig.textColor}`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`bg-gradient-to-r ${typeConfig.color} text-white shadow-sm px-3 py-1 rounded-full text-sm font-medium`}>
                                    {typeConfig.label}
                                  </div>
                                  
                                  <div className={`${priorityConfig.bgColor} ${priorityConfig.color} ${priorityConfig.borderColor} border px-2 py-1 rounded-full text-xs font-medium`}>
                                    {priorityConfig.label}
                                  </div>
                                  
                                  <div className="bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 text-white animate-pulse px-2 py-1 rounded-full text-xs font-medium">
                                    جديد
                                  </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-luxury-gold-700 dark:text-luxury-gold-300 mb-2">
                                  {notification.title}
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(notification.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <motion.button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-luxury-emerald-600 hover:text-luxury-emerald-700 hover:bg-luxury-emerald-50 dark:hover:bg-luxury-emerald-900/20 p-2 rounded-lg transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-luxury-rose-600 hover:text-luxury-rose-700 hover:bg-luxury-rose-50 dark:hover:bg-luxury-rose-900/20 p-2 rounded-lg transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                  الإشعارات المقروءة ({readNotifications.length})
                </h2>
                <div className="space-y-4">
                  {readNotifications.slice(0, displayedNotifications - unreadNotifications.length).map((notification, index) => {
                    const typeConfig = notificationTypes[notification.type];
                    const priorityConfig = priorityConfig[notification.priority];
                    const Icon = typeConfig.icon;
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group relative bg-white/60 dark:bg-luxury-navy-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/30 dark:border-luxury-navy-600/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] opacity-75 hover:opacity-100"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Enhanced Icon */}
                              <div className={`p-3 bg-gradient-to-br ${typeConfig.bgColor} rounded-2xl border ${typeConfig.borderColor} shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 opacity-70 group-hover:opacity-100`}>
                                <Icon className={`h-6 w-6 ${typeConfig.textColor}`} />
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className={`bg-gradient-to-r ${typeConfig.color} text-white shadow-sm px-3 py-1 rounded-full text-sm font-medium opacity-70`}>
                                    {typeConfig.label}
                                  </div>
                                  
                                  <div className={`${priorityConfig.bgColor} ${priorityConfig.color} ${priorityConfig.borderColor} border px-2 py-1 rounded-full text-xs font-medium opacity-70`}>
                                    {priorityConfig.label}
                                  </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                                  {notification.title}
                                </h3>
                                
                                <p className="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(notification.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <motion.button
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-luxury-rose-600 hover:text-luxury-rose-700 hover:bg-luxury-rose-50 dark:hover:bg-luxury-rose-900/20 p-2 rounded-lg transition-all duration-300 opacity-70 hover:opacity-100"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 dark:border-luxury-navy-600/30 p-12 text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-luxury-gold-500/20 to-luxury-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-10 w-10 text-luxury-gold-600 dark:text-luxury-gold-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">لا توجد إشعارات</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {searchTerm || filter !== 'all' || showUnreadOnly
                    ? 'لا توجد إشعارات تطابق الفلاتر المحددة'
                    : 'ستظهر الإشعارات هنا عند وصولها'}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Load More Button */}
          {readNotifications.length > displayedNotifications - unreadNotifications.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 text-center"
            >
              <motion.button 
                onClick={loadMoreNotifications}
                className="bg-white/90 dark:bg-luxury-navy-800/90 backdrop-blur-md border-luxury-gold-500/30 text-luxury-gold-600 dark:text-luxury-gold-400 hover:bg-luxury-gold-50 dark:hover:bg-luxury-gold-900/20 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-4 w-4 mr-2 inline" />
                تحميل المزيد
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default EnhancedNotificationsPage;
