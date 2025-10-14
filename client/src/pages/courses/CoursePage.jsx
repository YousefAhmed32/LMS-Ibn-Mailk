import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { toast } from '../../hooks/use-toast';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Lock, 
  Unlock,
  BookOpen,
  Trophy,
  Target,
  ArrowLeft,
  Video,
  FileText,
  BarChart3,
  Star,
  Award
} from 'lucide-react';
import VideoCard from '../../components/course/VideoCard';
import VideoPlayer from '../../components/course/VideoPlayer';
import ProgressBar from '../../components/course/ProgressBar';
import { getCourseContentService, updateLessonProgressService, submitQuizResultService } from '../../services/courseService';

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchCourseContent();
  }, [id]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await getCourseContentService(id);
      
      // Check if course is active
      if (response.data.isActive === false) {
        toast({
          title: "الدورة غير متاحة",
          description: "هذه الدورة غير مفعلة حالياً",
          variant: "destructive"
        });
        navigate('/courses');
        return;
      }
      
      setCourseContent(response.data);
      
      // Sort lessons by order to ensure correct display order
      if (response.data.lessons) {
        response.data.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      
      // Auto-select first lesson if available
      if (response.data.lessons && response.data.lessons.length > 0) {
        setSelectedLesson(response.data.lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course content:', error);
      
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You need to enroll and get approval for this course.",
          variant: "destructive"
        });
        navigate('/courses');
      } else {
        toast({
          title: "Error",
          description: "Failed to load course content. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setShowVideoPlayer(true);
  };

  const handleVideoProgress = async (lessonId, videoId, watchedDuration, totalDuration) => {
    try {
      await updateLessonProgressService(id, lessonId, {
        videoId,
        watchedDuration,
        totalDuration
      });
      
      // Update local state
      setCourseContent(prev => ({
        ...prev,
        lessons: prev.lessons.map(lesson => 
          lesson.id === lessonId 
            ? {
                ...lesson,
                progress: {
                  ...lesson.progress,
                  watchedDuration,
                  totalDuration,
                  watchPercentage: (watchedDuration / totalDuration) * 100,
                  isCompleted: (watchedDuration / totalDuration) >= 0.9
                }
              }
            : lesson
        )
      }));
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleQuizSubmit = async (lessonId, answers, timeSpent) => {
    try {
      const response = await submitQuizResultService(id, lessonId, {
        answers,
        timeSpent
      });
      
      // Update local state
      setCourseContent(prev => ({
        ...prev,
        lessons: prev.lessons.map(lesson => 
          lesson.id === lessonId 
            ? {
                ...lesson,
                quizResult: {
                  score: response.data.score,
                  passed: response.data.passed,
                  completedAt: response.data.completedAt,
                  timeSpent: response.data.timeSpent
                }
              }
            : lesson
        )
      }));
      
      toast({
        title: response.data.passed ? "🎉 Quiz Passed!" : "❌ Quiz Failed",
        description: `Your score: ${response.data.score}%`,
        variant: response.data.passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!courseContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const { course, lessons, progress } = courseContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
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

                {/* Progress Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <ProgressBar 
                    progress={progress.overallProgress}
                    totalLessons={progress.totalLessons}
                    completedLessons={progress.completedLessons}
                  />
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

        {/* Course Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <CourseStats 
            totalLessons={progress.totalLessons}
            completedLessons={progress.completedLessons}
            totalDuration={course.totalDuration}
            totalWatchTime={progress.totalWatchTime}
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons List */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Course Lessons ({lessons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <LessonCard
                      lesson={lesson}
                      isSelected={selectedLesson?.id === lesson.id}
                      onSelect={() => handleLessonSelect(lesson)}
                      index={index + 1}
                    />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Lesson Content */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {selectedLesson ? (
                <motion.div
                  key={selectedLesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Video className="w-5 h-5 text-green-600" />
                        {selectedLesson.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(selectedLesson.duration)}
                        </div>
                        {selectedLesson.progress && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {selectedLesson.progress.watchPercentage.toFixed(1)}% watched
                          </div>
                        )}
                        {selectedLesson.quizResult && (
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            Quiz: {selectedLesson.quizResult.score}%
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Video Player */}
                        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                          {selectedLesson.url ? (
                            <iframe
                              src={selectedLesson.url}
                              className="w-full h-full"
                              allowFullScreen
                              title={selectedLesson.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <div className="text-center text-white">
                                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-lg">Video not available</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Lesson Progress */}
                        {selectedLesson.progress && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progress
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedLesson.progress.watchPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(selectedLesson.progress.watchPercentage)}`}
                                style={{ width: `${selectedLesson.progress.watchPercentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>{selectedLesson.progress.formattedWatchedDuration}</span>
                              <span>{selectedLesson.progress.formattedTotalDuration}</span>
                            </div>
                          </div>
                        )}

                        {/* Quiz Section */}
                        {selectedLesson.quiz && selectedLesson.quiz.questions && selectedLesson.quiz.questions.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Lesson Quiz
                              </h3>
                              {selectedLesson.quizResult && (
                                <Badge 
                                  variant={selectedLesson.quizResult.passed ? "default" : "destructive"}
                                  className="ml-auto"
                                >
                                  {selectedLesson.quizResult.passed ? (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Passed
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3 mr-1" />
                                      Failed
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                  {selectedLesson.quiz.questions.length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
                              </div>
                              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {selectedLesson.quiz.passingScore || 70}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Passing Score</div>
                              </div>
                            </div>

                            {selectedLesson.quizResult ? (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {selectedLesson.quizResult.score}%
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Completed on {new Date(selectedLesson.quizResult.completedAt).toLocaleDateString()}
                                  </div>
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleLessonSelect(selectedLesson)}
                                    className="w-full"
                                  >
                                    Retake Quiz
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => handleLessonSelect(selectedLesson)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Start Quiz
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Select a lesson to start learning
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Choose a lesson from the sidebar to begin your learning journey
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        video={selectedLesson}
        isOpen={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        onProgressUpdate={(progress) => {
          if (selectedLesson) {
            handleVideoProgress(selectedLesson.id, selectedLesson.videoId, progress.currentTime, progress.duration);
          }
        }}
        initialProgress={selectedLesson?.progress?.watchedDuration || 0}
      />
    </div>
  );
};

export default CoursePage;
