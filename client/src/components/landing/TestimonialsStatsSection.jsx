import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Quote, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';

const TestimonialsStatsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    satisfaction: 0,
    courses: 0
  });

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const testimonials = [
    {
      id: 1,
      name: "أحمد محمد",
      role: "طالب في الصف الثالث الإعدادي",
      avatar: "👨‍🎓",
      content: "منصة ابن مالك غيرت طريقة تعلمي للغة العربية تماماً. الشرح واضح والمحتوى ممتع جداً!",
      rating: 5,
      highlight: "غيرت طريقة تعلمي"
    },
    {
      id: 2,
      name: "فاطمة أحمد",
      role: "والدة طالب",
      avatar: "👩‍👦",
      content: "أشكر المنصة على لوحة تحكم ولي الأمر الرائعة. أستطيغ متابعة تقدم ابني بسهولة وثقة.",
      rating: 5,
      highlight: "لوحة تحكم رائعة"
    },
    {
      id: 3,
      name: "محمد علي",
      role: "طالب في الصف الثاني الثانوي",
      avatar: "👨‍🎓",
      content: "النظام التفاعلي والشارات جعلتني متحمساً للتعلم أكثر. الدرجات تحسنت بشكل ملحوظ!",
      rating: 5,
      highlight: "النظام التفاعلي"
    }
  ];

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

      animateCounter('students', 25000);
      animateCounter('satisfaction', 98);
      animateCounter('courses', 500);
    }
  }, [isInView]);

  // Auto-play testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              ماذا يقولون عنا؟
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            اكتشف تجارب الطلاب وولي الأمر مع من平台 ابن مالك
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Testimonial */}
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-8 lg:p-10 border border-white/20 dark:border-gray-700/50 shadow-xl">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-lg lg:text-xl text-gray-900 dark:text-white leading-relaxed mb-8 font-medium">
                      "{testimonials[currentSlide].content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                        {testimonials[currentSlide].avatar}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {testimonials[currentSlide].name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {testimonials[currentSlide].role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Arrows */}
              <motion.button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </motion.button>

              <motion.button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </motion.button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">أرقام تتحدث عن نفسها</h3>
            
            <div className="space-y-8">
              {[
                {
                  icon: Users,
                  value: animatedStats.students.toLocaleString(),
                  suffix: '+',
                  label: 'طالب نشط',
                  description: 'طلاب من جميع أنحاء العالم العربي',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: CheckCircle,
                  value: animatedStats.satisfaction,
                  suffix: '%',
                  label: 'معدل الرضا',
                  description: 'طلاب راضون عن تجربتهم التعليمية',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Award,
                  value: animatedStats.courses,
                  suffix: '+',
                  label: 'دورة تعليمية',
                  description: 'دورات متنوعة ومتطورة',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group"
                >
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {stat.value}{stat.suffix}
                        </div>  
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {stat.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsStatsSection;
