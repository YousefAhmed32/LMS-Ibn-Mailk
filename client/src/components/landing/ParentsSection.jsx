import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Bell, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Award,
  Eye,
  Play,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Target,
  Heart
} from 'lucide-react';

const ParentsSection = () => {
  const [animatedStats, setAnimatedStats] = useState({
    attendance: 0,
    progress: 0,
    grades: 0,
    videos: 0
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Animate counters when section comes into view
  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      const animateCounter = (key, target) => {
        let current = 0;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, stepDuration);
      };

      animateCounter('attendance', 95);
      animateCounter('progress', 87);
      animateCounter('grades', 92);
      animateCounter('videos', 78);
    }
  }, [isInView]);

  const features = [
    {
      icon: BarChart3,
      title: "تتبع الدرجات والنتائج",
      description: "راقب درجات طفلك في جميع مواد اللغة العربية والامتحانات",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: TrendingUp,
      title: "متابعة التقدم التعليمي",
      description: "تتبع تقدم طفلك في الدورات والفيديوهات",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Clock,
      title: "متابعة الحضور والفيديوهات",
      description: "راقب حضور طفلك ومشاهدة الفيديوهات التعليمية",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Bell,
      title: "إشعارات فورية",
      description: "احصل على إشعارات فورية حول تقدم طفلك",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const dashboardStats = [
    { label: "نسبة الحضور", value: animatedStats.attendance, suffix: "%", color: "text-green-400" },
    { label: "التقدم العام", value: animatedStats.progress, suffix: "%", color: "text-blue-400" },
    { label: "متوسط الدرجات", value: animatedStats.grades, suffix: "%", color: "text-purple-400" },
    { label: "الفيديوهات المشاهدة", value: animatedStats.videos, suffix: "%", color: "text-orange-400" }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white/10"></div>
            ))}
          </div>
        </div>

        {/* Animated Lines */}
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 backdrop-blur-sm"
            >
              <Heart className="w-4 h-4 text-pink-400 mr-2" />
              <span className="text-sm font-medium text-blue-300">للوالدين</span>
            </motion.div>

            {/* Main Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold leading-tight"
            >
              <span className="p-5 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                ابق متصلاً
              </span>
              <br />
              <span className="p-5 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                بنجاح بنجلك
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 leading-relaxed max-w-lg"
            >
              مع لوحة تحكم ولي الأمر، يمكنك مراقبة الدرجات والحضور والتقدم في الوقت الفعلي باستخدام معرف الطالب الفريد.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group"
                >
                  <div className={`p-4 rounded-xl ${feature.bgColor} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 group-hover:scale-105`}>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/parent/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">جرب لوحة تحكم ولي الأمر</span>
                <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/parent/demo"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg backdrop-blur-sm hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                عرض تجريبي
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Container */}
            <div className="relative">
              {/* Main Dashboard Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-6 shadow-2xl border border-white/10 backdrop-blur-xl"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                {/* Card Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>
                
                {/* Header */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">لوحة تحكم ولي الأمر</h3>
                        <p className="text-gray-400 text-sm">متابعة تقدم الطالب</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">متصل</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                  {dashboardStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">{stat.label}</span>
                        <span className={`text-lg font-bold ${stat.color}`}>
                          {stat.value}{stat.suffix}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${
                            stat.color === 'text-green-400' ? 'from-green-400 to-emerald-500' :
                            stat.color === 'text-blue-400' ? 'from-blue-400 to-cyan-500' :
                            stat.color === 'text-purple-400' ? 'from-purple-400 to-violet-500' :
                            'from-orange-400 to-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${stat.value}%` } : {}}
                          transition={{ duration: 1.5, delay: 0.8 + index * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="relative z-10">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-blue-400" />
                    النشاط الأخير
                  </h4>
                  <div className="space-y-3">
                    {[
                      { icon: BookOpen, text: "تم إكمال درس النحو", time: "منذ 5 دقائق", color: "text-green-400" },
                      { icon: Award, text: "حصل على درجة ممتاز في الامتحان", time: "منذ ساعة", color: "text-blue-400" },
                      { icon: Clock, text: "شاهد فيديو جديد", time: "منذ ساعتين", color: "text-purple-400" }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.text}</p>
                          <p className="text-gray-400 text-xs">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Star className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, 8, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ParentsSection;
