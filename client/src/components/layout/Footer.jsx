import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Youtube, 
  Twitter, 
  Facebook,
  Heart,
  Sparkles,
  Globe,
  Shield,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '/assets/logo.png'

const Footer = () => {
  const { isDarkMode } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const socialIconVariants = {
    hover: { 
      scale: 1.2, 
      rotate: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { scale: 0.9 }
  };

  const linkVariants = {
    hover: { 
      scale: 1.05,
      x: -3,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const yansyTextVariants = {
    hover: {
      scale: 1.08,
      transition: { duration: 0.3 }
    }
  };

  const yansyClickVariants = {
    click: {
      scale: [1, 1.3, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const heartVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Social media links
  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/201022880651',
      color: 'text-green-500 hover:text-green-400',
      glowColor: 'hover:shadow-green-500/50'
    },
    {
      name: 'Telegram',
      icon: Send,
      href: 'https://t.me/apnayhay?direct',
      color: 'text-blue-500 hover:text-blue-400',
      glowColor: 'hover:shadow-blue-500/50'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'http://youtube.com/channel/UCQZZYZSnK-y0OjGBWbKAz-w',
      color: 'text-red-500 hover:text-red-400',
      glowColor: 'hover:shadow-red-500/50'
    },
    // {
    //   name: 'Twitter',
    //   icon: Twitter,
    //   href: 'https://twitter.com/yansy_platform',
    //   color: 'text-sky-500 hover:text-sky-400',
    //   glowColor: 'hover:shadow-sky-500/50'
    // },
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://www.facebook.com/profile.php?id=61579112995364&locale=ar_AR',
      color: 'text-blue-600 hover:text-blue-500',
      glowColor: 'hover:shadow-blue-600/50'
    }
  ];

  // Quick links
  const quickLinks = [
    {
      name: 'عن المنصة',
      href: '/about',
      icon: Globe
    },
    {
      name: 'اتصل بنا',
      href: '/contact',
      icon: Mail
    },
    {
      name: 'سياسة الخصوصية',
      href: '/privacy',
      icon: Shield
    },
    {
      name: 'الشروط والأحكام',
      href: '/terms',
      icon: FileText
    }
  ];

  const handleYansyClick = () => {
    // Open WhatsApp in new tab
    window.open('https://wa.me/201090385390', '_blank');
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`relative mt-auto ${
        isDarkMode 
          ? 'bg-gradient-to-br from-luxury-navy-900 via-luxury-navy-800 to-luxury-navy-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      } border-t ${
        isDarkMode 
          ? 'border-luxury-navy-700/50' 
          : 'border-gray-200/50'
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
            : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
        } blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-luxury-sky-500 to-luxury-emerald-500' 
            : 'bg-gradient-to-br from-luxury-sky-400 to-luxury-emerald-400'
        } blur-3xl`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Section - Logo & Brand */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center lg:items-start space-y-6"
          >
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  isDarkMode 
                    ? 'from-luxury-gold-500 to-luxury-orange-500' 
                    : 'from-luxury-gold-400 to-luxury-orange-400'
                } p-1 shadow-2xl`}>
                  <div className={`w-full h-full rounded-xl ${
                    isDarkMode ? 'bg-luxury-navy-800' : 'bg-white'
                  } flex items-center justify-center`}>
                    <img 
                      src={logo} 
                      alt="YANSY Logo" 
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="hidden w-10 h-10 bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500 rounded-lg flex items-center justify-center"
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                  isDarkMode 
                    ? 'from-luxury-gold-500 to-luxury-orange-500' 
                    : 'from-luxury-gold-400 to-luxury-orange-400'
                } opacity-20 blur-lg -z-10`} />
              </div>
              
              <div>
                <h3 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ابن مالك
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  منصة التعلم الذكي
                </p>
              </div>
            </div>

            {/* Made by YANSY text with animated effect */}
            <motion.div 
              variants={itemVariants}
              className="text-center lg:text-right"
            >
              <div className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Carefully developed by{' '}
                <motion.span
                  variants={yansyTextVariants}
                  whileHover="hover"
                  whileTap="click"
                  animate="click"
                  onClick={handleYansyClick}
                  className="relative inline-block font-black text-2xl bg-gradient-to-r from-luxury-gold-500 via-luxury-orange-500 to-luxury-gold-500 bg-clip-text text-transparent animate-gradient-shift cursor-pointer select-none"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease-in-out infinite'
                  }}
                >
                  YANSY
                  {/* Shimmer effect overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0"
                    animate={{
                      opacity: [0, 1, 0],
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      backgroundSize: '200% 100%'
                    }}
                  />
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 opacity-20 blur-sm -z-10`} />
                </motion.span>
                {' '}
                <motion.span
                  variants={heartVariants}
                  animate="pulse"
                  className="inline-block text-red-500 text-2xl cursor-pointer select-none"
                  onClick={handleYansyClick}
                >
                  ❤️
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Center Section - Quick Links */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center lg:items-center space-y-6"
          >
            <h4 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              روابط سريعة
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`group flex items-center space-x-2 p-3 rounded-xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'hover:bg-luxury-navy-700/50 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <link.icon className={`w-5 h-5 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-luxury-gold-500 group-hover:text-luxury-gold-400' 
                      : 'text-luxury-gold-600 group-hover:text-luxury-gold-500'
                  }`} />
                  <span className="font-medium text-sm group-hover:underline group-hover:underline-offset-4 group-hover:decoration-luxury-gold-500">
                    {link.name}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right Section - Social Media */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center lg:items-end space-y-6"
          >
            <h4 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              تابعنا
            </h4>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={socialIconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`group relative p-4 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50' 
                      : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl'
                  } border ${
                    isDarkMode 
                      ? 'border-luxury-navy-600/30 hover:border-luxury-navy-500/50' 
                      : 'border-gray-200/50 hover:border-gray-300/50'
                  }`}
                  aria-label={`تابعنا على ${social.name}`}
                >
                  <social.icon className={`w-6 h-6 ${social.color} transition-all duration-300`} />
                  
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${social.glowColor} shadow-lg blur-sm`} />
                  
                  {/* Tooltip */}
                  <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-800 text-white border border-luxury-navy-600' 
                      : 'bg-gray-900 text-white'
                  }`}>
                    {social.name}
                    <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                      isDarkMode ? 'border-t-luxury-navy-800' : 'border-t-gray-900'
                    }`} />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Contact Info */}
            <motion.div 
              variants={itemVariants}
              className={`text-center lg:text-right space-y-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center lg:justify-end space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@yansy.com</span>
              </div>
              <div className="flex items-center justify-center lg:justify-end space-x-2">
                <Phone className="w-4 h-4" />
                <a 
                  href="https://wa.me/201022880651" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-luxury-gold-400 transition-colors duration-300"
                >
                  +201022880651
                </a>
              </div>
              
              {/* WhatsApp Contact Button */}
              <div className="flex items-center justify-center lg:justify-end space-x-2 mt-3">
                <MessageSquare className="w-4 h-4" />
                <a 
                  href="https://wa.me/201022880651" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors duration-300 flex items-center space-x-1"
                >
                  <span>تواصل معنا على WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
   
        </div>

        {/* Bottom Section - Copyright */}
        <motion.div 
          variants={itemVariants}
          className={`mt-12 pt-8 border-t ${
            isDarkMode 
              ? 'border-luxury-navy-700/50' 
              : 'border-gray-200/50'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <motion.p 
              variants={itemVariants}
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              ©2025YANSY Platform. جميع الحقوق محفوظة.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex items-center space-x-4"
            >
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                الإصدار 2.0.1
              </span>
              <div className={`w-2 h-2 rounded-full ${
                isDarkMode ? 'bg-luxury-emerald-500' : 'bg-green-500'
              } animate-pulse`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-luxury-emerald-400' : 'text-green-600'
              }`}>
                متصل
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating WhatsApp Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <a
          href="https://wa.me/201022880651"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2 group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden group-hover:block text-sm font-medium whitespace-nowrap">
            تواصل مع المعلم
          </span>
        </a>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
