import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import { 
  Menu, 
  X, 
  BookOpen, 
  User, 
  LogOut,
  Home,
  GraduationCap,
  MessageSquare,
  Shield,
  ChevronDown,
  UserCircle,
  Settings,
  Sparkles,
  Users,
  BarChart3,
  CreditCard
} from 'lucide-react';
import NotificationBell from '../NotificationBell';
import EnhancedNotificationBell from '../notifications/EnhancedNotificationBell';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'الرئيسية', href: '/', icon: Home },
    ...(user?.role !== 'parent' ? [{ name: 'الدورات', href: '/courses', icon: BookOpen }] : []),
    ...(user?.role === 'parent' ? [{ name: 'لوحة تحكم ولي الأمر', href: '/parent/dashboard', icon: Shield }] : []),
    { name: 'مجموعاتي', href: '/my-groups', icon: Users },
    ...(user?.role === 'student' ? [{ name: 'الأشتراكات', href: '/my-subscriptions', icon: CreditCard }] : []),
    ...(user?.role === 'student' ? [{ name: 'إحصائياتي', href: '/student/stats', icon: BarChart3 }] : []),
    ...(user?.role === 'admin' ? [{ name: 'لوحة الإدارة', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-luxury-navy-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-luxury-navy-700/50 transition-all duration-300 shadow-lg dark:shadow-luxury-navy-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            {/* Logo Container with Enhanced Styling */}
            <div className={`w-14 h-14 rounded-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-luxury-navy-800 to-luxury-navy-700' 
                : 'bg-gradient-to-br from-white to-gray-50'
            } flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border ${
              isDarkMode 
                ? 'border-luxury-navy-600/30 group-hover:border-luxury-gold-500/50' 
                : 'border-gray-200/50 group-hover:border-luxury-gold-400/50'
            }`}>
              <img 
                src="/src/assets/images/logo.png" 
                alt="ابن مالك Logo" 
                className="w-10 h-10 object-contain transition-all duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                className="hidden w-8 h-8 bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10`} />
            
            {/* Animated Ring */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} 
                 style={{
                   background: 'linear-gradient(45deg, transparent, transparent), linear-gradient(45deg, #f59e0b, #f97316)',
                   backgroundClip: 'padding-box, border-box',
                   backgroundOrigin: 'border-box'
                 }} />
          </div>

          {/* Enhanced Text Styling */}
          <div className="flex flex-col">
            <span className={`text-lg font-bold transition-all duration-300 ${
              isDarkMode 
                ? 'text-white group-hover:text-luxury-gold-400' 
                : 'text-gray-900 group-hover:text-luxury-gold-600'
            }`}>
              ابن مالك
            </span>
            {/* <span className={`text-xs transition-all duration-300 ${
              isDarkMode 
                ? 'text-gray-400 group-hover:text-luxury-gold-300' 
                : 'text-gray-500 group-hover:text-luxury-gold-500'
            }`}>
              منصة التعلم الذكي
            </span> */}
          </div>
        </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group/nav flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                    isActive(item.href)
                      ? 'text-luxury-gold-600 bg-gradient-to-r from-luxury-gold-50 to-luxury-gold-100/50 dark:from-luxury-gold-900/30 dark:to-luxury-gold-800/20 dark:text-luxury-gold-400 shadow-lg border border-luxury-gold-200/50 dark:border-luxury-gold-700/30'
                      : 'text-gray-700 hover:text-luxury-gold-600 dark:text-gray-300 dark:hover:text-luxury-gold-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-luxury-navy-800/50 dark:hover:to-luxury-navy-700/30 hover:shadow-md border border-transparent hover:border-luxury-gold-200/30 dark:hover:border-luxury-gold-700/20'
                  }`}
                >
                  {/* Background Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-luxury-gold-500/10 to-luxury-orange-500/10 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl`} />
                  
                  <Icon className={`h-4 w-4 transition-all duration-300 ${
                    isActive(item.href) 
                      ? 'text-luxury-gold-600 dark:text-luxury-gold-400' 
                      : 'text-gray-600 dark:text-gray-400 group-hover/nav:text-luxury-gold-600 dark:group-hover/nav:text-luxury-gold-400'
                  }`} />
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Active Indicator */}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-luxury-gold-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && (
              <EnhancedNotificationBell />
            )}
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar/Name Button */}
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-luxury-navy-800/50 dark:hover:to-luxury-navy-700/30 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-luxury-gold-200/30 dark:hover:border-luxury-gold-700/20"
                >
                  {/* Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold-500/5 to-luxury-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-luxury-gold-400/20">
                      <span className="text-white text-sm font-bold">
                        {user.firstName?.charAt(0) || 'U'}{user.secondName?.charAt(0) || ''}
                      </span>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-luxury-navy-900"></div>
                  </div>
                  
                  <div className="hidden sm:block text-left relative z-10">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300 group-hover:text-luxury-gold-600 dark:group-hover:text-luxury-gold-400">
                      {user.firstName}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' ? 'مدير النظام' : user.role === 'parent' ? 'ولي أمر' :  'طالب'}
                    </p>
                  </div>
                  
                  <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:text-luxury-gold-600 dark:group-hover:text-luxury-gold-400 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-luxury-navy-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-luxury-navy-700/50 py-3 z-50 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-5 py-4 border-b border-gray-200/50 dark:border-luxury-navy-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">
                              {user.firstName?.charAt(0) || 'U'}{user.secondName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {user.firstName} {user.secondName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.userEmail}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 dark:text-green-400">متصل</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/account');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="group flex items-center w-full px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-luxury-gold-50 hover:to-luxury-orange-50 dark:hover:from-luxury-gold-900/20 dark:hover:to-luxury-orange-900/20 transition-all duration-200 hover:text-luxury-gold-600 dark:hover:text-luxury-gold-400"
                        >
                          <UserCircle className="h-4 w-4 ml-3 transition-colors duration-200 group-hover:text-luxury-gold-600 dark:group-hover:text-luxury-gold-400" />
                          حسابي
                        </button>
                        
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="group flex items-center w-full px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-luxury-gold-50 hover:to-luxury-orange-50 dark:hover:from-luxury-gold-900/20 dark:hover:to-luxury-orange-900/20 transition-all duration-200 hover:text-luxury-gold-600 dark:hover:text-luxury-gold-400"
                        >
                          <Settings className="h-4 w-4 ml-3" />
                          إعدادات الحساب
                        </button>
                        
                        <div className="border-t border-gray-200 dark:border-luxury-navy-700 my-1"></div>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="group flex items-center w-full px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-200 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <LogOut className="h-4 w-4 ml-3 transition-colors duration-200 group-hover:text-red-700 dark:group-hover:text-red-300" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    إنشاء حساب
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 text-gray-300 hover:text-white border border-luxury-navy-600/30' 
                  : 'bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 border border-gray-200/50 shadow-lg hover:shadow-xl'
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 dark:bg-luxury-navy-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-luxury-navy-700/50 shadow-lg overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'text-luxury-gold-600 bg-gradient-to-r from-luxury-gold-50 to-luxury-gold-100/50 dark:from-luxury-gold-900/30 dark:to-luxury-gold-800/20 dark:text-luxury-gold-400 shadow-lg border border-luxury-gold-200/50 dark:border-luxury-gold-700/30'
                          : 'text-gray-700 hover:text-luxury-gold-600 dark:text-gray-300 dark:hover:text-luxury-gold-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-luxury-navy-800/50 dark:hover:to-luxury-navy-700/30 border border-transparent hover:border-luxury-gold-200/30 dark:hover:border-luxury-gold-700/20'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={`h-5 w-5 transition-colors duration-300 ${
                        isActive(item.href) 
                          ? 'text-luxury-gold-600 dark:text-luxury-gold-400' 
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-luxury-gold-600 dark:group-hover:text-luxury-gold-400'
                      }`} />
                      <span>{item.name}</span>
                      {isActive(item.href) && (
                        <div className="ml-auto w-2 h-2 bg-luxury-gold-500 rounded-full"></div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            
            {user && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-luxury-gold-500 to-luxury-gold-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-luxury-navy-900 text-sm font-bold">
                        {user.firstName?.charAt(0) || 'U'}{user.secondName?.charAt(0) || ''}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.firstName} {user.secondName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.userEmail}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        navigate('/account');
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-luxury-navy-800/50 rounded-lg transition-colors duration-200"
                    >
                      <UserCircle className="h-4 w-4 ml-3" />
                      حسابي
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-luxury-navy-800/50 rounded-lg transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4 ml-3" />
                      إعدادات الحساب
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 ml-3" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
