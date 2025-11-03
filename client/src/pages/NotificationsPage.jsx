import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import { useNotifications } from '../contexts/EnhancedNotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from '../hooks/use-toast';
import GlobalLayout from '../components/layout/GlobalLayout';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Settings,
  Download,
  Archive
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  
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

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadNotifications();
    }
  }, [user?._id, currentPage, filterType, filterRead]);

  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchNotifications({ 
          page: currentPage, 
          limit: 20,
          type: filterType !== 'all' ? filterType : undefined,
          read: filterRead !== 'all' ? filterRead === 'read' : undefined
        }),
        fetchUnreadCount()
      ]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'خطأ في تحميل الإشعارات',
        description: 'فشل في تحميل الإشعارات',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث الإشعارات بنجاح'
    });
  };

  const handleMarkAllAsRead = async () => {
    console.log('🔔 Marking all as read...');
    const success = await markAllAsRead();
    console.log('🔔 Mark all as read result:', success);
    setSelectedNotifications([]);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id || n._id));
    }
  };

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

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const handleNotificationClick = async (notification) => {
    console.log('🔔 Notification clicked:', notification);
    if (!notification.read) {
      console.log('🔔 Marking as read...');
      const success = await markAsRead(notification.id || notification._id);
      console.log('🔔 Mark as read result:', success);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (notification) => {
    if (isNotificationExpired(notification)) {
      return 'text-gray-400 bg-gray-50 border-gray-200';
    }
    if (notification.read) {
      return 'text-gray-600 bg-gray-50 border-gray-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
      (filterRead === 'read' && notification.read) ||
      (filterRead === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const notificationTypes = [
    { value: 'all', label: 'جميع الإشعارات' },
    { value: 'payment_submitted', label: 'طلبات الدفع' },
    { value: 'payment_approved', label: 'موافقات الدفع' },
    { value: 'payment_rejected', label: 'رفض الدفع' },
    { value: 'course_enrolled', label: 'التسجيل في الدورات' },
    { value: 'course_activated', label: 'تفعيل الدورات' },
    { value: 'system_announcement', label: 'إعلانات النظام' },
    { value: 'confirmation', label: 'رموز التأكيد' }
  ];

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Bell size={48} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  return (
    <GlobalLayout>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
                الإشعارات
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                إدارة جميع إشعاراتك في مكان واحد
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإشعارات</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">غير مقروءة</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مقروءة</p>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">منتهية الصلاحية</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => isNotificationExpired(n)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 pt-5">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في الإشعارات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  />
                </div>
              </div>
              
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white dark:border-gray-700"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              {/* Read Status Filter */}
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white dark:border-gray-700"
              >
                <option value="all">جميع الحالات</option>
                <option value="unread">غير مقروءة</option>
                <option value="read">مقروءة</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    تم تحديد {selectedNotifications.length} إشعار
                  </span>
                  <Button
                    onClick={handleBulkMarkAsRead}
                    variant="outline"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    تحديد كمقروء
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>الإشعارات ({filteredNotifications.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedNotifications.length === filteredNotifications.length ? 'إلغاء التحديد' : 'تحديد الكل'}
                </Button>
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  تحديد الكل كمقروء
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد إشعارات
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                    ? 'لا توجد إشعارات تطابق معايير البحث'
                    : 'لم يتم العثور على أي إشعارات بعد'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id || notification._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                       className="  p-2 bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id || notification._id)}
                          onChange={() => handleSelectNotification(notification.id || notification._id)}
                          className="mt-1 rounded border-gray-300"
                        />
                        
                        {/* Icon */}
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-lg font-medium ${
                                notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </h4>
                              
                              <p className={`text-sm mt-1 ${
                                notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.message}
                              </p>
                              
                              {/* Confirmation Code Display */}
                              {notification.confirmationCode && (
                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    رمز التأكيد: {notification.confirmationCode}
                                  </p>
                                  {notification.expiresAt && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      ينتهي في: {formatTimeAgo(notification.expiresAt)}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {/* Footer */}
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                
                                {/* Priority Badge */}
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority === 'urgent' ? 'عاجل' :
                                   notification.priority === 'high' ? 'مهم' :
                                   notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                  title="تحديد كمقروء"
                                >
                                  <Eye size={16} className="text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id || notification._id)}
                                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="حذف"
                              >
                                <Trash2 size={16} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default NotificationsPage;
