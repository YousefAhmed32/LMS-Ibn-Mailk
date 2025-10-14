import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axiosInstance';
import { toast } from '../hooks/use-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const initializeSocket = () => {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to notification server');
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from notification server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setError('Failed to connect to notification server');
        setIsConnected(false);
      });

      // Listen for new notifications
      newSocket.on('notification', (notification) => {
        console.log('🔔 New notification received:', notification);
        
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        showNotificationToast(notification);
      });

      // Listen for system announcements
      newSocket.on('system_announcement', (announcement) => {
        console.log('📢 System announcement received:', announcement);
        
        setNotifications(prev => [announcement, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show system announcement toast
        toast({
          title: announcement.title,
          description: announcement.message,
          variant: announcement.priority === 'urgent' ? 'destructive' : 'default',
          duration: 8000
        });
      });

      setSocket(newSocket);
    };

    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Join user room when user is available
  const joinUserRoom = useCallback((userId) => {
    if (socket && userId) {
      socket.emit('join', userId);
      console.log(`👤 Joined user room: user_${userId}`);
    }
  }, [socket]);

  // Auto-join user room when user changes
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData && socket) {
      try {
        const user = JSON.parse(userData);
        if (user._id) {
          joinUserRoom(user._id);
        }
      } catch (error) {
        console.error('Error parsing user data for socket room:', error);
      }
    }
  }, [socket, joinUserRoom]);

  // Show notification toast
  const showNotificationToast = (notification) => {
    const getToastVariant = (priority) => {
      switch (priority) {
        case 'urgent': return 'destructive';
        case 'high': return 'default';
        case 'medium': return 'default';
        case 'low': return 'default';
        default: return 'default';
      }
    };

    const getToastIcon = (type) => {
      switch (type) {
        case 'confirmation': return '🔐';
        case 'payment_submitted': return '💳';
        case 'payment_approved': return '✅';
        case 'payment_rejected': return '❌';
        case 'course_enrolled': return '🎓';
        case 'course_activated': return '🚀';
        case 'new_video_added': return '📹';
        case 'new_exam_added': return '📝';
        case 'system_announcement': return '📢';
        case 'alert': return '⚠️';
        default: return '🔔';
      }
    };

    toast({
      title: `${getToastIcon(notification.type)} ${notification.title}`,
      description: notification.message,
      variant: getToastVariant(notification.priority),
      duration: notification.type === 'confirmation' ? 15000 : 6000,
      action: notification.type === 'confirmation' ? {
        altText: 'View notification',
        label: 'عرض',
        onClick: () => {
          // Navigate to notifications page or show modal
          window.location.href = '/notifications';
        }
      } : undefined
    });
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.type) params.append('type', options.type);
      if (options.read) params.append('read', options.read);
      if (options.category) params.append('category', options.category);

      console.log('🔔 Fetching notifications with params:', params.toString());

      const response = await axiosInstance.get(`/api/notifications?${params}`);
      
      if (response.data.success) {
        const { notifications: fetchedNotifications, pagination } = response.data.data;
        setNotifications(fetchedNotifications);
        console.log('✅ Notifications fetched successfully:', fetchedNotifications.length);
        return { notifications: fetchedNotifications, pagination };
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // إذا كان الخطأ 401 (غير مُصادق عليه)، لا نعرض رسالة خطأ
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, skipping notifications fetch');
        return;
      }
      
      setError('Failed to fetch notifications');
      
      // عرض رسالة خطأ فقط إذا لم يكن المستخدم مُصادق عليه
      if (error.response?.status !== 401) {
        toast({
          title: 'خطأ في تحميل الإشعارات',
          description: 'فشل في تحميل الإشعارات',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
        return response.data.data.unreadCount;
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      
      // إذا كان الخطأ 401 (غير مُصادق عليه)، لا نعرض رسالة خطأ
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, skipping unread count fetch');
        return;
      }
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId || notification._id === notificationId
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الإشعار',
        variant: 'destructive'
      });
    }
    return false;
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axiosInstance.patch('/api/notifications/mark-all-read');
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        
        toast({
          title: 'تم',
          description: 'تم تحديد جميع الإشعارات كمقروءة',
          variant: 'success'
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الإشعارات',
        variant: 'destructive'
      });
    }
    return false;
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notification => 
            notification.id !== notificationId && notification._id !== notificationId
          )
        );
        
        // Update unread count if notification was unread
        const notification = notifications.find(n => 
          n.id === notificationId || n._id === notificationId
        );
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الإشعار',
        variant: 'destructive'
      });
    }
    return false;
  }, [notifications]);

  // Bulk operations
  const bulkMarkAsRead = useCallback(async (notificationIds) => {
    try {
      const response = await axiosInstance.patch('/api/notifications/bulk-mark-read', {
        notificationIds
      });
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notificationIds.includes(notification.id || notification._id)
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          )
        );
        
        // Update unread count
        const unreadCount = notifications.filter(n => 
          notificationIds.includes(n.id || n._id) && !n.read
        ).length;
        setUnreadCount(prev => Math.max(0, prev - unreadCount));
        
        return true;
      }
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error);
    }
    return false;
  }, [notifications]);

  const bulkDelete = useCallback(async (notificationIds) => {
    try {
      const response = await axiosInstance.delete('/api/notifications/bulk-delete', {
        data: { notificationIds }
      });
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.filter(notification => 
            !notificationIds.includes(notification.id || notification._id)
          )
        );
        
        // Update unread count
        const unreadCount = notifications.filter(n => 
          notificationIds.includes(n.id || n._id) && !n.read
        ).length;
        setUnreadCount(prev => Math.max(0, prev - unreadCount));
        
        return true;
      }
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
    }
    return false;
  }, [notifications]);

  // Get notification icon
  const getNotificationIcon = useCallback((type) => {
    const icons = {
      confirmation: '🔐',
      payment_submitted: '💳',
      payment_approved: '✅',
      payment_rejected: '❌',
      course_enrolled: '🎓',
      course_activated: '🚀',
      new_video_added: '📹',
      new_exam_added: '📝',
      course_updated: '📚',
      system_announcement: '📢',
      general: '🔔',
      alert: '⚠️'
    };
    return icons[type] || '🔔';
  }, []);

  // Get notification color
  const getNotificationColor = useCallback((type, priority) => {
    const colors = {
      confirmation: 'text-blue-600 bg-blue-50 border-blue-200',
      payment_submitted: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      payment_approved: 'text-green-600 bg-green-50 border-green-200',
      payment_rejected: 'text-red-600 bg-red-50 border-red-200',
      course_enrolled: 'text-purple-600 bg-purple-50 border-purple-200',
      course_activated: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      new_video_added: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      new_exam_added: 'text-orange-600 bg-orange-50 border-orange-200',
      course_updated: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      system_announcement: 'text-pink-600 bg-pink-50 border-pink-200',
      general: 'text-gray-600 bg-gray-50 border-gray-200',
      alert: 'text-red-600 bg-red-50 border-red-200'
    };
    
    const baseColor = colors[type] || colors.general;
    
    // Adjust for priority
    if (priority === 'urgent') {
      return baseColor.replace('50', '100').replace('200', '300');
    }
    
    return baseColor;
  }, []);

  // Format time ago
  const formatTimeAgo = useCallback((date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    if (hours < 24) return `${hours} ساعة`;
    return `${days} يوم`;
  }, []);

  // Check if notification is expired
  const isNotificationExpired = useCallback((notification) => {
    if (notification.expiresAt) {
      return new Date() > new Date(notification.expiresAt);
    }
    return false;
  }, []);

  const value = {
    // State
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete,
    joinUserRoom,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
    isNotificationExpired,
    
    // Socket
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

