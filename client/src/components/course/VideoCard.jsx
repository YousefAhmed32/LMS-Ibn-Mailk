import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Video, 
  FileText, 
  Trophy,
  Eye,
  PlayCircle
} from 'lucide-react';

const VideoCard = ({ 
  video, 
  index, 
  onVideoSelect, 
  onQuizStart,
  isSelected = false,
  progress = null,
  quizResult = null 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  const getVideoThumbnail = (url) => {
    if (!url) return null;
    
    // Extract YouTube video ID
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.includes('v=') 
        ? url.split('v=')[1]?.split('&')[0]
        : null;
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return null;
  };

  const hasQuiz = video.quiz && video.quiz.questions && video.quiz.questions.length > 0;
  const isCompleted = progress?.isCompleted || false;
  const watchPercentage = progress?.watchPercentage || 0;

  const handleCardClick = () => {
    if (hasQuiz) {
      onQuizStart?.(video);
    } else {
      onVideoSelect?.(video);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{
        background: isSelected ? colors.accent + '10' : colors.surface,
        border: `2px solid ${isSelected ? colors.accent : colors.border}`,
        borderRadius: borderRadius.lg,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? shadows.lg : shadows.md,
        overflow: 'hidden'
      }}
      className="group"
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {getVideoThumbnail(video.url) ? (
          <img
            src={getVideoThumbnail(video.url)}
            alt={video.title || `Video ${index + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback thumbnail */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            display: getVideoThumbnail(video.url) ? 'none' : 'flex',
            background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`
          }}
        >
          <PlayCircle size={48} color={colors.accent} />
        </div>
        
        {/* Play Button Overlay */}
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="bg-white/20 backdrop-blur-sm rounded-full p-4"
          >
            <Play size={32} className="text-white" fill="white" />
          </motion.div>
        </div>

        {/* Progress Overlay */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
              style={{ width: `${watchPercentage}%` }}
            />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Completion Badge */}
          {isCompleted && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle size={12} />
              مكتمل
            </div>
          )}
          
          {/* Quiz Badge */}
          {hasQuiz && (
            <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Trophy size={12} />
              اختبار
            </div>
          )}
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Quiz Score Badge */}
        {quizResult && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            {quizResult.score}%
          </div>
        )}
      </div>

      {/* Video Info */}
      <div style={{ padding: spacing.md }}>
        {/* Lesson Number */}
        <div className="flex items-center gap-2 mb-2">
          <div style={{
            background: colors.accent,
            color: colors.background,
            borderRadius: borderRadius.full,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: typography.fontSize.xs,
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {index + 1}
          </div>
          <span style={{ 
            color: colors.textMuted, 
            fontSize: typography.fontSize.xs,
            fontWeight: 'medium'
          }}>
            الدرس {index + 1}
          </span>
        </div>

        {/* Title */}
        <h4 style={{ 
          color: colors.text, 
          fontSize: typography.fontSize.md,
          fontWeight: 'bold',
          marginBottom: spacing.sm,
          lineHeight: 1.4
        }}>
          {video.title || `فيديو ${index + 1}`}
        </h4>

        {/* Description */}
        {video.description && (
          <p style={{ 
            color: colors.textMuted, 
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.sm,
            lineHeight: 1.4
          }}>
            {video.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1">
            {hasQuiz ? (
              <>
                <FileText size={12} />
                <span>{video.quiz.questions.length} أسئلة</span>
              </>
            ) : (
              <>
                <Video size={12} />
                <span>فيديو</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDuration(video.duration)}</span>
          </div>
        </div>

        {/* Progress Info */}
        {progress && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: colors.textMuted }}>
                التقدم: {Math.round(watchPercentage)}%
              </span>
              {progress.watchedDuration && progress.totalDuration && (
                <span style={{ color: colors.textMuted }}>
                  {Math.floor(progress.watchedDuration / 60)}:{(progress.watchedDuration % 60).toString().padStart(2, '0')} / {Math.floor(progress.totalDuration / 60)}:{(progress.totalDuration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoCard;
