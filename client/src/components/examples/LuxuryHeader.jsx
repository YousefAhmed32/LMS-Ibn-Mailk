import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Trophy, 
  User, 
  Bell, 
  Settings,
  Menu,
  X,
  Crown,
  Star,
  Sparkles
} from 'lucide-react';

const LuxuryHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <>
      {/* Premium Navigation Header */}
      <header className="relative bg-gradient-gold-horizontal-primary shadow-gold-glow overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-gold-shimmer animate-shimmer bg-[length:200%_100%]" />
        </div>
        
        <div className="relative z-10">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-3"
              >
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-gold-text-primary bg-clip-text text-transparent">
                    EduLuxury
                  </h1>
                  <p className="text-xs text-luxury-gold-light-gold font-medium">
                    Premium Education Platform
                  </p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden md:flex items-center space-x-8"
              >
                <a href="#" className="text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-2 group">
                  <BookOpen className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Courses</span>
                </a>
                <a href="#" className="text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-2 group">
                  <Trophy className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Achievements</span>
                </a>
                <a href="#" className="text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-2 group">
                  <User className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Profile</span>
                </a>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center space-x-4"
              >
                {/* Notifications */}
                <button className="relative p-2 text-white hover:text-luxury-gold-light-gold transition-colors duration-300 group">
                  <Bell className="h-6 w-6 group-hover:animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-rose-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    3
                  </span>
                </button>

                {/* Settings */}
                <button className="p-2 text-white hover:text-luxury-gold-light-gold transition-colors duration-300 group">
                  <Settings className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Premium Badge */}
                <div className="hidden lg:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                  <Star className="h-4 w-4 text-luxury-gold-bright-gold animate-pulse" />
                  <span className="text-white text-sm font-medium">Premium</span>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-white hover:text-luxury-gold-light-gold transition-colors duration-300"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </motion.div>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMenuOpen ? 1 : 0, 
          height: isMenuOpen ? 'auto' : 0 
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-gradient-gold-vertical-primary shadow-gold-shadow overflow-hidden"
      >
        <div className="container mx-auto px-6 py-4 space-y-4">
          <a href="#" className="block text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-3">
            <BookOpen className="h-5 w-5" />
            <span>Courses</span>
          </a>
          <a href="#" className="block text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-3">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </a>
          <a href="#" className="block text-white hover:text-luxury-gold-light-gold transition-colors duration-300 flex items-center space-x-3">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </a>
          <div className="pt-4 border-t border-white/20">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 w-fit">
              <Star className="h-4 w-4 text-luxury-gold-bright-gold animate-pulse" />
              <span className="text-white text-sm font-medium">Premium Member</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section Example */}
      <section className="bg-gradient-gold-diagonal-primary min-h-[60vh] flex items-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-luxury-gold-bright-gold animate-pulse" />
              <span className="text-luxury-gold-light-gold font-semibold tracking-wide uppercase text-sm">
                Premium Education
              </span>
              <Sparkles className="h-6 w-6 text-luxury-gold-bright-gold animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              Luxury Learning
            </h1>
            
            <p className="text-xl md:text-2xl text-luxury-gold-light-gold mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience premium education with our exclusive courses, personalized mentorship, and luxury learning environment.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-gold-glow-hover font-semibold text-lg"
              >
                Start Premium Journey
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-luxury-gold-light-gold transition-colors duration-300 font-semibold text-lg flex items-center space-x-2"
              >
                <span>Watch Demo</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Example */}
      <section className="py-20 bg-gray-50 dark:bg-luxury-navy-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Premium Course Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-gradient-gold-radial-primary p-8 rounded-2xl shadow-gold-shadow hover:shadow-gold-glow-hover transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Premium Courses
                </h3>
                <p className="text-luxury-gold-light-gold mb-6">
                  Access exclusive content and premium features designed for luxury learning.
                </p>
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                  Explore Courses
                </button>
              </div>
            </motion.div>

            {/* Achievement Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-gradient-gold-diagonal-secondary p-8 rounded-2xl shadow-gold-shadow hover:shadow-gold-glow-hover transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Achievements
                </h3>
                <p className="text-luxury-gold-light-gold mb-6">
                  Earn prestigious certificates and unlock exclusive rewards.
                </p>
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                  View Achievements
                </button>
              </div>
            </motion.div>

            {/* Mentorship Card */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-gradient-gold-vertical-metallic p-8 rounded-2xl shadow-gold-shadow hover:shadow-gold-glow-hover transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Personal Mentorship
                </h3>
                <p className="text-luxury-gold-light-gold mb-6">
                  Get personalized guidance from industry experts and mentors.
                </p>
                <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                  Find Mentor
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LuxuryHeader;
