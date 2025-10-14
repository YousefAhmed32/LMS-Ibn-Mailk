import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Play,
  ArrowRight,
  Filter,
  CheckCircle
} from 'lucide-react';

const CoursesSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const courses = [
    {
      id: 1,
      title: "النحو والصرف المتقدم",
      instructor: "د. أحمد محمد",
      duration: "12 ساعة",
      rating: 4.9,
      students: 1250,
      price: "مجاني",
      category: "arabic",
      level: "متقدم",
      description: "تعلم قواعد النحو والصرف بطريقة مبسطة ومتطورة"
    },
    {
      id: 2,
      title: "الأدب العربي الكلاسيكي",
      instructor: "د. فاطمة أحمد",
      duration: "15 ساعة",
      rating: 4.8,
      students: 980,
      price: "مجاني",
      category: "literature",
      level: "متوسط",
      description: "استكشف روائع الأدب العربي عبر العصور"
    },
    {
      id: 3,
      title: "التفسير والحديث",
      instructor: "د. محمد علي",
      duration: "20 ساعة",
      rating: 4.9,
      students: 2100,
      price: "مجاني",
      category: "islamic",
      level: "مبتدئ",
      description: "فهم القرآن الكريم والسنة النبوية"
    },
    {
      id: 4,
      title: "البلاغة والعروض",
      instructor: "د. سارة حسن",
      duration: "10 ساعة",
      rating: 4.7,
      students: 750,
      price: "مجاني",
      category: "arabic",
      level: "متقدم",
      description: "إتقان فنون البلاغة وعلم العروض"
    }
  ];

  const filters = [
    { id: 'all', label: 'جميع الدورات', icon: BookOpen },
    { id: 'arabic', label: 'اللغة العربية', icon: BookOpen },
    { id: 'islamic', label: 'العلوم الإسلامية', icon: CheckCircle },
    { id: 'literature', label: 'الأدب', icon: Star }
  ];

  const filteredCourses = activeFilter === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeFilter);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 lg:py-32 overflow-hidden bg-white dark:bg-gray-900"
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
              الدورات التعليمية
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
            مجموعة شاملة من الدورات التعليمية المصممة خصيصاً لطلاب الأزهر الشريف
          </p>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`group flex items-center px-6 py-3 rounded-full border transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <filter.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium">{filter.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <div className="relative h-full">
                {/* Glassmorphism Card */}
                <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl h-full">
                  {/* Card Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                  
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Play Button Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </motion.div>

                    {/* Level Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-blue-400/30">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{course.level}</span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="relative z-10 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(course.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {course.price}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="group/btn w-full flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                    >
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                        ابدأ الآن
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </Link>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Subtle Floating Element */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            to="/courses"
            className="group inline-flex items-center px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              استكشف جميع الدورات
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CoursesSection;

