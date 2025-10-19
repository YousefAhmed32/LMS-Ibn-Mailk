import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  Home, 
  ArrowLeft, 
  Crown,
  Sparkles,
  Heart,
  Users,
  Settings,
  BookOpen
} from 'lucide-react';

const AccessDeniedPage = ({ 
  title = "غير مصرح بالوصول",
  message = "عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة",
  showBackButton = true,
  showHomeButton = true 
}) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const sparkleVariants = {
    sparkle: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Quick navigation items
  const quickNavItems = [
    { name: 'الرئيسية', path: '/', icon: Home, color: 'from-blue-500 to-purple-600' },
    { name: 'الدورات', path: '/courses', icon: BookOpen, color: 'from-green-500 to-teal-600' },
    { name: 'المجموعات', path: '/my-groups', icon: Users, color: 'from-orange-500 to-red-600' },
    { name: 'الإعدادات', path: '/settings', icon: Settings, color: 'from-purple-500 to-pink-600' }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-red-900 to-orange-900' : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'} flex items-center justify-center p-4`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-xl"
          variants={floatingVariants}
          animate="float"
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-full blur-xl"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-xl"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        />
        
        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            variants={sparkleVariants}
            animate="sparkle"
            transition={{ delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main error content */}
        <motion.div
          className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-xl rounded-3xl shadow-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'} p-8 md:p-12 text-center`}
          variants={itemVariants}
        >
          {/* Access denied icon with luxury styling */}
          <motion.div
            className="relative mb-8"
            variants={itemVariants}
          >
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              403
            </div>
            <motion.div
              className="absolute -top-4 -right-4"
              variants={sparkleVariants}
              animate="sparkle"
            >
              <Shield className="w-12 h-12 text-red-500" />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4"
              variants={sparkleVariants}
              animate="sparkle"
              transition={{ delay: 1 }}
            >
              <Lock className="w-10 h-10 text-orange-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
            variants={itemVariants}
          >
            {title}
          </motion.h1>

          {/* Message */}
          <motion.p
            className={`text-lg md:text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed`}
            variants={itemVariants}
          >
            {message}
          </motion.p>

          {/* Warning info */}
          <motion.div
            className={`${isDarkMode ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'} border rounded-xl p-4 mb-8`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                هذه الصفحة محمية وتتطلب صلاحيات خاصة للوصول إليها
              </span>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            variants={itemVariants}
          >
            {showBackButton && (
              <motion.button
                onClick={handleGoBack}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                العودة للخلف
              </motion.button>
            )}

            {showHomeButton && (
              <motion.button
                onClick={handleGoHome}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                الصفحة الرئيسية
              </motion.button>
            )}
          </motion.div>

          {/* Quick navigation */}
          <motion.div
            className="border-t border-gray-200/50 dark:border-gray-700/50 pt-8"
            variants={itemVariants}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              التنقل السريع
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickNavItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`group p-3 rounded-xl bg-gradient-to-r ${item.color} text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom decorative text */}
        <motion.div
          className="text-center mt-8"
          variants={itemVariants}
        >
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center justify-center gap-2`}>
            <Heart className="w-4 h-4 text-red-500" />
            مصمم بعناية لتحسين تجربتك
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AccessDeniedPage;
