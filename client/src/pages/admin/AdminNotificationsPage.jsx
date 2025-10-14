import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  GraduationCap,
  Megaphone,
  Trash2,
  Plus,
  Send
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  const notificationsPerPage = 20;

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/notifications/admin/all', {
        params: {
          page: currentPage,
          limit: notificationsPerPage
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.userId && notification.userId.firstName && 
         notification.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
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

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedType, selectedCategory]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/notifications/system-announcement', newAnnouncement);
      
      if (response.data.success) {
        setShowCreateModal(false);
        setNewAnnouncement({ title: '', message: '', priority: 'medium' });
        fetchNotifications();
        // Show success message
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      try {
        const response = await axiosInstance.delete(`/notifications/admin/${notificationId}`);
        
        if (response.data.success) {
          fetchNotifications();
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    if (hours < 24) return `${hours} ساعة`;
    return `${days} يوم`;
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approved':
        return '✅';
      case 'payment_rejected':
        return '❌';
      case 'payment_submitted':
        return '💳';
      case 'course_activated':
        return '🎓';
      case 'new_video_added':
        return '📺';
      case 'new_exam_added':
        return '📝';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment_approved':
      case 'course_activated':
        return 'text-green-600';
      case 'payment_rejected':
        return 'text-red-600';
      case 'payment_submitted':
        return 'text-blue-600';
      case 'new_video_added':
      case 'new_exam_added':
        return 'text-purple-600';
      case 'system_announcement':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الإشعارات</h1>
              <p className="text-gray-600 mt-2">
                عرض وإدارة جميع إشعارات النظام
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>إنشاء إعلان</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              <option value="payment">الدفع</option>
              <option value="course">الدورات</option>
              <option value="system">النظام</option>
              <option value="announcement">الإعلانات</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">جاري تحميل الإشعارات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500">
                {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'لا توجد إشعارات تطابق الفلاتر المحددة'
                  : 'لا توجد إشعارات في النظام'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                  getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start space-x-4 space-x-reverse">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h3 className={`text-lg font-semibold ${getNotificationColor(notification.type)}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* User Info */}
                        {notification.userId && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">المستخدم:</span> {notification.userId.firstName} {notification.userId.secondName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">البريد الإلكتروني:</span> {notification.userId.userEmail}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Calendar className="w-4 h-4" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
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
                          
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="حذف الإشعار"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">إنشاء إعلان نظام</h3>
              
              <form onSubmit={handleCreateAnnouncement}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرسالة
                    </label>
                    <textarea
                      value={newAnnouncement.message}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
