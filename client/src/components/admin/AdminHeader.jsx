import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';
import logo from '/assets/logo.png'
import EnhancedNotificationBell from '../notifications/EnhancedNotificationBell';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Plus,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Crown,
  Bell,
  Moon,
  Sun,
  UserCheck
} from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const headerRef = useRef(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
      if (isProfileDropdownOpen && !event.target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  // Update CSS custom property for header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);

    // Cleanup
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [isMobileMenuOpen]); // Re-calculate when mobile menu opens/closes

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'لوحة التحكم',
      path: '/admin',
      icon: Home,
      description: 'نظرة عامة على لوحة التحكم الرئيسية'
    },
    {
      name: 'الكورسات',
      path: '/admin/courses',
      icon: BookOpen,
      description: 'إدارة جميع الكورسات'
    },
    {
      name: 'المجموعات',
      path: '/admin/groups',
      icon: UserCheck,
      description: 'إدارة مجموعات الطلاب'
    },
    {
      name: 'المستخدمين',
      path: '/admin/users',
      icon: Users,
      description: 'إدارة المستخدمين'
    },
    {
      name: 'الدفع',
      path: '/admin/payments',
      icon: CreditCard,
      description: 'إدارة المدفوعات'
    },
  ];

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b shadow-2xl transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900/98 via-gray-900/95 to-slate-900/98 border-slate-700/30' 
          : 'bg-gradient-to-r from-white/98 via-gray-50/95 to-white/98 border-gray-200/30'
      }`}
    >
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-purple-500'
        }`}></div>
        <div className={`absolute top-0 right-1/4 w-24 h-24 rounded-full blur-2xl opacity-15 ${
          isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
        }`}></div>
      </div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 md:h-22">
          
          {/* Luxury Logo and Brand */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <div 
              className="flex items-center space-x-4 md:space-x-6 cursor-pointer group"
              onClick={() => navigate('/admin')}
            >
              <div className="relative">
                {/* Luxury Logo Container */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-800/90 to-gray-800/90 border-slate-600/50' 
                    : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
                } flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 border-2 backdrop-blur-xl`}>
                  <img 
                    src={logo} 
                    alt="ابن مالك Logo" 
                    className="w-8 h-8 md:w-9 md:h-9 object-contain transition-all duration-500 group-hover:scale-125 filter drop-shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div 
                    className="hidden w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-125 shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Luxury Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 -z-10`} />
              </div>
              
              <div className="hidden sm:block">
                <h1 className={`text-xl md:text-2xl font-black ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-800 bg-clip-text text-transparent'
                } tracking-wide drop-shadow-lg`}>
                  لوحة التحكم
                </h1>
                <p className={`text-sm md:text-base -mt-1 font-semibold ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'
                } drop-shadow-md`}>
                  منصة ابن مالك التعليمية
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-500 group backdrop-blur-xl
                    ${isActive 
                      ? `${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-2xl shadow-blue-600/30 border border-blue-500/30' 
                            : 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white shadow-2xl shadow-blue-500/30 border border-blue-400/30'
                        }` 
                      : `${
                          isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-gray-800/50 border border-transparent hover:border-slate-600/30' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-gray-50/50 border border-transparent hover:border-gray-300/30'
                        }`
                    }
                  `}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`w-5 h-5 transition-all duration-500 ${
                    isActive 
                      ? 'text-white drop-shadow-lg' 
                      : (isDarkMode ? 'text-gray-400 group-hover:text-white group-hover:drop-shadow-lg' : 'text-gray-500 group-hover:text-gray-700 group-hover:drop-shadow-lg')
                  }`} />
                  <span className="tracking-wide font-semibold">{item.name}</span>
                  {isActive && (
                    <motion.div
                      className={`absolute bottom-0 left-1/4 transform -translate-x-1/4 w-12 h-1 rounded-full ${
                        isDarkMode ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      } shadow-lg`}
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
                    />
                  )}
                  
                  {/* Luxury Glow Effect */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-2xl ${
                      isDarkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                    } blur-xl -z-10`} />
                  )}
                </motion.button>
              );
            })}
          </nav>


          {/* Luxury Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Luxury Theme Toggle */}
            <div className={`p-2 rounded-xl backdrop-blur-xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-slate-800/50 border border-slate-600/30 hover:bg-slate-700/50' 
                : 'bg-white/50 border border-gray-200/30 hover:bg-gray-50/50'
            }`}>
              <ThemeToggle size="sm" />
            </div>

            {/* Luxury Notifications */}
            <div className={`p-2 rounded-xl backdrop-blur-xl transition-all duration-500 ${
              isDarkMode 
                ? 'bg-slate-800/50 border border-slate-600/30 hover:bg-slate-700/50' 
                : 'bg-white/50 border border-gray-200/30 hover:bg-gray-50/50'
            }`}>
              <EnhancedNotificationBell />
            </div>

            {/* Luxury Profile Dropdown */}
            <div className="relative" data-profile-dropdown>
              <motion.button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center space-x-4 p-3 rounded-2xl transition-all duration-500 group backdrop-blur-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-slate-800/80 to-gray-800/80 hover:from-slate-700/80 hover:to-gray-700/80 border border-slate-600/40 hover:border-slate-500/60' 
                    : 'bg-gradient-to-r from-white/80 to-gray-50/80 hover:from-gray-100/80 hover:to-gray-50/80 border border-gray-200/40 hover:border-gray-300/60'
                } shadow-xl hover:shadow-2xl`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500' 
                    : 'bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500'
                }`}>
                  <User className="w-5 h-5 text-white font-bold drop-shadow-lg" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-bold transition-colors duration-500 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent'
                  }`}>
                    {user?.firstName || 'مدير'}
                  </p>
                  <p className={`text-xs font-semibold ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'
                  }`}>
                    مدير النظام
                  </p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-all duration-500 ${
                  isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                } ${isProfileDropdownOpen ? 'rotate-180' : ''} drop-shadow-lg`} />
              </motion.button>

              {/* Luxury Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`absolute right-0 mt-3 w-64 backdrop-blur-2xl rounded-2xl shadow-3xl border overflow-hidden ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-slate-900/95 to-gray-900/95 border-slate-700/50' 
                        : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200/50'
                    }`}
                  >
                    {/* Luxury Header */}
                    <div className={`p-6 border-b ${
                      isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500' 
                            : 'bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500'
                        }`}>
                          <User className="w-6 h-6 text-white font-bold drop-shadow-lg" />
                        </div>
                        <div>
                          <p className={`text-base font-bold ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent' 
                              : 'bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent'
                          }`}>
                            {user?.firstName} {user?.secondName}
                          </p>
                          <p className={`text-sm font-semibold ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent' 
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'
                          }`}>
                            {user?.userEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3">
                      <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setIsProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-4 px-6 py-4 text-sm transition-all duration-500 group ${
                          isDarkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-gray-800/50' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-gray-50/50'
                        }`}
                      >
                        <User className={`w-5 h-5 transition-all duration-500 ${
                          isDarkMode ? 'text-gray-400 group-hover:text-white group-hover:drop-shadow-lg' : 'text-gray-500 group-hover:text-gray-700 group-hover:drop-shadow-lg'
                        }`} />
                        <span className="font-bold">الحساب</span>
                      </button>
                      
                      <div className={`border-t my-2 mx-4 ${
                        isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                      }`}></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-4 px-6 py-4 text-sm text-red-500 hover:text-red-400 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-red-100/50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-500 group"
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-all duration-500 drop-shadow-lg" />
                        <span className="font-bold">تسجيل الخروج</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Luxury Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-3 rounded-2xl transition-all duration-500 group backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-slate-800/80 to-gray-800/80 hover:from-slate-700/80 hover:to-gray-700/80 border border-slate-600/40 hover:border-slate-500/60' 
                  : 'bg-gradient-to-r from-white/80 to-gray-50/80 hover:from-gray-100/80 hover:to-gray-50/80 border border-gray-200/40 hover:border-gray-300/60'
              } shadow-xl hover:shadow-2xl`}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              data-mobile-menu
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 transition-all duration-500 drop-shadow-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              ) : (
                <Menu className={`w-6 h-6 transition-all duration-500 drop-shadow-lg ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Luxury Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`lg:hidden border-t backdrop-blur-2xl ${
                isDarkMode 
                  ? 'border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-gray-900/95' 
                  : 'border-gray-200/50 bg-gradient-to-br from-white/95 to-gray-50/95'
              }`}
            >
              <div className="py-6 space-y-3 px-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-left transition-all duration-500 group backdrop-blur-xl
                        ${isActive 
                          ? `${
                              isDarkMode 
                                ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-2xl shadow-blue-600/30 border border-blue-500/30' 
                                : 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white shadow-2xl shadow-blue-500/30 border border-blue-400/30'
                            }` 
                          : `${
                              isDarkMode 
                                ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-gray-800/50 border border-transparent hover:border-slate-600/30' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100/50 hover:to-gray-50/50 border border-transparent hover:border-gray-300/30'
                            }`
                        }
                      `}
                      whileHover={{ scale: 1.03, x: 8 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon className={`w-6 h-6 transition-all duration-500 ${
                        isActive 
                          ? 'text-white drop-shadow-lg' 
                          : (isDarkMode ? 'text-gray-400 group-hover:text-white group-hover:drop-shadow-lg' : 'text-gray-500 group-hover:text-gray-700 group-hover:drop-shadow-lg')
                      }`} />
                      <div>
                        <p className="font-bold text-base tracking-wide">{item.name}</p>
                        <p className={`text-sm font-semibold ${
                          isDarkMode 
                            ? 'text-gray-400 group-hover:text-gray-200' 
                            : 'text-gray-600 group-hover:text-gray-700'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Luxury Glow Effect */}
                      {isActive && (
                        <div className={`absolute inset-0 rounded-2xl ${
                          isDarkMode ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                        } blur-xl -z-10`} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default AdminHeader;
