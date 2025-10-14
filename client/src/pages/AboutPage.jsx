import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Award, 
  Heart, 
  Sparkles,
  BookOpen,
  GraduationCap,
  Shield,
  Globe,
  Star,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import PageWrapper from '../components/layout/PageWrapper';

const AboutPage = () => {
  const { isDarkMode } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "محتوى تعليمي متميز",
      description: "نوفر محتوى تعليمي عالي الجودة مصمم خصيصاً لتنمية مهارات الطلاب"
    },
    {
      icon: Shield,
      title: "بيئة آمنة ومحمية",
      description: "نضمن بيئة تعليمية آمنة ومحمية لجميع المستخدمين مع حماية البيانات"
    },
    {
      icon: Globe,
      title: "تقنيات حديثة",
      description: "نستخدم أحدث التقنيات لضمان تجربة تعليمية تفاعلية ومتطورة"
    },
    {
      icon: Award,
      title: "شهادات معتمدة",
      description: "نقدم شهادات معتمدة للطلاب عند إكمال الدورات بنجاح"
    }
  ];

  const teamValues = [
    {
      icon: Heart,
      title: "الحب والتفاني",
      description: "نعمل بحب واهتمام لتقديم أفضل تجربة تعليمية"
    },
    {
      icon: Target,
      title: "التميز والجودة",
      description: "نسعى للتميز في كل ما نقدمه من خدمات ومحتوى"
    },
    {
      icon: Users,
      title: "العمل الجماعي",
      description: "نؤمن بقوة العمل الجماعي لتحقيق الأهداف المشتركة"
    },
    {
      icon: Sparkles,
      title: "الابتكار والإبداع",
      description: "نبتكر حلولاً إبداعية لتطوير التعليم الرقمي"
    }
  ];

  return (
    <PageWrapper>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`min-h-screen ${
          isDarkMode 
            ? 'bg-gradient-to-br from-luxury-navy-900 via-luxury-navy-800 to-luxury-navy-900' 
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        }`}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
              : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
          } blur-3xl`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-luxury-sky-500 to-luxury-emerald-500' 
              : 'bg-gradient-to-br from-luxury-sky-400 to-luxury-emerald-400'
          } blur-3xl`} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Navigation */}
          <motion.div variants={itemVariants} className="mb-8">
            <Link 
              to="/"
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 text-gray-300 hover:text-white' 
                  : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">العودة للرئيسية</span>
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
                  : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
              } shadow-2xl`}>
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              نبذة عنا
            </h1>
            
            <motion.p 
              variants={itemVariants}
              className={`text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              مرحبًا بكم في منصتنا التعليمية! نسعى لتقديم تجربة تعليمية متميزة تجمع بين الابتكار والتقنيات الحديثة.
            </motion.p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className={`rounded-3xl p-8 md:p-12 shadow-2xl ${
              isDarkMode 
                ? 'bg-luxury-navy-800/50 backdrop-blur-md border border-luxury-navy-700/50' 
                : 'bg-white/80 backdrop-blur-md border border-gray-200/50'
            }`}>
              <div className="prose prose-lg max-w-none">
                <p className={`text-lg leading-relaxed mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  يعمل فريق <span className="font-bold bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 bg-clip-text text-transparent">YANSY</span> بحب واحتراف لتوفير محتوى رقمي مفيد وآمن، يهدف إلى تطوير مهارات الطلاب وتعزيز التعلم الذاتي.
                </p>
                
                <p className={`text-lg leading-relaxed mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  نؤمن بأن التعليم هو أساس التقدم والازدهار، لذلك نعمل على تقديم حلول تعليمية مبتكرة تلبي احتياجات العصر الرقمي وتواكب التطورات التقنية الحديثة.
                </p>

                <p className={`text-lg leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  من خلال منصتنا، نسعى لبناء جيل واعٍ ومتعلم قادر على مواجهة تحديات المستقبل بثقة وإبداع.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              مميزات منصتنا
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 border border-luxury-navy-600/30' 
                      : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200/50'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
                      : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
                  }`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Values Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              قيمنا ومبادئنا
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-8 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 border border-luxury-navy-600/30' 
                      : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
                        : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
                    } flex-shrink-0`}>
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {value.title}
                      </h3>
                      
                      <p className={`leading-relaxed ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="text-center">
            <div className={`rounded-3xl p-8 md:p-12 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-luxury-navy-800/50 to-luxury-navy-700/50 backdrop-blur-md border border-luxury-navy-600/50' 
                : 'bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md border border-gray-200/50'
            } shadow-2xl`}>
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                انضم إلينا في رحلة التعلم
              </h2>
              
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                ابدأ رحلتك التعليمية معنا واكتشف عالماً من المعرفة والإمكانيات اللامحدودة
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-400 hover:to-luxury-orange-400 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-400 hover:to-luxury-orange-400 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <BookOpen className="w-5 h-5 ml-2" />
                  استكشف الدورات
                </Link>
                
                <Link
                  to="/contact"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 text-white border border-luxury-navy-600/50' 
                      : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Users className="w-5 h-5 ml-2" />
                  تواصل معنا
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default AboutPage;
