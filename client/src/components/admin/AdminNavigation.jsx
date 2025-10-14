import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/button';
import Input from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../NotificationBell';
import { 
  Search, 
  Bell,
  LogOut,
  Home,
  BookOpen,
  CreditCard,
  MessageSquare,
  Settings,
  Shield,
  User,
  ChevronDown,
  X,
  Menu
} from 'lucide-react';

const AdminNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Admin-only navigation items
  const adminNavigationItems = [
    { name: 'لوحة التحكم', href: '/admin', icon: Home },
    { name: 'الدورات', href: '/admin/courses', icon: BookOpen },
    { name: 'المدفوعات', href: '/admin/payments', icon: CreditCard },
    { name: 'الإشعارات', href: '/admin/notifications', icon: Bell },
    { name: 'المستخدمين', href: '/admin/users', icon: User },
    { name: 'الإحصائيات', href: '/admin/analytics', icon: Shield },
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ];

  // Mock notifications
  const notifications = [
    { id: 1, title: 'دفعة جديدة', message: 'طلب دفع من أحمد محمد', time: 'منذ 5 دقائق', unread: true },
    { id: 2, title: 'رسالة جديدة', message: 'رسالة من الطالب سارة', time: 'منذ 15 دقيقة', unread: true },
    { id: 3, title: 'دورة جديدة', message: 'تم إضافة دورة البلاغة', time: 'منذ ساعة', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin' && !location.search;
    }
    return location.pathname.startsWith(href) || location.search.includes(href.split('?')[1]);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                لوحة الإدارة
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                نظام إدارة التعلم
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {adminNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg'
                      : 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.secondName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    مدير النظام
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full bg-gray-50 dark:bg-gray-800"
                />
              </div>

              {adminNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600'
                        : 'text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AdminNavigation;
