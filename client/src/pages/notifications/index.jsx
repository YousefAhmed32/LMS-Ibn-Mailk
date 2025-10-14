import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle,
  Trash2,
  Settings
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'تم تأكيد دفعك لدورة الرياضيات للصف السابع',
      isRead: false,
      type: 'payment',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      message: 'تم إضافة محتوى جديد لدورة الفيزياء',
      isRead: true,
      type: 'course',
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      id: 3,
      message: 'مرحباً بك في منصة التعلم! نتمنى لك تجربة تعليمية ممتعة',
      isRead: true,
      type: 'welcome',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: 4,
      message: 'تذكير: موعد الاختبار النصفي لدورة الرياضيات غداً',
      isRead: false,
      type: 'reminder',
      createdAt: '2024-01-13T14:20:00Z'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'course':
        return 'bg-blue-100 text-blue-800';
      case 'welcome':
        return 'bg-purple-100 text-purple-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'course':
        return '📚';
      case 'welcome':
        return '👋';
      case 'reminder':
        return '⏰';
      default:
        return '📢';
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

  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.isRead) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">الإشعارات</h1>
                <p className="text-gray-600">ابق على اطلاع بآخر التحديثات والإعلانات</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-sm">
                  {unreadCount} غير مقروءة
                </Badge>
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    تحديد الكل كمقروء
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">تصفية:</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    الكل
                  </Button>
                  <Button
                    variant={filter === 'payment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('payment')}
                  >
                    المدفوعات
                  </Button>
                  <Button
                    variant={filter === 'course' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('course')}
                  >
                    الدورات
                  </Button>
                  <Button
                    variant={filter === 'reminder' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('reminder')}
                  >
                    التذكيرات
                  </Button>
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                  <input
                    type="checkbox"
                    id="unreadOnly"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="unreadOnly" className="text-sm text-gray-700">
                    إظهار غير المقروءة فقط
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
                    <p className="text-gray-500">
                      {filter === 'all' 
                        ? 'ستظهر هنا الإشعارات الجديدة عند وصولها'
                        : 'لا توجد إشعارات بهذا النوع'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type === 'payment' ? 'دفع' :
                               notification.type === 'course' ? 'دورة' :
                               notification.type === 'welcome' ? 'ترحيب' :
                               notification.type === 'reminder' ? 'تذكير' : 'عام'}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                جديد
                              </Badge>
                            )}
                          </div>
                          
                          <p className={`text-gray-900 ${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.message}
                          </p>
                          
                          <p className="text-sm text-gray-500 mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination or Load More */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" className="w-full md:w-auto">
                تحميل المزيد
              </Button>
            </div>
          )}
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
