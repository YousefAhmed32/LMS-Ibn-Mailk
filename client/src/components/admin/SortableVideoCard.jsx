import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  Edit,
  Lock,
  Unlock,
  Calendar,
  Rocket,
  Trash2,
  Clock,
  Play
} from 'lucide-react';
import { extractYouTubeVideoId } from '../../utils/videoUtils';
import LuxuryButton from '../ui/LuxuryButton';

const statusConfig = {
  visible: {
    icon: '🟢',
    label: 'مرئي',
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700/30'
  },
  scheduled: {
    icon: '🟡',
    label: 'مجدول',
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700/30'
  },
  hidden: {
    icon: '⚫',
    label: 'مخفي',
    color: 'from-gray-500 to-gray-600',
    textColor: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-700/30'
  },
  draft: {
    icon: '📝',
    label: 'مسودة',
    color: 'from-blue-500 to-indigo-600',
    textColor: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700/30'
  }
};

/**
 * Calculate countdown for scheduled videos
 */
function calculateCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) return 'الآن';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} يوم و ${hours} ساعة`;
  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
}

/**
 * Extract YouTube Video ID from URL
 */
function extractYouTubeID(url) {
  if (!url) return null;
  return extractYouTubeVideoId(url);
}

const SortableVideoCard = ({
  video,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onChangeStatus,
  onSchedule,
  onPublishNow,
  colors
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: video.id || video._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Get thumbnail
  const getThumbnail = () => {
    const videoId = extractYouTubeID(video.url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return video.thumbnail || '/placeholder-video.jpg';
  };

  // Calculate countdown for scheduled videos
  const countdown = video.status === 'scheduled' && video.publishSettings?.publishDate
    ? calculateCountdown(new Date(video.publishSettings.publishDate))
    : null;

  const status = statusConfig[video.status] || statusConfig.visible;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-4 p-4 bg-gradient-to-br from-cyan-50/90 via-blue-50/90 to-purple-50/90 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 ${
        video.status === 'hidden' ? 'border-gray-300 dark:border-gray-600' :
        video.status === 'scheduled' ? 'border-yellow-300 dark:border-yellow-600' :
        'border-cyan-200/50 dark:border-cyan-700/30'
      } hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xl transition-all duration-300 backdrop-blur-xl`}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <GripVertical size={20} className="text-gray-400" />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(video.id || video._id)}
        className="w-5 h-5 rounded border-2 border-cyan-500 cursor-pointer"
      />

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden">
        <img
          src={getThumbnail()}
          alt={video.title}
          className={`w-full h-full object-cover transition-all ${
            video.status === 'hidden' ? 'grayscale opacity-50' :
            video.status === 'scheduled' ? 'blur-sm opacity-70' : ''
          }`}
        />

        {/* Lock Overlay */}
        {(video.status === 'hidden' || video.status === 'scheduled') && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Lock size={20} className="text-white" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock size={12} />
            <span>{video.duration} د</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate text-gray-800 dark:text-white mb-2">
          {video.title || `فيديو ${video.order + 1}`}
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bgColor} border ${status.borderColor}`}>
            <span>{status.icon}</span>
            <span className={`text-sm font-medium ${status.textColor}`}>
              {status.label}
            </span>
          </div>

          {/* Published Date */}
          {video.publishedAt && video.status === 'visible' && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              📅 منشور: {new Date(video.publishedAt).toLocaleDateString('ar-SA')}
            </span>
          )}

          {/* Scheduled Date + Countdown */}
          {video.status === 'scheduled' && countdown && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-yellow-600 dark:text-yellow-400">
                📅 {new Date(video.publishSettings.publishDate).toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                ⏰ خلال {countdown}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <LuxuryButton
          variant="ghost"
          size="sm"
          onClick={() => {
            const videoId = extractYouTubeID(video.url);
            if (videoId) {
              window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            } else {
              window.open(video.url, '_blank');
            }
          }}
          className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          title="معاينة"
        >
          <Eye size={16} />
        </LuxuryButton>

        <LuxuryButton
          variant="ghost"
          size="sm"
          onClick={() => onEdit(video)}
          className="p-2 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400"
          title="تعديل"
        >
          <Edit size={16} />
        </LuxuryButton>

        {video.status === 'hidden' ? (
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => onChangeStatus(video.id || video._id, 'visible')}
            className="p-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400"
            title="إظهار"
          >
            <Unlock size={16} />
          </LuxuryButton>
        ) : video.status === 'visible' ? (
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => onChangeStatus(video.id || video._id, 'hidden')}
            className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 text-gray-600 dark:text-gray-400"
            title="إخفاء"
          >
            <Lock size={16} />
          </LuxuryButton>
        ) : null}

        <LuxuryButton
          variant="ghost"
          size="sm"
          onClick={() => onSchedule(video)}
          className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400"
          title="جدولة"
        >
          <Calendar size={16} />
        </LuxuryButton>

        {video.status === 'scheduled' && (
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => onPublishNow(video.id || video._id)}
            className="p-2 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400"
            title="نشر الآن"
          >
            <Rocket size={16} />
          </LuxuryButton>
        )}

        <LuxuryButton
          variant="ghost"
          size="sm"
          onClick={() => onDelete(video.id || video._id)}
          className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
          title="حذف"
        >
          <Trash2 size={16} />
        </LuxuryButton>
      </div>
    </div>
  );
};

export default SortableVideoCard;
