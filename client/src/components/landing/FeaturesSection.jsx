import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Shield,
  Star,
  Clock,
  Award,
  Zap
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "شرح مبسط ومنظم",
      description: "محتوى تعليمي مبسط ومنظم يسهل فهم مناهج الأزهر الشريف",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "متابعة شخصية متقدمة",
      description: "متابعة شخصية لكل طالب مع إجابة على جميع الاستفسارات",
      color: "from-purple-500 to-pink-500"
    },
    // {
    //   icon: TrendingUp,
    //   title: "تقدم قابل للقياس",
    //   description: "متابعة تقدمك الأكاديمي مع إحصائيات مفصلة وتقارير فورية",
    //   color: "from-green-500 to-emerald-500"
    // },
    {
      icon: Shield,
      title: "آمان وحماية البيانات",
      description: "حماية شاملة لبياناتك مع تقنيات التشفير الأكثر تطوراً",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Clock,
      title: "متاح 24/7",
      description: "يمكنك الوصول للمحتوى في أي وقت ومن أي مكان",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Award,
      title: "شهادات معتمدة",
      description: "احصل على شهادات معتمدة عند إكمال الدورات بنجاح",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              لماذا تختار منصة ابن مالك؟
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            نقدم لك تجربة تعليمية متكاملة تجمع بين الأصالة والمعاصرة
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 h-full">
                {/* Icon */}
                <motion.div
                  className="relative mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;