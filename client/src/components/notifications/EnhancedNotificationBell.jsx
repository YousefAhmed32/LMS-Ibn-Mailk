import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings,
  AlertCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotifications } from '../../contexts/EnhancedNotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

const EnhancedNotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete,
    getNotificationIcon,
    getNotificationColor,
    formatTimeAgo,
    isNotificationExpired,
    fetchNotifications,
    fetchUnreadCount
  } = useNotifications();

  const { user } = useAuth();

  // Join user room when component mounts
  useEffect(() => {
    if (user?._id) {
      fetchNotifications({ limit: 10 });
      fetchUnreadCount();
    }
  }, [user?._id, fetchNotifications, fetchUnreadCount]);

  // Calculate dropdown position when opening or scrolling
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 384; // w-96 = 384px
        const rightPosition = window.innerWidth - rect.right;
        
        // Ensure dropdown doesn't go off screen
        const finalRight = Math.max(16, Math.min(rightPosition, window.innerWidth - dropdownWidth - 16));
        
        setPosition({
          top: rect.bottom + 8, // 8px below the button
          right: finalRight,
        });
      }
    };

    updatePosition();

    // Update position on scroll or resize
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOnButton = buttonRef.current && buttonRef.current.contains(event.target);
      const clickedOnDropdown = dropdownContentRef.current && dropdownContentRef.current.contains(event.target);
      
      if (!clickedOnButton && !clickedOnDropdown) {
        setIsOpen(false);
        setSelectedNotifications([]);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id || notification._id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
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
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id || n._id));
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </motion.button>

      {/* Dropdown - Using Portal to render outside DOM hierarchy */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownContentRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: `${position.top}px`,
                right: `${position.right}px`,
                zIndex: 99999,
              }}
              className="w-96 max-w-[calc(100vw-32px)] bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  الإشعارات ..
                </h3>
                <div className="flex items-center gap-2">
                  {/* Connection Status */}
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isConnected ? 'متصل' : 'غير متصل'}
                  </span>
                  
                  {/* Settings Button */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <CheckCheck size={14} />
                  تحديد الكل كمقروء
                </button>
                
                {selectedNotifications.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkMarkAsRead}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check size={14} />
                      تحديد المحدد كمقروء
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                      حذف المحدد
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>لا توجد إشعارات </p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Select All Checkbox */}
                  <div className="flex items-center gap-2 p-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      تحديد الكل
                    </span>
                  </div>
                  
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id || notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-3 rounded-lg mb-2 border bg-gray-50 dark:bg-gray-950 `}
                    >
                      <div className="flex items-start gap-3">
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
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                  title="تحديد كمقروء"
                                >
                                  <Eye size={14} className="text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notification.id || notification._id)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                title="حذف"
                              >
                                <Trash2 size={14} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                          
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Confirmation Code Display */}
                          {notification.type === 'confirmation' && notification.confirmationCode && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  رمز التحقق:
                                </span>
                                <span className="text-lg font-mono font-bold text-blue-800 dark:text-blue-200">
                                  {notification.confirmationCode}
                                </span>
                              </div>
                              {notification.expiresAt && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Clock size={12} className="text-blue-600" />
                                  <span className="text-xs text-blue-600 dark:text-blue-400">
                                    ينتهي في: {formatTimeAgo(notification.expiresAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-2">
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => window.location.href = '/notifications'}
                className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                عرض جميع الإشعارات
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
};

export default EnhancedNotificationBell;










