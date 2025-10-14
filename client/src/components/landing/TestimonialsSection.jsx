import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "أحمد محمد",
      grade: "الصف الثامن",
      rating: 5,
      comment: "منصة رائعة! الشرح واضح ومبسط، وأستطيع فهم المواد العربية بسهولة. المعلمة جميلة ممتازة في الشرح وتجعل كل درس ممتع ومفيد. أنصح جميع الطلاب بالتسجيل."
    },
    {
      name: "فاطمة علي",
      grade: "الصف التاسع",
      rating: 5,
      comment: "أفضل منصة تعليمية جربتها! المحتوى منظم ومفيد، والاختبارات تساعدني في التأكد من فهمي. الأستاذة جميلة تشرح بطريقة سهلة وممتعة، وأشعر بتقدم كبير في دراستي."
    },
    {
      name: "محمد أحمد",
      grade: "الصف العاشر",
      rating: 5,
      comment: "محتوى تعليمي عالي الجودة، والأسعار معقولة. الأستاذة جميلة تقدم شرحاً شاملاً ومفصلاً لكل درس، والمنصة سهلة الاستخدام. أنصح جميع الطلاب بالتسجيل."
    },
    {
      name: "سارة حسن",
      grade: "الصف السابع",
      rating: 5,
      comment: "تجربة تعليمية ممتازة! الأستاذة جميلة تشرح بطريقة واضحة ومفهومة، والمنصة سهلة الاستخدام. أشعر بتحسن كبير في درجاتي بعد التسجيل في المنصة."
    },
    {
      name: "علي محمود",
      grade: "الصف التاسع",
      rating: 5,
      comment: "منصة متميزة جداً! المحتوى التعليمي غني ومفيد، والأستاذة جميلة تقدم شرحاً شاملاً لكل درس. أنصح جميع الطلاب بالتسجيل في هذه المنصة الرائعة."
    },
    {
      name: "نور الدين",
      grade: "الصف الثامن",
      rating: 5,
      comment: "أفضل منصة تعليمية! الأستاذة جميلة تشرح بطريقة ممتازة، والمنصة تحتوي على محتوى تعليمي عالي الجودة. أشعر بتحسن كبير في فهمي للمواد العربية."
    },
    {
      name: "مريم سعد",
      grade: "الصف التاسع",
      rating: 5,
      comment: "تجربة تعليمية استثنائية! الأستاذة جميلة تقدم محتوى تعليمي متميز وشرحاً واضحاً. المنصة سهلة الاستخدام وتحتوي على كل ما أحتاجه لتحسين مستواي في اللغة العربية."
    },
    {
      name: "يوسف أحمد",
      grade: "الصف العاشر",
      rating: 5,
      comment: "منصة رائعة جداً! الأستاذة جميلة تشرح بطريقة ممتازة، والمنصة تحتوي على محتوى تعليمي غني ومفيد. أنصح جميع الطلاب بالتسجيل في هذه المنصة المتميزة."
    },
    {
      name: "زينب محمود",
      grade: "الصف الثامن",
      rating: 5,
      comment: "أفضل منصة تعليمية! الأستاذة جميلة تقدم شرحاً شاملاً ومفصلاً لكل درس، والمنصة سهلة الاستخدام. أشعر بتحسن كبير في درجاتي بعد التسجيل."
    },
    {
      name: "خالد حسن",
      grade: "الصف التاسع",
      rating: 5,
      comment: "منصة متميزة جداً! المحتوى التعليمي عالي الجودة، والأستاذة جميلة تشرح بطريقة واضحة ومفهومة. أنصح جميع الطلاب بالتسجيل في هذه المنصة الرائعة."
    },
    {
      name: "هند علي",
      grade: "الصف السابع",
      rating: 5,
      comment: "تجربة تعليمية ممتازة! الأستاذة جميلة تقدم محتوى تعليمي متميز، والمنصة تحتوي على كل ما أحتاجه لتحسين مستواي في اللغة العربية."
    },
    {
      name: "عمر محمد",
      grade: "الصف العاشر",
      rating: 5,
      comment: "أفضل منصة تعليمية جربتها! الأستاذة جميلة تشرح بطريقة سهلة وممتعة، والمنصة تحتوي على محتوى تعليمي غني ومفيد. أنصح جميع الطلاب بالتسجيل."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(testimonials.length / 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(testimonials.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3));
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentIndex * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  const stats = [
    { number: "98%", label: "رضا الطلاب" },
    { number: "4.9", label: "تقييم عام" },
    { number: "1000+", label: "طالب نشط" },
    { number: "50+", label: "دورة تعليمية" }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Wave SVG */}
      <div className="absolute top-0 left-0 w-full h-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
            className="text-blue-500/20"
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            آراء طلابنا
          </h2>
          <p className="text-xl text-blue-700 dark:text-blue-300 max-w-3xl mx-auto">
            اكتشف ما يقوله طلابنا عن تجربتهم التعليمية معنا
          </p>
        </motion.div>

                {/* Elegant Testimonials Slider */}
                <div className="relative mb-16">
                  {/* Clean Navigation Buttons */}
                  <button
                    onClick={prevSlide}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Clean Slider Container */}
                  <div className="overflow-hidden rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {getCurrentTestimonials().map((testimonial, index) => (
                          <motion.div
                            key={`${currentIndex}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              y: -5,
                              transition: { duration: 0.3 }
                            }}
                            className="group"
                          >
                            <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                              
                              <CardHeader className="text-center pb-4">
                                <div className="flex justify-center mb-4">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <span className="text-white text-lg font-bold">
                                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-center mb-3">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={`${
                                        i < testimonial.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                  {testimonial.name}
                                </h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                  {testimonial.grade}
                                </p>
                              </CardHeader>
                              <CardContent className="text-center pt-0">
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed px-4">
                                  {testimonial.comment}
                                </p>
                              </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

                  {/* Clean Dots Indicator */}
                  <div className="flex justify-center mt-8 space-x-3">
                    {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-blue-500 scale-125'
                            : 'bg-blue-300 dark:bg-blue-600 hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold text-center mb-8">
            إحصائيات منصة ابن مالك
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 text-sm font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full h-20">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
            className="text-blue-500/20"
            transform="rotate(180 600 60)"
          />
        </svg>
      </div>
    </section>
  );
};

export default TestimonialsSection;
