import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import ExamGatingModal from './ExamGatingModal';
import useVideoProgress from '../../hooks/useVideoProgress';
import videoProgressService from '../../services/videoProgressService';
import examService from '../../services/examService';
import {
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  AlertTriangle,
  Video,
  FileText,
  ArrowRight,
  Loader2
} from 'lucide-react';

const Playlist = ({ 
  playlist = [], 
  courseId, 
  className = "",
  onVideoProgress = null,
  onExamStart = null
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentItem, setCurrentItem] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [showExamModal, setShowExamModal] = useState(false);
  const [pendingExam, setPendingExam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Video progress tracking
  const {
    progress,
    onPlayerReady,
    onPlayerStateChange
  } = useVideoProgress({
    videoId: currentItem?.type === 'video' ? getYouTubeVideoId(currentItem?.url) : null,
    studentId: user?._id,
    courseId,
    onProgressUpdate: (progressData) => {
      if (currentItem?.type === 'video') {
        setVideoProgress(prev => ({
          ...prev,
          [currentItem.id]: progressData
        }));
        onVideoProgress?.(currentItem.id, progressData);
      }
    },
    onVideoCompleted: (completionData) => {
      console.log('Video completed:', completionData);
      // You can add completion logic here
    }
  });

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const videoId = url.includes('youtu.be/')
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.includes('v=')
        ? url.split('v=')[1]?.split('&')[0]
        : null;
    return videoId;
  };

  // Handle item selection
  const handleItemSelect = async (item) => {
    if (item.type === 'video') {
      setCurrentItem(item);
    } else if (item.type === 'exam') {
      await handleExamClick(item);
    }
  };

  // Handle exam click with progress checking
  const handleExamClick = async (examItem) => {
    if (!user?._id || !courseId) {
      console.error('Missing user or course data');
      return;
    }

    setIsLoading(true);
    try {
      // Find the video item that should be completed before this exam
      const videoItems = playlist.filter(item => item.type === 'video');
      const lastVideoItem = videoItems[videoItems.length - 1]; // Assuming last video should be completed
      
      if (lastVideoItem) {
        // Check if the video is completed
        const videoProgressData = videoProgress[lastVideoItem.id];
        const isVideoCompleted = videoProgressData?.completed || videoProgressData?.percent >= 70;

        if (!isVideoCompleted) {
          // Show exam gating modal
          setPendingExam(examItem);
          setShowExamModal(true);
          return;
        }
      }

      // Video is completed or no video requirement, proceed to exam
      navigateToExam(examItem);
    } catch (error) {
      console.error('Error checking exam access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to exam
  const navigateToExam = (examItem) => {
    onExamStart?.(examItem);
    navigate(`/exam/${courseId}/${examItem.examId}`);
  };

  // Handle exam modal confirmation
  const handleExamModalConfirm = () => {
    if (pendingExam) {
      navigateToExam(pendingExam);
      setShowExamModal(false);
      setPendingExam(null);
    }
  };

  // Handle exam modal cancel
  const handleExamModalCancel = () => {
    setShowExamModal(false);
    setPendingExam(null);
  };

  // Get item status
  const getItemStatus = (item) => {
    if (item.type === 'video') {
      const progress = videoProgress[item.id];
      if (progress?.completed || progress?.percent >= 70) {
        return { status: 'completed', icon: CheckCircle, color: colors.success };
      } else if (progress?.percent > 0) {
        return { status: 'in-progress', icon: Play, color: colors.accent };
      } else {
        return { status: 'not-started', icon: Video, color: colors.textMuted };
      }
    } else {
      return { status: 'exam', icon: BookOpen, color: colors.warning };
    }
  };

  // Format duration helper
  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  if (!playlist || playlist.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center p-8">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No playlist items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist Items */}
        <div className="lg:col-span-1">
          <div 
            className="p-4 rounded-xl mb-4"
            style={{
              background: colors.surfaceCard,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.lg
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Course Playlist
            </h3>
            
            <div className="space-y-2">
              {playlist.map((item, index) => {
                const itemStatus = getItemStatus(item);
                const StatusIcon = itemStatus.icon;
                const isActive = currentItem?.id === item.id;
                
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemSelect(item)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive ? 'ring-2' : ''
                    }`}
                    style={{
                      background: isActive ? colors.accent + '10' : colors.background,
                      border: `1px solid ${isActive ? colors.accent : colors.border}`,
                      ringColor: colors.accent
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ 
                          backgroundColor: itemStatus.color + '20',
                          color: itemStatus.color
                        }}
                      >
                        <StatusIcon size={16} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-sm font-medium truncate"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </span>
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: item.type === 'video' ? colors.accent + '20' : colors.warning + '20',
                              color: item.type === 'video' ? colors.accent : colors.warning
                            }}
                          >
                            {item.type === 'video' ? 'Video' : 'Exam'}
                          </span>
                        </div>
                        
                        {item.type === 'video' && (
                          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                            <Clock size={12} />
                            {formatDuration(item.duration)}
                            
                            {videoProgress[item.id] && (
                              <>
                                <span>•</span>
                                <span>{Math.round(videoProgress[item.id].percent)}% watched</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <ArrowRight 
                        size={16} 
                        style={{ color: colors.textMuted }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          {currentItem ? (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {currentItem.type === 'video' ? (
                <div>
                  {/* Video Player */}
                  <YouTubeVideoPlayer
                    videoId={getYouTubeVideoId(currentItem.url)}
                    title={currentItem.title}
                    enableProgressTracking={true}
                    onPlayerReady={onPlayerReady}
                    onPlayerStateChange={onPlayerStateChange}
                    studentId={user?._id}
                    courseId={courseId}
                    className="mb-4"
                  />
                  
                  {/* Video Info */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      background: colors.surfaceCard,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <h2 
                      className="text-xl font-semibold mb-2"
                      style={{ color: colors.text }}
                    >
                      {currentItem.title}
                    </h2>
                    
                    {currentItem.description && (
                      <p 
                        className="text-sm mb-3"
                        style={{ color: colors.textMuted }}
                      >
                        {currentItem.description}
                      </p>
                    )}
                    
                    {/* Progress Indicator */}
                    {progress.percent > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            Progress
                          </span>
                          <span 
                            className="text-sm font-bold"
                            style={{ color: progress.isCompleted ? colors.success : colors.accent }}
                          >
                            {Math.round(progress.percent)}%
                          </span>
                        </div>
                        
                        <div 
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: colors.border }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: progress.isCompleted ? colors.success : colors.accent }}
                          />
                        </div>
                        
                        {progress.isCompleted && (
                          <div className="flex items-center gap-2 mt-2">
                            <CheckCircle size={16} style={{ color: colors.success }} />
                            <span 
                              className="text-sm font-medium"
                              style={{ color: colors.success }}
                            >
                              Video completed! You can now take the exam.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-8 rounded-lg text-center"
                  style={{
                    background: colors.surfaceCard,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <BookOpen size={64} style={{ color: colors.warning }} className="mx-auto mb-4" />
                  <h2 
                    className="text-xl font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {currentItem.title}
                  </h2>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: colors.textMuted }}
                  >
                    Click the exam button to start the exam
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExamClick(currentItem)}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: colors.warning,
                      color: '#FFFFFF',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Checking Access...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>Start Exam</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : (
            <div 
              className="p-8 rounded-lg text-center"
              style={{
                background: colors.surfaceCard,
                border: `1px solid ${colors.border}`
              }}
            >
              <Play size={64} style={{ color: colors.textMuted }} className="mx-auto mb-4" />
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                Select a Video or Exam
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                Choose an item from the playlist to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Exam Gating Modal */}
      <ExamGatingModal
        isOpen={showExamModal}
        onClose={handleExamModalCancel}
        onConfirm={handleExamModalConfirm}
        onCancel={handleExamModalCancel}
        videoProgress={videoProgress[playlist.find(item => item.type === 'video')?.id] || {}}
        examInfo={{
          title: pendingExam?.title || 'Course Exam',
          description: 'Complete the video first for better exam performance'
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Playlist;
