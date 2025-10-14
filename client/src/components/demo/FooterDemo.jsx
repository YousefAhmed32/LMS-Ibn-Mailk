import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Footer from '../layout/Footer';
import { Sun, Moon, Sparkles, Star, Heart, Zap } from 'lucide-react';

const FooterDemo = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-50 ${
          isDarkMode 
            ? 'bg-luxury-navy-900/95' 
            : 'bg-white/95'
        } backdrop-blur-md border-b ${
          isDarkMode 
            ? 'border-luxury-navy-700/50' 
            : 'border-gray-200/50'
        } shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Footer Demo
                </h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Premium Footer Component Showcase
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={toggleTheme}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-luxury-navy-700 hover:bg-luxury-navy-600 shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 shadow-lg'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-luxury-gold-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Demo Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <h2 className={`text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Premium Footer Component
            </h2>
            <p className={`text-xl mb-8 max-w-4xl mx-auto leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Experience our luxury footer design with premium gradients, smooth animations, 
              full dark/light mode support, and Arabic text integration. The "YANSY" text is clickable 
              and will redirect to WhatsApp! Scroll down to see the footer in action!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30' 
                    : 'bg-luxury-gold-100 text-luxury-gold-600 border border-luxury-gold-200'
                }`}
              >
                <span className="font-medium">🎨 Luxury Design</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-emerald-500/20 text-luxury-emerald-400 border border-luxury-emerald-500/30' 
                    : 'bg-luxury-emerald-100 text-luxury-emerald-600 border border-luxury-emerald-200'
                }`}
              >
                <span className="font-medium">🌙 Dark/Light Mode</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-sky-500/20 text-luxury-sky-400 border border-luxury-sky-500/30' 
                    : 'bg-luxury-sky-100 text-luxury-sky-600 border border-luxury-sky-200'
                }`}
              >
                <span className="font-medium">🎬 Smooth Animations</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <span className="font-medium">❤️ Clickable YANSY</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`p-8 rounded-3xl shadow-2xl border ${
                isDarkMode 
                  ? 'bg-luxury-navy-800/90 border-luxury-navy-600/30' 
                  : 'bg-white/90 border-gray-200/50'
              } backdrop-blur-md hover:shadow-3xl transition-all duration-500`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Luxury Design
              </h3>
              <p className={`text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Premium gradients, glass morphism effects, and modern UI elements that create a sophisticated and professional appearance.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-8 rounded-3xl shadow-2xl border ${
                isDarkMode 
                  ? 'bg-luxury-navy-800/90 border-luxury-navy-600/30' 
                  : 'bg-white/90 border-gray-200/50'
              } backdrop-blur-md hover:shadow-3xl transition-all duration-500`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-luxury-emerald-500 to-luxury-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Sun className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Dark/Light Mode
              </h3>
              <p className={`text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Seamless theme switching with adaptive colors, smooth transitions, and consistent styling across all elements.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`p-8 rounded-3xl shadow-2xl border ${
                isDarkMode 
                  ? 'bg-luxury-navy-800/90 border-luxury-navy-600/30' 
                  : 'bg-white/90 border-gray-200/50'
              } backdrop-blur-md hover:shadow-3xl transition-all duration-500`}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-luxury-sky-500 to-luxury-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Smooth Animations
              </h3>
              <p className={`text-lg leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Framer Motion animations with hover effects, micro-interactions, and smooth transitions that enhance user experience.
              </p>
            </motion.div>
          </div>

          {/* Enhanced Content Sections */}
          <div className="space-y-12">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: item * 0.1 }}
                className={`p-10 rounded-3xl shadow-xl border ${
                  isDarkMode 
                    ? 'bg-luxury-navy-800/50 border-luxury-navy-600/30' 
                    : 'bg-white/50 border-gray-200/50'
                } backdrop-blur-sm hover:shadow-2xl transition-all duration-500`}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${
                    item % 3 === 0 
                      ? 'from-luxury-gold-500 to-luxury-orange-500'
                      : item % 3 === 1
                      ? 'from-luxury-emerald-500 to-luxury-emerald-600'
                      : 'from-luxury-sky-500 to-luxury-sky-600'
                  } flex items-center justify-center shadow-lg`}>
                    {item % 3 === 0 ? (
                      <Star className="h-6 w-6 text-white" />
                    ) : item % 3 === 1 ? (
                      <Heart className="h-6 w-6 text-white" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Content Section {item}
                  </h3>
                </div>
                <p className={`text-lg leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  This is sample content to demonstrate how the footer behaves with different page lengths. 
                  The footer will stick to the bottom when content is short, and scroll naturally when content is long.
                  Notice how the footer maintains its beautiful design, smooth animations, and luxury gradients 
                  regardless of the content above it. The responsive design adapts perfectly to all screen sizes.
                  <strong className="text-luxury-gold-500"> Try clicking on "YANSY" in the footer!</strong>
                </p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={`mt-20 p-12 rounded-3xl shadow-2xl border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-luxury-navy-800/90 to-luxury-navy-700/90 border-luxury-navy-600/30' 
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
            } backdrop-blur-md text-center`}
          >
            <h3 className={`text-4xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Footer Ready for Production
            </h3>
            <p className={`text-xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              The footer component is fully integrated and ready to use across your entire application. 
              It provides a consistent, professional, and engaging experience for your users.
              <strong className="text-luxury-gold-500"> The "YANSY" text is clickable and will open WhatsApp!</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30' 
                    : 'bg-luxury-gold-100 text-luxury-gold-600 border border-luxury-gold-200'
                }`}
              >
                <span className="font-medium">✅ Fully Responsive</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-emerald-500/20 text-luxury-emerald-400 border border-luxury-emerald-500/30' 
                    : 'bg-luxury-emerald-100 text-luxury-emerald-600 border border-luxury-emerald-200'
                }`}
              >
                <span className="font-medium">✅ Arabic Support</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-luxury-sky-500/20 text-luxury-sky-400 border border-luxury-sky-500/30' 
                    : 'bg-luxury-sky-100 text-luxury-sky-600 border border-luxury-sky-200'
                }`}
              >
                <span className="font-medium">✅ Accessibility Ready</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <span className="font-medium">✅ Clickable YANSY</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FooterDemo;
