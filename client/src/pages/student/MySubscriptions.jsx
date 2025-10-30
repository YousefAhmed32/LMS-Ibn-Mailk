import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import courseAccessService from '../../services/courseAccessService';
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  MessageSquare,
  ExternalLink,
  Lock,
  Unlock,
  Video,
  FileText,
  Trophy,
  Trash2,
  X
} from 'lucide-react';

const MySubscriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Fetch student's enrolled courses only
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('Fetching student subscriptions...');
      
      // First, try to get student's enrolled courses
      const response = await axiosInstance.get('/api/student/enrolled-courses');
      console.log('Enrolled courses API response:', response.data);
      
      if (response.data.success) {
        const enrolledCourses = response.data.data || [];
        console.log('Enrolled courses data:', enrolledCourses);
        
        // Transform enrolled courses to subscription format
        const transformedSubscriptions = enrolledCourses.map(enrollment => {
          console.log('Processing enrollment:', enrollment);
          console.log('Course data:', enrollment.course);
          console.log('Image URL:', enrollment.course?.imageUrl || enrollment.course?.image);
          
          return {
            _id: enrollment._id || enrollment.courseId,
            courseId: enrollment.courseId,
            course: enrollment.course,
            paymentStatus: enrollment.paymentStatus || 'pending', // Default to pending if not specified
            enrolledAt: enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
            isActive: enrollment.isActive !== false,
            rejectionReason: enrollment.rejectionReason
          };
        });
        
        setSubscriptions(transformedSubscriptions);
      } else {
        console.error('Failed to fetch enrolled courses:', response.data);
        
        // Fallback: try to get user's enrolled courses from user context
        if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
          console.log('Using fallback data from user context:', user.enrolledCourses);
          const fallbackSubscriptions = user.enrolledCourses.map(enrollment => ({
            _id: enrollment._id || enrollment.courseId,
            courseId: enrollment.courseId,
            course: enrollment.course,
            paymentStatus: enrollment.paymentStatus || 'pending',
            enrolledAt: enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
            isActive: enrollment.isActive !== false,
            rejectionReason: enrollment.rejectionReason
          }));
          setSubscriptions(fallbackSubscriptions);
        } else {
          // Demo data for testing
          console.log('No enrolled courses found, using demo data for testing');
          const demoSubscriptions = [
            {
              _id: 'demo1',
              courseId: 'demo1',
              course: {
                _id: 'demo1',
                title: 'النحو والصرف',
                description: 'دورة شاملة في النحو والصرف العربي',
                imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
                grade: 'الثالث الثانوي',
                price: '500',
                duration: '30',
                videos: [{}, {}, {}]
              },
              paymentStatus: 'approved',
              enrolledAt: new Date().toISOString(),
              isActive: true
            },
            {
              _id: 'demo2',
              courseId: 'demo2',
              course: {
                _id: 'demo2',
                title: 'الأدب العربي',
                description: 'دراسة الأدب العربي الكلاسيكي والحديث',
                imageUrl: '',
                grade: 'الثالث الثانوي',
                price: '450',
                duration: '25',
                videos: [{}, {}]
              },
              paymentStatus: 'pending',
              enrolledAt: new Date().toISOString(),
              isActive: true
            }
          ];
          setSubscriptions(demoSubscriptions);
          
          toast({
            title: "بيانات تجريبية",
            description: "يتم عرض بيانات تجريبية للاختبار",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      console.error('Error response:', error.response?.data);
      
      // Fallback: use user's enrolled courses from context
      if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
        console.log('Using fallback data from user context after error:', user.enrolledCourses);
        const fallbackSubscriptions = user.enrolledCourses.map(enrollment => ({
          _id: enrollment._id || enrollment.courseId,
          courseId: enrollment.courseId,
          course: enrollment.course,
          paymentStatus: enrollment.paymentStatus || 'pending',
          enrolledAt: enrollment.enrolledAt || enrollment.createdAt || new Date().toISOString(),
          isActive: enrollment.isActive !== false,
          rejectionReason: enrollment.rejectionReason
        }));
        setSubscriptions(fallbackSubscriptions);
      } else {
        // Demo data for testing when API fails
        console.log('API failed, using demo data for testing');
        const demoSubscriptions = [
          {
            _id: 'demo1',
            courseId: 'demo1',
            course: {
              _id: 'demo1',
              title: 'النحو والصرف',
              description: 'دورة شاملة في النحو والصرف العربي',
              imageUrl: '',
              grade: 'الثالث الثانوي',
              price: '500',
              duration: '30',
              videos: [{}, {}, {}]
            },
            paymentStatus: 'approved',
            enrolledAt: new Date().toISOString(),
            isActive: true
          },
          {
            _id: 'demo2',
            courseId: 'demo2',
            course: {
              _id: 'demo2',
              title: 'الأدب العربي',
              description: 'دراسة الأدب العربي الكلاسيكي والحديث',
              imageUrl: '',
              grade: 'الثالث الثانوي',
              price: '450',
              duration: '25',
              videos: [{}, {}]
            },
            paymentStatus: 'pending',
            enrolledAt: new Date().toISOString(),
            isActive: true
          }
        ];
        setSubscriptions(demoSubscriptions);
        
        toast({
          title: "بيانات تجريبية",
          description: "يتم عرض بيانات تجريبية للاختبار",
          variant: "default"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);


  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <Unlock className="h-3 w-3 mr-1" />
            مفعل
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            قيد المراجعة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <Lock className="h-3 w-3 mr-1" />
            مرفوض
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
            غير محدد
          </Badge>
        );
    }
  };

  const getAccessMessage = (subscription) => {
    if (!subscription) return null;
    
    switch (subscription.paymentStatus) {
      case 'approved':
        return {
          message: "✅ تم تفعيل الدورة بنجاح - يمكنك الآن الوصول لجميع المحتويات",
          type: "success",
          icon: <Unlock className="h-4 w-4" />,
          color: "text-green-600"
        };
      case 'pending':
        return {
          message: "⏳ قيد المراجعة - في انتظار موافقة الإدارة على إثبات الدفع",
          type: "warning",
          icon: <Clock className="h-4 w-4" />,
          color: "text-yellow-600 dark:text-yellow-400"
        };
      case 'rejected':
        return {
          message: `❌ تم رفض إثبات الدفع: ${subscription.rejectionReason || 'لا يوجد سبب محدد'}`,
          type: "error",
          icon: <Lock className="h-4 w-4" />,
          color: "text-red-600"
        };
      default:
        return {
          message: "❓ حالة غير معروفة",
          type: "info",
          icon: <AlertCircle className="h-4 w-4" />,
          color: "text-gray-600"
        };
    }
  };

  const handleViewCourse = (courseId) => {
    if (courseId) {
      navigate(`/courses/${courseId}/content`);
    } else {
      toast({
        title: "خطأ في الدورة",
        description: "معرف الدورة غير صحيح",
        variant: "destructive"
      });
    }
  };

  const handleContactAdmin = () => {
    // Open WhatsApp contact
    window.open('https://wa.me/201022880651', '_blank');
  };

  // Handle unsubscribe from course
  const handleUnsubscribe = async (subscription) => {
    try {
      setDeletingSubscription(subscription._id);
      
      // Check if we have valid course data
      if (!subscription.course && !subscription.courseId) {
        console.error('No course data available for subscription:', subscription);
        
        // For subscriptions without course data, remove locally only
        setSubscriptions(prev => prev.filter(sub => sub._id !== subscription._id));
        
        toast({
          title: "تم حذف الاشتراك محلياً",
          description: "تم حذف الاشتراك من الواجهة (لا توجد بيانات كافية للحذف من الخادم)",
          variant: "default"
        });
        
        setShowDeleteConfirm(null);
        return;
      }

      const courseId = subscription.course?._id || subscription.courseId;
      if (!courseId) {
        console.error('Course ID not found in subscription:', subscription);
        toast({
          title: "خطأ في البيانات",
          description: "معرف الدورة غير موجود",
          variant: "destructive"
        });
        return;
      }

      console.log('Unsubscribing from course:', courseId);
      
      // Call API to unsubscribe
      const response = await axiosInstance.delete(`/api/courses/${courseId}/unsubscribe`);
      
      if (response.data.success) {
        // Remove from local state
        setSubscriptions(prev => prev.filter(sub => sub._id !== subscription._id));
        
        toast({
          title: "تم حذف الاشتراك بنجاح",
          description: `تم حذف الاشتراك في دورة "${subscription.course?.title || 'الدورة'}"`,
          variant: "default"
        });
        
        // Close confirmation dialog
        setShowDeleteConfirm(null);
      } else {
        throw new Error(response.data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      console.error('Subscription data:', subscription);
      
      let errorMessage = "حدث خطأ أثناء حذف الاشتراك";
      if (error.response?.status === 404) {
        errorMessage = "لم يتم العثور على الاشتراك";
      } else if (error.response?.status === 403) {
        errorMessage = "غير مسموح بحذف هذا الاشتراك";
      } else if (error.response?.status === 401) {
        errorMessage = "يرجى تسجيل الدخول أولاً";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === 'Course ID not found') {
        errorMessage = "معرف الدورة غير موجود";
      } else if (error.message.includes('Network Error')) {
        errorMessage = "خطأ في الاتصال بالخادم";
      }
      
      toast({
        title: "خطأ في حذف الاشتراك",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeletingSubscription(null);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (subscription) => {
    setShowDeleteConfirm(subscription);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Check if course should show delete button (only for pending or rejected subscriptions)
  const shouldShowDeleteButton = (subscription) => {
    // Show delete button only for pending or rejected subscriptions
    return subscription.paymentStatus === 'pending' || subscription.paymentStatus === 'rejected';
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل اشتراكاتك...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              اشتراكاتي
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              الدورات التي اشتركت فيها بالفعل وحالة كل اشتراك
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {subscriptions.filter(sub => sub.paymentStatus === 'approved').length}
                  </div>
                  <div className="text-green-100">دورات مفعلة</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {subscriptions.filter(sub => sub.paymentStatus === 'pending').length}
                  </div>
                  <div className="text-yellow-100">قيد المراجعة</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{subscriptions.length}</div>
                  <div className="text-blue-100">إجمالي الاشتراكات</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Subscriptions List */}
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      {subscription.course?.imageUrl || subscription.course?.image ? (
                        <img
                          src={subscription.course?.imageUrl || subscription.course?.image}
                          alt={subscription.course?.title || 'صورة الدورة'}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Placeholder when no image */}
                      <div 
                        className={`w-full h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 dark:from-blue-600 dark:via-purple-700 dark:to-pink-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${subscription.course?.imageUrl || subscription.course?.image ? 'hidden' : 'flex'}`}
                      >
                        <div className="text-center text-white">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-80" />
                          <p className="text-sm font-medium opacity-90 px-2">
                            {subscription.course?.title || 'صورة الدورة'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(subscription.paymentStatus)}
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">
                          الصف {subscription.course?.grade}
                        </Badge>
                      </div>
                      {shouldShowDeleteButton(subscription) && (
                        <div className="absolute bottom-3 right-3">
                          <button
                            onClick={() => showDeleteConfirmation(subscription)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                            title="حذف الاشتراك"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                        {subscription.course?.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {subscription.course?.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-blue-600">
                          {subscription.course?.price} ج.م
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{subscription.course?.duration || '20'} ساعة</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{subscription.course?.videos?.length || 0} فيديو</span>
                        </div>
                      </div>

                      {/* Access Status Message */}
                      {(() => {
                        const accessInfo = getAccessMessage(subscription);
                        return (
                          <div className={`flex items-center space-x-2 mb-3 p-2 rounded-lg ${accessInfo.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' : accessInfo.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' : accessInfo.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
                            {accessInfo.icon}
                            <span className={`text-sm ${accessInfo.color}`}>
                              {accessInfo.message}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Status-specific content */}
                      {subscription.paymentStatus === 'approved' && (
                        <div className="space-y-2">
                          {/* Course Features */}
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Video className="h-4 w-4" />
                              <span>فيديوهات</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>امتحانات</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Trophy className="h-4 w-4" />
                              <span>شهادة</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            onClick={() => handleViewCourse(subscription.course?._id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            بدء التعلم
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={handleContactAdmin}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            تواصل مع المعلم
                          </Button>
                        </div>
                      )}

                      {subscription.paymentStatus === 'pending' && (
                        <div className="space-y-2">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              قيد المراجعة - في انتظار موافقة الإدارة
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={handleContactAdmin}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            تواصل مع الإدارة
                          </Button>
                        </div>
                      )}

                      {subscription.paymentStatus === 'rejected' && (
                        <div className="space-y-2">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <XCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
                            <p className="text-sm text-red-800">
                              {subscription.rejectionReason || 'تم رفض طلب الاشتراك'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewCourse(subscription.course?._id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              عرض الدورة
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={handleContactAdmin}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              تواصل
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Always show view course button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleViewCourse(subscription.course?._id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        عرض تفاصيل الدورة
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد اشتراكات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                لم تشترك في أي دورة بعد. تصفح الدورات المتاحة واشترك في الدورة المناسبة لك
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
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    تأكيد الحذف
                  </h3>
                  <button
                    onClick={cancelDelete}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-3">
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        هل أنت متأكد من حذف هذا الاشتراك؟
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {showDeleteConfirm.course?.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الاشتراك نهائياً ولن تتمكن من الوصول لمحتوى الدورة.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={cancelDelete}
                    className="flex-1"
                    disabled={deletingSubscription === showDeleteConfirm._id}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => handleUnsubscribe(showDeleteConfirm)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    disabled={deletingSubscription === showDeleteConfirm._id}
                  >
                    {deletingSubscription === showDeleteConfirm._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف الاشتراك
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
    </PageWrapper>
  );
};

export default MySubscriptions;
