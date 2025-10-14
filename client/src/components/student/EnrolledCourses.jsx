import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Badge from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Star,
  TrendingUp,
  Award,
  Calendar,
  User,
  Settings,
  Bell,
  Eye,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const EnrolledCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, enrolled, completed, in-progress

  useEffect(() => {
    if (user) {
      loadEnrolledCourses();
    }
  }, [user]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      // Use the new API endpoint that includes enrollment status
      const response = await fetch('/api/courses/with-enrollment-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const coursesWithStatus = data.data.courses || [];
          setCourses(coursesWithStatus);
        } else {
          throw new Error(data.error || 'Failed to fetch courses');
        }
      } else {
        throw new Error('Failed to fetch courses');
      }
      
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      toast({
        title: "خطأ في تحميل الدورات",
        description: "فشل في تحميل الدورات المسجلة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCourseStatus = (course) => {
    if (!course.enrollmentStatus) return 'not-enrolled';
    
    if (!course.enrollmentStatus.isEnrolled) return 'not-enrolled';
    
    switch (course.enrollmentStatus.paymentStatus) {
      case 'approved':
        return 'enrolled';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      default:
        return 'not-enrolled';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'enrolled':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Unlock className="h-3 w-3 mr-1" />
            مسجل
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            مرفوض
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            غير مسجل
          </Badge>
        );
    }
  };

  const filteredCourses = courses.filter(course => {
    const status = getCourseStatus(course);
    switch (filter) {
      case 'enrolled':
        return status === 'enrolled';
      case 'pending':
        return status === 'pending';
      case 'rejected':
        return status === 'rejected';
      default:
        return true;
    }
  });

  const handleCourseAction = (course, status) => {
    switch (status) {
      case 'enrolled':
        navigate(`/courses/${course._id}/content`);
        break;
      case 'pending':
        toast({
          title: "في انتظار الموافقة",
          description: "يرجى انتظار موافقة الإدارة على طلب التسجيل",
          variant: "default"
        });
        break;
      case 'rejected':
        navigate(`/courses/${course._id}`);
        break;
      default:
        navigate(`/courses/${course._id}`);
        break;
    }
  };

  const getActionButton = (course, status) => {
    switch (status) {
      case 'enrolled':
        return (
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            onClick={() => handleCourseAction(course, status)}
          >
            <Play className="h-4 w-4 mr-2" />
            متابعة الدورة
          </Button>
        );
      case 'pending':
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            في انتظار الموافقة
          </Button>
        );
      case 'rejected':
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => handleCourseAction(course, status)}
          >
            <Eye className="h-4 w-4 mr-2" />
            عرض الدورة
          </Button>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={() => handleCourseAction(course, status)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            عرض التفاصيل
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري تحميل الدورات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            الدورات المسجلة
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            جميع الدورات التي سجلت فيها
          </p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'enrolled', 'pending', 'rejected'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all' && 'الكل'}
              {filterType === 'enrolled' && 'مسجل'}
              {filterType === 'pending' && 'في الانتظار'}
              {filterType === 'rejected' && 'مرفوض'}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{courses.length}</div>
            <div className="text-blue-100 text-sm">إجمالي الدورات</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {courses.filter(c => getCourseStatus(c) === 'enrolled').length}
            </div>
            <div className="text-green-100 text-sm">مسجل</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {courses.filter(c => getCourseStatus(c) === 'pending').length}
            </div>
            <div className="text-yellow-100 text-sm">في الانتظار</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {courses.filter(c => getCourseStatus(c) === 'rejected').length}
            </div>
            <div className="text-red-100 text-sm">مرفوض</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCourses.map((course, index) => {
              const status = getCourseStatus(course);
              
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(status)}
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">
                          الصف {course.grade}
                        </Badge>
                      </div>
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
                        <div className="text-lg font-bold text-blue-600">
                          {course.price} ج.م
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.createdAt ? new Date(course.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
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

                      {/* Status-specific content */}
                      {status === 'enrolled' && (
                        <div className="space-y-2">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-green-800">
                              يمكنك الآن الوصول لجميع محتويات الدورة
                            </p>
                          </div>
                        </div>
                      )}

                      {status === 'pending' && (
                        <div className="space-y-2">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                            <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800">
                              في انتظار مراجعة الإدارة
                            </p>
                          </div>
                        </div>
                      )}

                      {status === 'rejected' && (
                        <div className="space-y-2">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                            <p className="text-sm text-red-800">
                              تم رفض طلب التسجيل
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-4">
                        {getActionButton(course, status)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد دورات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? 'لم تسجل في أي دورة بعد' 
              : `لا توجد دورات بحالة "${filter}"`
            }
          </p>
          <Button 
            onClick={() => navigate('/courses')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            تصفح الدورات
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default EnrolledCourses;
