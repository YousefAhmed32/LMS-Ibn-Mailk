import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Badge from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Bell, 
  X, 
  CreditCard, 
  Clock, 
  DollarSign,
  Phone,
  Calendar
} from 'lucide-react';

const SimpleNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/payment-proofs/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const paymentProofs = data.pendingProofs || [];
          
          // Convert payment proofs to notifications
          const newNotifications = paymentProofs.map(payment => ({
            id: payment._id,
            type: 'payment_proof',
            title: 'إثبات دفع جديد',
            message: `${payment.userName} قدم إثبات دفع للدورة ${payment.courseTitle}`,
            data: payment,
            timestamp: payment.submittedAt,
            read: false
          }));
          
          setNotifications(newNotifications);
          setUnreadCount(newNotifications.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`;
    return `${Math.floor(diffInSeconds / 86400)} يوم`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              مركز الإشعارات
            </span>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                تعيين الكل كمقروء
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">جاري التحميل...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد إشعارات جديدة
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                        : 'bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.message}
                            </p>
                            
                            {notification.type === 'payment_proof' && notification.data && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-3 w-3" />
                                  <span>{notification.data.amount} ج.م</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{notification.data.senderPhone}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleNotificationCenter;
