import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ModernButton from '../ui/ModernButton';
import { CheckCircle, BookOpen, Users, Star, Clock, Award } from 'lucide-react';

const CallToActionSection = () => {
  const features = [
    { icon: BookOpen, text: "مناهج الأزهر الشريف المعتمدة" },
    { icon: Users, text: "متابعة شخصية لكل طالب" },
    { icon: Star, text: "محتوى تعليمي عالي الجودة" },
    { icon: Clock, text: "متاح 24/7 على أي جهاز" },
    { icon: Award, text: "شهادات معتمدة" }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
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
            className="text-white/20"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            ابدأ رحلتك التعليمية الآن
            <span className="block text-2xl md:text-3xl font-normal text-blue-100 mt-2">
              مع منصة ابن مالك للتعليم الأزهري
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            انضم إلى آلاف الطلاب الذين يختارون منصة ابن مالك لتعلم المواد العربية الأزهرية
            <br />
            ابدأ الآن واستمتع بتجربة تعليمية فريدة وممتعة
          </motion.p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mb-2">
                  <feature.icon size={20} className="text-white" />
                </div>
                <span className="text-blue-100 text-sm">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <Link to="/courses">
              <ModernButton
                size="xl"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                اشترك الآن
              </ModernButton>
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-blue-200 text-sm mb-4">
              ✨ انضم الآن واحصل على خصم 20% على أول اشتراك
            </p>
            <div className="flex justify-center items-center space-x-4 text-blue-200 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle size={16} className="text-green-300" />
                <span>تجربة مجانية لمدة 7 أيام</span>
              </div>
              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              <div className="flex items-center space-x-1">
                <CheckCircle size={16} className="text-green-300" />
                <span>إلغاء في أي وقت</span>
              </div>
            </div>
          </motion.div>
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
            className="text-white/20"
            transform="rotate(180 600 60)"
          />
        </svg>
      </div>
    </section>
  );
};

export default CallToActionSection;
