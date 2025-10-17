import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, BookOpen, Award, CheckCircle, Globe, Zap, Heart, Sparkles, BookMarked, PenTool } from 'lucide-react';

const HeroSection = () => {
  const features = [
    { icon: BookMarked, text: "مناهج الأزهر المعتمدة" },
    { icon: Heart, text: "متابعة شخصية" },
    { icon: Sparkles, text: "جودة عالية" },
    { icon: PenTool, text: "متاح عالمياً" }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/50 dark:from-slate-900 dark:via-cyan-900/30 dark:to-blue-900/40 overflow-hidden">
      {/* Luxury Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Premium gradient orbs */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-20 dark:opacity-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-3xl shadow-[0_0_100px_rgba(6,182,212,0.3)]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -45, 0],
            y: [0, 40, 0],
            scale: [1, 0.95, 1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-20 dark:opacity-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.3)]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-15 dark:opacity-8 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 blur-3xl shadow-[0_0_80px_rgba(168,85,247,0.2)]" 
        />
        
        {/* Luxury floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Elegant grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)]" />
        
        {/* Luxury overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-white/10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          {/* Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ 
              scale: 1.03,
              y: -2,
              boxShadow: "0 20px 40px rgba(6,182,212,0.2)"
            }}
            className="group inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/40 dark:via-blue-900/40 dark:to-purple-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-500 mb-8 border border-cyan-300/60 dark:border-cyan-600/40 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Luxury shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative z-10"
            >
              <Zap className="w-5 h-5 mr-3 text-cyan-500 drop-shadow-lg" />
            </motion.div>
            <span className="relative z-10 bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent font-bold">
              مع الأستاذة / جميلة السيد - معلمة اللغة العربية
            </span>
          </motion.div>

          {/* Luxury Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 text-gray-900 dark:text-white relative"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-cyan-500 dark:text-cyan-400 drop-shadow-2xl"
              >
                <BookOpen size={40} className="sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" />
              </motion.div>
              <span className="p-3 bg-gradient-to-r from-gray-900 via-cyan-600 via-blue-600 to-purple-600 dark:from-white dark:via-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent drop-shadow-lg font-black tracking-wide">
                 111111111111111111111111  منصة ابن مالك
              </span>
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="text-cyan-500 dark:text-cyan-400 drop-shadow-2xl"
              >
                <Star size={40} className="sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" />
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="text-cyan-500 dark:text-cyan-400 drop-shadow-2xl"
              >
                <Heart size={36} className="sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12" />
              </motion.div>
              <span className=" pb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-cyan-600 via-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent font-bold tracking-wide drop-shadow-lg">
                للتعليم الأزهري المتميز1111
              </span>
            </div>
          </motion.h1>

          {/* Luxury Subtitle */}
          {/* <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 leading-relaxed max-w-4xl mx-auto mb-10 font-medium"
          >
    9999999999999 dfsad اكتشف عالم المواد العربية الأزهرية بطريقة حديثة ومتطورة
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-bold drop-shadow-lg">
              مع أفضل المعلمين وأحدث التقنيات التعليمية
            </span>
          </motion.p> */}

          {/* Luxury Features List */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 15px 30px rgba(6,182,212,0.2)",
                  transition: { duration: 0.3 }
                }}
                className="group inline-flex items-center justify-center px-5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/40 dark:via-blue-900/40 dark:to-purple-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-500 border border-cyan-300/60 dark:border-cyan-600/40 backdrop-blur-xl relative overflow-hidden"
              >
                {/* Luxury shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.3 }}
                  className="relative z-10"
                >
                  <feature.icon className="w-5 h-5 mr-3 text-cyan-500 drop-shadow-lg" />
                </motion.div>
                <span className="relative z-10 bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-300 dark:to-blue-300 bg-clip-text text-transparent font-bold">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Luxury CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link
              to="/courses"
              className="group inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-lg sm:text-xl shadow-2xl hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Luxury shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Play className="w-6 h-6 mr-3 drop-shadow-lg" />
              </motion.div>
              <span className="relative z-10 drop-shadow-lg">ابدأ رحلتك التعليمية</span>
              <ArrowRight className="w-5 h-5 mr-3 relative z-10 drop-shadow-lg" />
            </Link>

            <Link
              to="/parent/demo"
              className="group inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 rounded-2xl border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold text-lg sm:text-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:via-blue-50 hover:to-purple-50 dark:hover:from-cyan-900/30 dark:hover:via-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-500 hover:scale-105 hover:-translate-y-2 backdrop-blur-xl relative overflow-hidden shadow-xl hover:shadow-2xl"
            >
              {/* Luxury shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="relative z-10"
              >
                <Users className="w-6 h-6 mr-3 drop-shadow-lg" />
              </motion.div>
              <span className="relative z-10 drop-shadow-lg">لوحة تحكم ولي الأمر</span>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;