import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/EnhancedNotificationContext';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
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
  Plus,
  Download,
  Upload,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
  Zap,
  Target,
  Megaphone
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import LuxuryCard from '../components/ui/LuxuryCard';
import LuxuryButton from '../components/ui/LuxuryButton';

const Notifications = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  const { user } = useAuth();
  
  const {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
    isNotificationExpired
  } = useNotifications();

  // State management
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const notificationsPerPage = 20;

  // Fetch notifications on component mount
  useEffect(() => {
    if (user?._id) {
      fetchNotifications({ limit: 100 });
      fetchUnreadCount();
    }
  }, [user?._id, fetchNotifications, fetchUnreadCount]);

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notification => notification.category === selectedCategory);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === selectedPriority);
    }

    // Unread only filter
    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.read);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedType, selectedCategory, selectedPriority, showUnreadOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id || notification._id);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedNotifications([]);
  };

  // Handle select notification
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === currentNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(currentNotifications.map(n => n.id || n._id));
    }
  };

  // Handle bulk operations
  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await bulkMarkAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length > 0) {
      await bulkDelete(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (notification) => {
    if (isNotificationExpired(notification)) {
      return 'text-gray-400 bg-gray-50 border-gray-200';
    }
    if (notification.read) {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchNotifications({ limit: 100 });
    await fetchUnreadCount();
    setIsLoading(false);
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث الإشعارات بنجاح',
      variant: 'success'
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'payment_submitted': 'طلب دفع',
      'payment_approved': 'موافقة على الدفع',
      'payment_rejected': 'رفض الدفع',
      'course_enrolled': 'تسجيل في دورة',
      'course_activated': 'تفعيل دورة',
      'new_video_added': 'فيديو جديد',
      'new_exam_added': 'اختبار جديد',
      'course_updated': 'تحديث دورة',
      'system_announcement': 'إعلان نظام',
      'general': 'عام'
    };
    return labels[type] || type;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'course':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <CheckCheck className="w-5 h-5" />
                <span>تعيين الكل كمقروء</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="payment_submitted">طلب دفع</option>
              <option value="payment_approved">موافقة على الدفع</option>
              <option value="payment_rejected">رفض الدفع</option>
              <option value="course_activated">تفعيل دورة</option>
              <option value="new_video_added">فيديو جديد</option>
              <option value="new_exam_added">اختبار جديد</option>
              <option value="system_announcement">إعلان نظام</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">جميع الفئات</option>
              <option value="payment">الدفع</option>
              <option value="course">الدورات</option>
              <option value="system">النظام</option>
              <option value="announcement">الإعلانات</option>
            </select>

            {/* Unread Only Toggle */}
            <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">غير مقروء فقط</span>
            </label>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {currentNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || showUnreadOnly
                  ? 'لا توجد إشعارات تطابق الفلاتر المحددة'
                  : 'ستظهر الإشعارات هنا عند وصولها'}
              </p>
            </div>
          ) : (
            currentNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${
                  !notification.read ? 'border-r-4 border-r-blue-500' : ''
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4 space-x-reverse">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {getNotificationIcon ? getNotificationIcon(notification.type) : '🔔'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h3 className={`text-lg font-semibold ${getNotificationColor ? getNotificationColor(notification.type) : 'text-gray-900 dark:text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar className="w-4 h-4" />
                            <span>{formatTimeAgo ? formatTimeAgo(notification.createdAt) : new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            {getCategoryIcon(notification.category)}
                            <span>{getTypeLabel(notification.type)}</span>
                          </div>
                          {notification.priority === 'urgent' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              عاجل
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                السابق
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Notifications;
