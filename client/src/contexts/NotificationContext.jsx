import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
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

  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'course':
        return '📚';
      case 'welcome':
        return '👋';
      case 'reminder':
        return '⏰';
      case 'achievement':
        return '🏆';
      case 'message':
        return '💬';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'text-green-600';
      case 'course':
        return 'text-blue-600';
      case 'welcome':
        return 'text-purple-600';
      case 'reminder':
        return 'text-orange-600';
      case 'achievement':
        return 'text-yellow-600';
      case 'message':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};