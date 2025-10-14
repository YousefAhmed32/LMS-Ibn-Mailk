import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationButton = () => {
  const { isDarkMode } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
      default:
        return 'text-gray-600';
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative notification-dropdown">
      {/* Notification Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-600 hover:to-luxury-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Bell Icon with Glow Animation */}
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <Bell className="h-5 w-5" />
        </motion.div>

        {/* Animated Badge for Unread Notifications */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-luxury-gold-400 to-luxury-orange-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300"
          animate={{
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-luxury-navy-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 dark:border-luxury-navy-600/30 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-luxury-navy-600/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  الإشعارات
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <motion.button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg bg-gradient-to-r from-luxury-emerald-500 to-luxury-emerald-600 text-white hover:from-luxury-emerald-600 hover:to-luxury-emerald-700 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-luxury-navy-700/50 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </motion.button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-luxury-orange-600 dark:text-luxury-orange-400 mt-1">
                  {unreadCount} إشعار غير مقروء
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    لا توجد إشعارات
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {recentNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                        !notification.isRead 
                          ? 'bg-gradient-to-r from-luxury-gold-50/50 to-luxury-orange-50/50 dark:from-luxury-gold-900/20 dark:to-luxury-orange-900/20 border border-luxury-gold-200/50 dark:border-luxury-gold-700/50' 
                          : 'bg-gray-50/50 dark:bg-luxury-navy-700/30 hover:bg-gray-100/50 dark:hover:bg-luxury-navy-700/50'
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`text-sm font-medium truncate ${
                              !notification.isRead 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {notification.message}
                            </p>
                            {!notification.isRead && (
                              <motion.div
                                className="w-2 h-2 bg-luxury-gold-500 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 rounded-full hover:bg-luxury-emerald-100 dark:hover:bg-luxury-emerald-900/20 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Check className="h-3 w-3 text-luxury-emerald-600" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200/50 dark:border-luxury-navy-600/30">
                <motion.button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page
                    window.location.href = '/notifications';
                  }}
                  className="w-full py-2 px-4 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-orange-500/10 hover:from-luxury-gold-500/20 hover:to-luxury-orange-500/20 text-luxury-gold-600 dark:text-luxury-gold-400 rounded-lg transition-all duration-300 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  عرض جميع الإشعارات
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationButton;
