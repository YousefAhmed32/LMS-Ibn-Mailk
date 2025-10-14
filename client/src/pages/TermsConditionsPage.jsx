import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Users, 
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Lock,
  Globe,
  Mail,
  Scale
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import PageWrapper from '../components/layout/PageWrapper';

const TermsConditionsPage = () => {
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

  const termsSections = [
    {
      icon: UserCheck,
      title: "قبول الشروط",
      content: "باستخدامك منصة ابن مالك التعليمية، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.",
      points: [
        "الموافقة على جميع الشروط والأحكام",
        "الالتزام بالقوانين المحلية والدولية",
        "استخدام المنصة للأغراض التعليمية فقط",
        "احترام حقوق الملكية الفكرية"
      ]
    },
    {
      icon: Users,
      title: "السلوكيات المطلوبة",
      content: "نلتزم بتوفير بيئة تعليمية آمنة ومحترمة لجميع المستخدمين. يجب على جميع المستخدمين الالتزام بسلوكيات آمنة ومحترمة داخل المنصة.",
      points: [
        "الالتزام بسلوكيات آمنة ومحترمة داخل المنصة",
        "احترام جميع المستخدمين والمعلمين",
        "عدم استخدام لغة غير لائقة أو مسيئة",
        "المشاركة الإيجابية في الأنشطة التعليمية"
      ]
    },
    {
      icon: BookOpen,
      title: "استخدام المحتوى التعليمي",
      content: "جميع المحتوى التعليمي المتاح على المنصة محمي بحقوق الطبع والنشر. يجب استخدام المحتوى لأغراض تعليمية شخصية فقط وعدم مشاركته مع أطراف غير مصرح لها.",
      points: [
        "استخدام المحتوى التعليمي لأغراض تعليمية فقط",
        "عدم مشاركة الحساب أو البيانات مع أطراف غير مصرح بها",
        "احترام حقوق الملكية الفكرية",
        "عدم نسخ أو توزيع المحتوى بدون إذن"
      ]
    },
    {
      icon: Shield,
      title: "المسؤوليات والالتزامات",
      content: "المستخدمون مسؤولون عن الحفاظ على أمان حساباتهم وبياناتهم. كما يجب الالتزام بجميع القوانين واللوائح المعمول بها.",
      points: [
        "الحفاظ على أمان الحساب وكلمة المرور",
        "تحديث المعلومات الشخصية عند الحاجة",
        "الإبلاغ عن أي انتهاكات أو مشاكل أمنية",
        "الالتزام بجميع القوانين المعمول بها"
      ]
    },
    {
      icon: Lock,
      title: "حماية البيانات والأمان",
      content: "نلتزم بحماية بياناتك الشخصية وأمان حسابك. يجب على المستخدمين اتخاذ الاحتياطات اللازمة لحماية معلوماتهم.",
      points: [
        "عدم مشاركة بيانات تسجيل الدخول",
        "استخدام كلمات مرور قوية ومتنوعة",
        "تسجيل الخروج من الأجهزة المشتركة",
        "الإبلاغ عن أي نشاط مشبوه"
      ]
    },
    {
      icon: Clock,
      title: "التحديثات والتغييرات",
      content: "قد نقوم بتحديث هذه الشروط والأحكام من وقت لآخر. سيتم إشعار المستخدمين بأي تغييرات مهمة عبر المنصة أو البريد الإلكتروني.",
      points: [
        "إشعار المستخدمين بالتحديثات المهمة",
        "المراجعة الدورية للشروط والأحكام",
        "إمكانية رفض التحديثات الجديدة",
        "الحفاظ على الشفافية في التغييرات"
      ]
    }
  ];

  const prohibitedActivities = [
    {
      icon: XCircle,
      title: "الأنشطة المحظورة",
      description: "مشاركة الحساب مع الآخرين أو استخدامه لأغراض غير تعليمية"
    },
    {
      icon: XCircle,
      title: "انتهاك الحقوق",
      description: "نسخ أو توزيع المحتوى التعليمي بدون إذن صريح"
    },
    {
      icon: XCircle,
      title: "السلوك غير اللائق",
      description: "استخدام لغة مسيئة أو سلوك غير محترم مع المستخدمين الآخرين"
    },
    {
      icon: XCircle,
      title: "الأنشطة غير القانونية",
      description: "استخدام المنصة لأي أنشطة غير قانونية أو مخالفة للقوانين"
    }
  ];

  const userRights = [
    {
      icon: CheckCircle,
      title: "حق الوصول",
      description: "الوصول إلى المحتوى التعليمي المخصص لمستواك"
    },
    {
      icon: CheckCircle,
      title: "حق الدعم",
      description: "الحصول على الدعم الفني والمساعدة عند الحاجة"
    },
    {
      icon: CheckCircle,
      title: "حق التقييم",
      description: "تقييم المحتوى والخدمات وتقديم الملاحظات"
    },
    {
      icon: CheckCircle,
      title: "حق الخصوصية",
      description: "حماية بياناتك الشخصية وخصوصيتك"
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
                <Scale className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              الشروط والأحكام
            </h1>
            
            <motion.p 
              variants={itemVariants}
              className={`text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              هذه الصفحة تحتوي على الشروط والأحكام لاستخدام المنصة
            </motion.p>
          </motion.div>

          {/* Introduction */}
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
                  مرحباً بك في منصة <span className="font-bold bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 bg-clip-text text-transparent">ابن مالك</span> التعليمية. هذه الشروط والأحكام تحكم استخدامك للمنصة وتوضح حقوقك والتزاماتك كمتعلم.
                </p>
                
                <p className={`text-lg leading-relaxed mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  نؤمن بأهمية الشفافية والوضوح في جميع تعاملاتنا. لذلك، نقدم لك هذه الشروط بشكل واضح ومفهوم لضمان تجربة تعليمية آمنة ومثمرة للجميع.
                </p>

                <div className={`p-6 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-luxury-navy-700/30 border border-luxury-navy-600/30' 
                    : 'bg-gray-50/80 border border-gray-200/50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-6 h-6 mt-1 ${
                      isDarkMode ? 'text-luxury-gold-400' : 'text-luxury-gold-600'
                    }`} />
                    <p className={`text-base ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <strong>تنبيه مهم:</strong> يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة. استخدامك للمنصة يعني موافقتك على جميع الشروط والأحكام المذكورة هنا.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Terms Sections */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              تفاصيل الشروط والأحكام
            </h2>
            
            <div className="space-y-8">
              {termsSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-8 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 border border-luxury-navy-600/30' 
                      : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
                        : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
                    } flex-shrink-0`}>
                      <section.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {section.title}
                      </h3>
                      
                      <p className={`text-lg leading-relaxed mb-6 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {section.content}
                      </p>
                      
                      <div className="space-y-3">
                        {section.points.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start space-x-3">
                            <CheckCircle className={`w-5 h-5 mt-1 ${
                              isDarkMode ? 'text-luxury-emerald-400' : 'text-green-600'
                            }`} />
                            <span className={`${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Prohibited Activities */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              الأنشطة المحظورة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prohibitedActivities.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-red-900/20 hover:bg-red-900/30 border border-red-800/30' 
                      : 'bg-red-50/80 hover:bg-red-100/80 border border-red-200/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                      isDarkMode 
                        ? 'bg-red-600' 
                        : 'bg-red-500'
                    } flex-shrink-0`}>
                      <activity.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activity.title}
                      </h3>
                      
                      <p className={`leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* User Rights */}
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              حقوقك كمتعلم
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userRights.map((right, index) => (
                <motion.div
                  key={right.title}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-6 rounded-2xl transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 border border-luxury-navy-600/30' 
                      : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-luxury-gold-500 to-luxury-orange-500' 
                        : 'bg-gradient-to-br from-luxury-gold-400 to-luxury-orange-400'
                    } flex-shrink-0`}>
                      <right.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {right.title}
                      </h3>
                      
                      <p className={`leading-relaxed ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {right.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="text-center">
            <div className={`rounded-3xl p-8 md:p-12 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-luxury-navy-800/50 to-luxury-navy-700/50 backdrop-blur-md border border-luxury-navy-600/50' 
                : 'bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-md border border-gray-200/50'
            } shadow-2xl`}>
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                لديك استفسارات حول الشروط؟
              </h2>
              
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                فريقنا القانوني متاح للإجابة على أي استفسارات حول الشروط والأحكام
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-400 hover:to-luxury-orange-400 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gradient-to-r from-luxury-gold-500 to-luxury-orange-500 hover:from-luxury-gold-400 hover:to-luxury-orange-400 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Mail className="w-5 h-5 ml-2" />
                  تواصل معنا
                </Link>
                
                <Link
                  to="/privacy"
                  className={`inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-luxury-navy-700/50 hover:bg-luxury-navy-600/50 text-white border border-luxury-navy-600/50' 
                      : 'bg-white/80 hover:bg-white text-gray-900 border border-gray-200/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Shield className="w-5 h-5 ml-2" />
                  سياسة الخصوصية
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default TermsConditionsPage;
