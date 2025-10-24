import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Badge from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Star, 
  Clock,
  Play,
  Eye,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Cache for courses data
  const [coursesCache, setCoursesCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Fetch courses from API with caching
  const fetchCourses = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check cache first
      if (!forceRefresh && coursesCache && cacheTimestamp && 
          (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('📦 Using cached courses data');
        setCourses(coursesCache);
        setLoading(false);
        return;
      }

      console.log('🚀 Fetching fresh courses data...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Filter out inactive courses on the frontend as well
        const activeCourses = (result.data || []).filter(course => course.isActive !== false);
        
        // Cache the results
        setCoursesCache(activeCourses);
        setCacheTimestamp(Date.now());
        setCourses(activeCourses);
        
        console.log('📚 Active courses loaded:', activeCourses.length);
      } else {
        console.error('Failed to fetch courses');
        toast({
          title: "خطأ في تحميل الدورات",
          description: "حدث خطأ أثناء تحميل الدورات",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "خطأ في تحميل الدورات",
        description: "حدث خطأ في الاتصال بالخادم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's enrolled courses
  const fetchEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/my/enrolled`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEnrolledCourses(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [user]);

  // Handle course subscription
  const handleSubscribe = async (courseId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "🚀 تم طلب الاشتراك",
          description: "سيتم مراجعة طلبك قريباً من قبل الإدارة",
        });
        fetchEnrolledCourses(); // Refresh enrolled courses
      } else {
        const error = await response.json();
        toast({
          title: "❌ خطأ في الاشتراك",
          description: error.message || "حدث خطأ أثناء طلب الاشتراك",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error subscribing to course:', error);
      toast({
        title: "❌ خطأ في الاشتراك",
        description: "حدث خطأ في الاتصال بالخادم",
        variant: "destructive"
      });
    }
  };

  // Check if user is enrolled in a course (memoized)
  const isEnrolled = useCallback((courseId) => {
    return enrolledCourses.some(enrollment => 
      enrollment.courseId === courseId && enrollment.paymentStatus === 'approved'
    );
  }, [enrolledCourses]);

  // Check if user has pending enrollment (memoized)
  const hasPendingEnrollment = useCallback((courseId) => {
    return enrolledCourses.some(enrollment => 
      enrollment.courseId === courseId && enrollment.paymentStatus === 'pending'
    );
  }, [enrolledCourses]);

  // Memoized filtered courses for better performance
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];
    
    return courses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = !selectedGrade || course.grade === selectedGrade;
      const matchesSubject = !selectedSubject || course.subject === selectedSubject;
      
      return matchesSearch && matchesGrade && matchesSubject;
    });
  }, [courses, searchTerm, selectedGrade, selectedSubject]);

  const grades = [
    { value: '7', label: 'أولي إعدادي' },
    { value: '8', label: 'ثاني إعدادي' },
    { value: '9', label: 'ثالث إعدادي' },
    { value: '10', label: 'أولي ثانوي' },
    { value: '11', label: 'ثاني ثانوي' },
    { value: '12', label: 'ثالث ثانوي' }
  ];
  const subjects = ['لغة عربية'];

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">جاري تحميل الدورات...</p>
          <p className="mt-2 text-gray-400 text-sm">يرجى الانتظار قليلاً</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              الدورات التعليمية
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              اكتشف مجموعة متنوعة من الدورات التعليمية عالية الجودة في المواد العربية الأزهرية
            </p>
          </div>

          {/* Channel Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              منصة ابن مالك التعليمية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen size={40} className="text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      ابن مالك للمواد العربية الأزهرية
                    </CardTitle>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      منصة تعليمية متخصصة في تقديم المواد العربية الأزهرية بطريقة سهلة ومفهومة
                    </p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="font-bold text-yellow-300">50+</div>
                        <div>دورة تعليمية</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="font-bold text-yellow-300">1000+</div>
                        <div>طالب نشط</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-green-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <User size={40} className="text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      المعلمة جميلة السيد
                    </CardTitle>
                    <p className="text-green-100 text-lg leading-relaxed">
                      معلمة متميزة بخبرة أكثر من 15 عام في تدريس المواد العربية الأزهرية
                    </p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="font-bold text-yellow-300">15+</div>
                        <div>سنوات خبرة</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="font-bold text-yellow-300">4.9</div>
                        <div>تقييم الطلاب</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              مميزات منصة ابن مالك
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, title: "شرح مبسط", description: "محتوى تعليمي مبسط ومنظم" },
                { icon: User, title: "متابعة شخصية", description: "متابعة شخصية لكل طالب" },
                { icon: Star, title: "جودة عالية", description: "محتوى تعليمي عالي الجودة" },
                { icon: Clock, title: "متاح 24/7", description: "يمكن الوصول للمحتوى في أي وقت" },
                { icon: Play, title: "دروس مسجلة", description: "دروس مسجلة عالية الجودة" },
                { icon: Eye, title: "اختبارات تفاعلية", description: "اختبارات قصيرة تفاعلية" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
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

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الدورات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الصفوف</option>
                  {grades.map(grade => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع المواد</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGrade('');
                    setSelectedSubject('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  مسح الفلاتر
                </Button>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const enrolled = isEnrolled(course._id);
              const pending = hasPendingEnrollment(course._id);
              
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        style={{
                          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                          minHeight: '192px'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-600 text-white">
                          {grades.find(g => g.value === course.grade)?.label || `الصف ${course.grade}`}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">
                          {course.subject}
                        </Badge>
                      </div>
                      {enrolled && (
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            مشترك
                          </Badge>
                        </div>
                      )}
                      {pending && (
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-yellow-600 text-white">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            في الانتظار
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {course.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            4.8
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            (120 طالب)
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {course.price} ج.م
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration || '20'} ساعة</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.videos?.length || 0} فيديو</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {enrolled ? (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            onClick={() => navigate(`/courses/${course._id}`)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            مشاهدة الدورة
                          </Button>
                        ) : pending ? (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                            disabled
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            في انتظار الموافقة
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            onClick={() => navigate(`/subscription/${course._id}`)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            الاشتراك
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/courses/${course._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لم يتم العثور على دورات
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                جرب تغيير الفلاتر أو البحث عن شيء آخر
              </p>
            </div>
          )}
    </PageWrapper>
  );
};

export default CoursesPage;
