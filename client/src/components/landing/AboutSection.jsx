import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BookOpen, User, Star, Award, Users, Clock } from 'lucide-react';

const AboutSection = () => {
  const features = [
    { icon: BookOpen, title: "مناهج معتمدة", description: "مناهج الأزهر الشريف المعتمدة" },
    { icon: Users, title: "متابعة شخصية", description: "متابعة فردية لكل طالب" },
    { icon: Clock, title: "متاح 24/7", description: "يمكن الوصول في أي وقت" },
    { icon: Star, title: "جودة عالية", description: "محتوى تعليمي متميز" }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            من نحن
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            منصة تعليمية رائدة تقدم محتوى تعليمي متميز في المواد العربية الأزهرية
          </p>
        </motion.div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Ibn Malik Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="group"
          >
            <Card className="h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={48} className="text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  ابن مالك للمواد العربية الأزهرية
                </CardTitle>
                <p className="text-blue-100 text-lg leading-relaxed">
                  منصة تعليمية متخصصة في تقديم المواد العربية الأزهرية بطريقة سهلة ومفهومة، 
                  مع التركيز على الفهم العميق والتطبيق العملي
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="font-bold text-yellow-300 text-lg">50+</div>
                    <div>دورة تعليمية</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="font-bold text-yellow-300 text-lg">1000+</div>
                    <div>طالب نشط</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Teacher Jamila Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="group"
          >
            <Card className="h-full bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User size={48} className="text-white" />
                </div>
                <CardTitle className="text-3xl font-bold mb-4">
                  المعلمة جميلة السيد
                </CardTitle>
                <p className="text-green-100 text-lg leading-relaxed">
                  معلمة متميزة بخبرة أكثر من 20 عام في تدريس المواد العربية الأزهرية، 
                  تتميز بأسلوبها البسيط والواضح في الشرح
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="font-bold text-yellow-300 text-lg">15+</div>
                    <div>سنوات خبرة</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="font-bold text-yellow-300 text-lg">4.9</div>
                    <div>تقييم الطلاب</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
