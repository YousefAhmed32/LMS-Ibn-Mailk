import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axiosInstance from '../../api/axiosInstance';
import useUnifiedProgressTracking from '../../hooks/useUnifiedProgressTracking';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Clock,
  CheckCircle,
  Play
} from 'lucide-react';

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Unified progress tracking for both videos and exams
  const {
    progress,
    videoStatus,
    examStatus,
    loading: progressLoading,
    updating: progressUpdating,
    markVideoCompleted,
    markExamCompleted,
    isVideoCompleted,
    isExamCompleted,
    refreshProgress
  } = useUnifiedProgressTracking(courseId);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleVideoCompleted = useCallback((completionData) => {
    console.log('Video completed in CourseView:', completionData);
    // Mark video as completed using the unified progress tracking
    if (completionData.videoId) {
      markVideoCompleted(completionData.videoId, completionData.percent);
    }
  }, [markVideoCompleted]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const courseResponse = await axiosInstance.get(`/api/courses/${courseId}`);
      if (courseResponse.data.success) {
        const courseData = courseResponse.data.data;
        
        // Check if course is active
        if (courseData.isActive === false) {
          setError('هذه الدورة غير مفعلة حالياً');
          return;
        }
        
        setCourse(courseData);
      } else {
        throw new Error('Failed to fetch course data');
      }
      
      // Fetch user progress
      const progressResponse = await axiosInstance.get(`/api/user-progress/course/${courseId}`);
      if (progressResponse.data.success) {
        const progressData = progressResponse.data.data;
        // Initialize completed exams from server data
        const serverCompletedExams = new Set(
          progressData.examProgress?.map(exam => exam.examId) || []
        );
        // This would need to be handled in the hook, but for demo purposes
        console.log('Server completed exams:', serverCompletedExams);
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchCourseData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  const videos = course.videos || [];
  const exams = course.exams || [];
  const totalItems = videos.length + exams.length;
  
  // Use progress data from server instead of calculating locally
  const progressPercentage = progress?.progressPercentage || 0;
  const completedItems = progress?.completedItems || 0;
  const completedVideos = progress?.completedVideos || 0;
  const completedExams = progress?.completedExams || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{completedItems} / {totalItems} • {progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-600 shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video size={20} className="text-blue-600" />
              Videos ({videos.length})
            </h2>
            <div className="space-y-3">
              {videos.map((video, index) => (
                <motion.div
                  key={video._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{video.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {video.duration || 'N/A'} min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Play size={16} />
                      Watch
                    </button>
                    
                    {/* Video Completion Button */}
                    <button
                      onClick={() => markVideoCompleted(video._id)}
                      disabled={progressUpdating || isVideoCompleted(video._id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                        isVideoCompleted(video._id)
                          ? "bg-green-500 text-white cursor-default"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } ${progressUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isVideoCompleted(video._id) ? "Completed ✅" : "Mark as Completed"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Exams Section */}
        {exams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              Exams ({exams.length})
            </h2>
            <div className="space-y-3">
              {exams.map((exam, index) => (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{exam.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText size={14} />
                        {exam.type || 'Exam'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Exam Completion Button */}
                  <button
                    onClick={() => toggleExamCompletion(exam._id)}
                    disabled={examUpdating || isExamCompleted(exam._id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                      isExamCompleted(exam._id)
                        ? "bg-green-500 text-white cursor-default"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } ${examUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isExamCompleted(exam._id) ? "Completed ✅" : "Mark as Completed"}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {videos.length === 0 && exams.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
            <p className="text-gray-600">This course doesn't have any videos or exams yet.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseView;
