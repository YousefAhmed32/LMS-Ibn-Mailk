import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { 
  getCourseCoverImage, 
  getDefaultVideoThumbnail,
  extractYouTubeVideoId,
  formatVideoDurationFromMinutes
} from '../../utils/videoUtils';
import {
  ArrowLeft,
  Lock,
  Play,
  BookOpen,
  Clock,
  FileText,
  Award,
  Users,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Home,
  GraduationCap,
  Video,
  FileCheck
} from 'lucide-react';

const CoursePreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/api/courses/${id}`);
      
      if (response.data.success) {
        setCourse(response.data.course || response.data.data?.course);
      } else {
        setError('لم يتم العثور على الكورس');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.error || 'فشل تحميل بيانات الكورس');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total course duration
  const totalDuration = useMemo(() => {
    if (!course?.videos) return 0;
    return course.videos.reduce((sum, video) => sum + (video.duration || 0), 0);
  }, [course]);

  // Format duration helper
  const formatTotalDuration = (minutes) => {
    if (!minutes) return '0 دقيقة';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعة ${mins > 0 ? `${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  // Get video thumbnail
  const getVideoThumbnailUrl = (video) => {
    const videoId = extractYouTubeVideoId(video.url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return video.thumbnail || getDefaultVideoThumbnail();
  };

  // Get exam type label
  const getExamTypeLabel = (exam) => {
    if (exam.type === 'google_form') return 'نموذج Google';
    if (exam.type === 'external' || exam.type === 'link') return 'امتحان خارجي';
    return 'امتحان داخلي';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">{error || 'لم يتم العثور على الكورس'}</h2>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            العودة إلى الدورات
          </button>
        </div>
      </div>
    );
  }

  const coverImage = getCourseCoverImage(course);
  const publishedExams = (course.exams || []).filter(exam => exam.status === 'published' || !exam.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 pb-24">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link 
            to="/courses" 
            className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            الدورات
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{course.title}</span>
        </nav>
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 sm:h-80 md:h-96 overflow-hidden"
      >
        <img
          src={coverImage}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(prev => ({ ...prev, cover: true }))}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">رجوع</span>
        </button>

        {/* Course Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black mb-3"
          >
            {course.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl opacity-90 line-clamp-3"
          >
            {course.description}
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Course Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl p-6 md:p-8 border border-cyan-200/50 dark:border-cyan-700/30 shadow-xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">السعر</p>
                <p className="text-2xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {course.price || 0} جنيه
                </p>
              </div>
            </div>

            {/* Grade */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-700/30">
                <GraduationCap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">الصف</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.grade}</p>
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-700/30">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المادة</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{course.subject}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-700/30">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">المدة الإجمالية</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatTotalDuration(totalDuration)}
                </p>
              </div>
            </div>
          </div>

          {/* Course Description */}
          {course.description && (
            <div className="mt-6 pt-6 border-t border-cyan-200/50 dark:border-cyan-700/30">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">عن الكورس</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-cyan-200/50 dark:border-cyan-700/30 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {course.videos?.length || 0} فيديو
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {publishedExams.length} امتحان
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {course.enrolledStudents?.length || 0} طالب
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">نشط</span>
            </div>
          </div>
        </motion.div>

        {/* Videos Section */}
        {course.videos && course.videos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100">
                محتوى الكورس ({course.videos.length} فيديو)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.videos.map((video, index) => {
                const thumbnailUrl = getVideoThumbnailUrl(video);
                const hasImageError = imageError[`video-${index}`];
                
                return (
                  <motion.div
                    key={video._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="group relative bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden border border-cyan-200/50 dark:border-cyan-700/30 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      {!hasImageError ? (
                        <img
                          src={thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={() => setImageError(prev => ({ ...prev, [`video-${index}`]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Video className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Lock Overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-100 group-hover:opacity-90 transition-opacity">
                        <Lock className="w-12 h-12 text-white mb-2" />
                        <p className="text-white font-bold text-sm">مقفل</p>
                      </div>

                      {/* Hover Message */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                        <p className="text-white text-sm font-semibold">اشترك لمشاهدة الفيديو</p>
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white" />
                          <span className="text-white text-xs font-medium">
                            {formatVideoDurationFromMinutes(video.duration)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {video.title || `فيديو ${index + 1}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>الفيديو {index + 1}</span>
                        {video.order && <span>• الترتيب: {video.order}</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Exams Section */}
        {publishedExams.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100">
                الامتحانات ({publishedExams.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedExams.map((exam, index) => (
                <motion.div
                  key={exam.id || exam._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="relative bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-700/30 backdrop-blur-xl shadow-lg opacity-70"
                >
                  {/* Lock Icon */}
                  <div className="absolute top-4 right-4">
                    <Lock className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                  </div>

                  <div className="pr-10">
                    <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">
                      {exam.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>{getExamTypeLabel(exam)}</span>
                      </div>
                      
                      {exam.type === 'internal_exam' && (
                        <>
                          {exam.questions?.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                              <span>📝 {exam.questions.length} سؤال</span>
                            </div>
                          )}
                          {exam.totalMarks && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                              <span>📊 {exam.totalMarks} درجة</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {exam.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>⏱️ {exam.duration} دقيقة</span>
                        </div>
                      )}
                      
                      {exam.passingScore && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                          <Award className="w-4 h-4" />
                          <span>درجة النجاح: {exam.passingScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Sticky CTA Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-cyan-200/50 dark:border-cyan-700/30 z-50 shadow-2xl"
      >
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => navigate(`/payment/${id}`)}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-lg">اشترك الآن في الكورس - {course.price || 0} جنيه</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CoursePreviewPage;
