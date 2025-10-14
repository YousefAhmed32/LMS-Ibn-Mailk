import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  X, 
  Home, 
  Users, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Menu
} from 'lucide-react';

const MobileNavigation = ({ isOpen, onClose, activeTab, onTabChange }) => {
  const { isDark } = useTheme();

  const navigationItems = [
    { id: 'overview', name: 'نظرة عامة', icon: Home },
    { id: 'users', name: 'المستخدمين', icon: Users },
    { id: 'courses', name: 'الدورات', icon: BookOpen },
    { id: 'payments', name: 'المدفوعات', icon: CreditCard },
    { id: 'analytics', name: 'التحليلات', icon: BarChart3 },
    { id: 'messages', name: 'الرسائل', icon: MessageSquare },
    { id: 'settings', name: 'الإعدادات', icon: Settings }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Mobile Navigation */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl"
          >
            <Card className="h-full rounded-none border-0">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">A</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        لوحة التحكم
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        إدارة النظام
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 p-4 space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onTabChange(item.id);
                          onClose();
                        }}
                        className={`w-full flex items-center space-x-3 p-4 rounded-lg text-right transition-all duration-300 ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveTab"
                            className="w-2 h-2 bg-blue-500 rounded-full"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      نظام إدارة التعلم الإلكتروني
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      الإصدار 2.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigation;
