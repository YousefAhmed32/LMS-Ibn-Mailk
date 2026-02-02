import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getCourseByIdService, 
  getEnrollmentStatusService, 
  uploadPaymentProofService,
  formatCoursePrice,
  formatCourseDuration
} from '../../services/courseService';
import courseAccessService from '../../services/courseAccessService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  Phone,
  CreditCard,
  Target,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';
import QuizComponent from '../../components/student/QuizComponent';
import ExamResultInput from '../../components/course/ExamResultInput';
import CourseExamsSection from '../../components/student/CourseExamsSection';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [courseAccess, setCourseAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    senderPhone: '',
    studentPhone: '',
    guardianPhone: '',
    proofImage: null
  });

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course data and enrollment status
      const [courseData, enrollmentData] = await Promise.all([
        getCourseByIdService(id),
        getEnrollmentStatusService(id)
      ]);
      
      setCourse(courseData.course);
      setEnrollment(enrollmentData.enrollment);
      
      // Check course access using the new endpoint
      try {
        const accessResponse = await fetch(`/api/courses/${id}/access`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (accessResponse.ok) {
          const accessData = await accessResponse.json();
          setCourseAccess({ hasAccess: accessData.access });
        } else {
          // Fallback to old method if new endpoint fails
          const accessData = await courseAccessService.checkCourseAccess(id);
          setCourseAccess(accessData.data);
        }
      } catch (accessError) {
        console.warn('Course access check failed, using fallback:', accessError);
        // Fallback to old method
        const accessData = await courseAccessService.checkCourseAccess(id);
        setCourseAccess(accessData.data);
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "خطأ",
        description: error.error || "فشل في تحميل معلومات الدورة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setPaymentForm(prev => ({ ...prev, proofImage: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const getAccessMessage = () => {
    if (!courseAccess) return null;
    
    if (courseAccess.hasAccess) {
      return {
        message: "✅ تم تفعيل الدورة بنجاح - يمكنك الآن الوصول لجميع المحتويات",
        type: "success",
        icon: <Unlock className="h-5 w-5" />,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        hasAccess: true
      };
    }

    if (courseAccess.enrollment) {
      switch (courseAccess.enrollment.paymentStatus) {
        case 'pending':
          return {
            message: "⏳ في انتظار موافقة الإدارة على إثبات الدفع",
            type: "warning",
            icon: <Clock className="h-5 w-5" />,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
          };
        case 'rejected':
          return {
            message: `❌ تم رفض إثبات الدفع: ${courseAccess.enrollment.rejectionReason || 'لا يوجد سبب محدد'}`,
            type: "error",
            icon: <Lock className="h-5 w-5" />,
            color: "text-red-600",
            bgColor: "bg-red-50 dark:bg-red-900/20"
          };
        default:
          return {
            message: "❓ حالة غير معروفة",
            type: "info",
            icon: <Lock className="h-5 w-5" />,
            color: "text-gray-600",
            bgColor: "bg-gray-50 dark:bg-gray-900/20"
          };
      }
    }

    return {
      message: "يرجى إتمام الدفع أولاً",
      type: "info",
      icon: <Lock className="h-5 w-5" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20"
    };
  };

  const handleUploadProof = async () => {
    if (!paymentForm.proofImage) {
      toast({
        title: "No file selected",
        description: "Please select a payment screenshot",
        variant: "destructive"
      });
      return;
    }

    if (!paymentForm.senderPhone || !paymentForm.studentPhone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('proofImage', paymentForm.proofImage);
      formData.append('senderPhone', paymentForm.senderPhone);
      formData.append('studentPhone', paymentForm.studentPhone);
      formData.append('guardianPhone', paymentForm.guardianPhone);

      await uploadPaymentProofService(id, formData);
      
      toast({
        title: "Success",
        description: "Payment proof uploaded successfully. Awaiting admin approval.",
      });

      setShowUploadModal(false);
      setPaymentForm({
        senderPhone: '',
        studentPhone: '',
        guardianPhone: '',
        proofImage: null
      });
      fetchCourseData(); // Refresh enrollment status
    } catch (error) {
      console.error('Error uploading proof:', error);
      const errorMessage = error?.error || error?.message || "Failed to upload payment proof";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const totalDuration = course.videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0;
  const videoCount = course.videos?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/courses')}
            className="mb-6 hover:scale-105 transition-transform"
          >
            ← Back to Courses
          </Button>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <motion.h1 
                  className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {course.title}
                </motion.h1>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 text-lg mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {course.description}
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-3 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge variant="secondary" className="text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    Grade {course.grade}
                  </Badge>
                  {course.term && (
                    <Badge variant="outline" className="text-sm px-4 py-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300">
                      {course.term}
                    </Badge>
                  )}
                  <Badge variant="default" className="text-sm px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                    {course.subject}
                  </Badge>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCoursePrice(course.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{videoCount}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Lessons</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCourseDuration(totalDuration)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {course.totalEnrollments || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Students</div>
                  </div>
                </motion.div>
              </div>

              {course.imageUrl && (
                <motion.div 
                  className="lg:ml-8 mb-6 lg:mb-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="w-full lg:w-80 h-48 lg:h-64 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Payment Section */}
        {!enrollment?.enrolled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </motion.div>
                  Complete Payment to Access Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-8 text-center">
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Please complete the payment via Vodafone Cash to access this course
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Send the course fee to the number below and upload your payment screenshot
                    </p>
                  </motion.div>

                  <motion.div 
                    className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-600 rounded-xl p-6 mb-6 inline-block shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Vodafone Cash Number</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 font-mono tracking-wider">
                      01022880651
                    </div>
                  </motion.div>

                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Course Fee: {formatCoursePrice(course.price)}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold shadow-lg"
                    >
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                      </motion.div>
                      Upload Payment Screenshot
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Enrollment Status Display */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  {courseAccess?.hasAccess ? (
                    <Unlock className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-yellow-600" />
                  )}
                  حالة الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Access Status Message */}
                {(() => {
                  const accessInfo = getAccessMessage();
                  if (!accessInfo) return null;
                  
                  return (
                    <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${accessInfo.bgColor}`}>
                      <div className="flex items-center space-x-3">
                        {accessInfo.icon}
                        <span className={`text-sm font-medium ${accessInfo.color}`}>
                          {accessInfo.message}
                        </span>
                      </div>
                      {accessInfo.hasAccess && (
                        <Button
                          onClick={() => navigate(`/courses/${id}/content`)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </Button>
                      )}
                    </div>
                  );
                })()}
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getPaymentStatusColor(enrollment.paymentStatus)} border px-3 py-1`}>
                  {getPaymentStatusIcon(enrollment.paymentStatus)}
                  <span className="ml-2 capitalize">{enrollment.paymentStatus}</span>
                </Badge>
                <span className="text-sm text-gray-600">
                  Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>

              {enrollment.paymentStatus === 'rejected' && enrollment.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">Rejection Reason:</h4>
                  <p className="text-red-700">{enrollment.rejectionReason}</p>
                </div>
              )}

              {enrollment.paymentStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Your payment proof is under review. You'll be notified once it's approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Videos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                {courseAccess?.hasAccess ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Unlock className="w-5 h-5 text-green-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                      فيديوهات الدورة ({videoCount} درس) - مفعلة
                    </span>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Lock className="w-5 h-5 text-red-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      فيديوهات الدورة ({videoCount} درس) - مقفلة
                    </span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.videos && course.videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.videos.map((video, index) => {
                    const isUnlocked = courseAccess?.hasAccess;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className={`bg-white dark:bg-gray-700 rounded-xl border shadow-lg overflow-hidden transition-all duration-300 ${!isUnlocked ? 'opacity-60' : 'hover:shadow-xl hover:scale-105'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={isUnlocked ? { scale: 1.05 } : {}}
                      >
                        {video.thumbnail && (
                          <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                            {!isUnlocked && (
                              <motion.div 
                                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Lock className="w-12 h-12 text-white" />
                                </motion.div>
                              </motion.div>
                            )}
                            {isUnlocked && (
                              <motion.div 
                                className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                Unlocked
                              </motion.div>
                            )}
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {index + 1}. {video.title || `Lesson ${index + 1}`}
                          </h3>
                          {video.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <Clock className="w-4 h-4" />
                              <span>{video.duration} minutes</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            {isUnlocked ? (
                              <>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button 
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                                    onClick={() => {
                                      if (video.url) {
                                        window.open(video.url, '_blank');
                                      }
                                    }}
                                  >
                                    <motion.div
                                      animate={{ x: [0, 2, 0] }}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                    </motion.div>
                                    مشاهدة الفيديو
                                  </Button>
                                </motion.div>
                                {video.quizLink && (
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Button 
                                      variant="outline"
                                      className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-400 dark:text-green-400"
                                      onClick={() => {
                                        window.open(video.quizLink, '_blank');
                                      }}
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      حل الاختبار
                                    </Button>
                                  </motion.div>
                                )}
                              </>
                            ) : (
                              <Button 
                                className="w-full bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                                disabled
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                محتوى مقفل
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  </motion.div>
                  <p className="text-lg">No videos available for this course yet.</p>
                </div>
              )}
              
              {!enrollment?.enrolled && (
                <motion.div 
                  className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-yellow-800 dark:text-yellow-200 text-center text-lg font-medium">
                    🔒 Complete payment to unlock all course videos and quizzes
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Exams Section */}
        {course.exams && course.exams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {courseAccess?.hasAccess ? (
                    <>
                      <Unlock className="w-5 h-5 text-green-600" />
                      امتحانات الدورة - مفتوحة
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-red-600" />
                      امتحانات الدورة - مقفلة
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseExamsSection 
                  courseId={id}
                  courseExams={course.exams}
                  hasAccess={courseAccess?.hasAccess}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quiz Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {courseAccess?.hasAccess ? (
                <>
                  <Unlock className="w-5 h-5 text-green-600" />
                  اختبار الدورة - مفتوح
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-red-600" />
                  اختبار الدورة - مقفل
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseAccess?.hasAccess ? (
              <QuizComponent 
                courseId={id} 
                onQuizComplete={(results) => {
                  console.log('Quiz completed:', results);
                  toast({
                    title: "🎉 تم إكمال الاختبار",
                    description: `نتيجتك: ${results.score}%`
                  });
                }}
              />
            ) : (
              <div className="text-center py-8">
                <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">الاختبار مقفل حتى إكمال الدفع</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    🔒 Complete payment to access course quizzes and assessments
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Creator Info */}
        {course.createdBy && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Course Created By</p>
                <p className="font-semibold text-gray-900">
                  {course.createdBy.firstName} {course.createdBy.secondName} {course.createdBy.thirdName} {course.createdBy.fourthName}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Upload Payment Proof Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إرسال إثبات الدفع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Payment Instructions */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">تعليمات الدفع</h3>
              <div className="bg-white border-2 border-green-300 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">رقم فودافون كاش</span>
                </div>
                <div className="text-2xl font-bold text-green-600 font-mono">
                  01022880651
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  المبلغ: {formatCoursePrice(course.price)}
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senderPhone">رقم المرسل (مطلوب)</Label>
                <Input
                  id="senderPhone"
                  name="senderPhone"
                  type="tel"
                  value={paymentForm.senderPhone}
                  onChange={handleInputChange}
                  placeholder="+201234567890"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentPhone">رقم الطالب (مطلوب)</Label>
                <Input
                  id="studentPhone"
                  name="studentPhone"
                  type="tel"
                  value={paymentForm.studentPhone}
                  onChange={handleInputChange}
                  placeholder="+201234567890"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="guardianPhone">رقم ولي الأمر (اختياري)</Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                type="tel"
                value={paymentForm.guardianPhone}
                onChange={handleInputChange}
                placeholder="+201234567890"
                className="mt-1"
              />
            </div>


            {/* File Upload */}
            <div>
              <Label htmlFor="proofImage">صورة إثبات الدفع</Label>
              <Input
                id="proofImage"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                الصيغ المقبولة: JPG, PNG, GIF. الحد الأقصى: 5 ميجابايت
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUploadProof}
                disabled={!paymentForm.proofImage || !paymentForm.senderPhone || !paymentForm.studentPhone || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال الإثبات'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default CourseDetail;
