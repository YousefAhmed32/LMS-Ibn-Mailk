import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  MessageSquare,
  Star,
  Calendar,
  User,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

const AnnouncementCard = ({ 
  announcement, 
  onView, 
  onEdit, 
  onDelete,
  showActions = true,
  variant = 'default', // 'default', 'compact', 'detailed'
  showAuthor = true
}) => {
  const { colors } = useTheme();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffInMinutes = Math.floor((now - announcementDate) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} يوم`;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          card: 'p-3',
          title: 'text-sm',
          content: 'text-xs line-clamp-2',
          meta: 'text-xs'
        };
      case 'detailed':
        return {
          card: 'p-6',
          title: 'text-xl',
          content: 'text-base',
          meta: 'text-sm'
        };
      default:
        return {
          card: 'p-4',
          title: 'text-lg',
          content: 'text-sm line-clamp-3',
          meta: 'text-sm'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`rounded-xl border shadow-lg hover:shadow-[#F97316]/20 transition-all duration-300 ${
        announcement.isImportant ? 'border-[#F97316]/50 bg-[#F97316]/5' : ''
      } ${styles.card}`}
      style={{
        backgroundColor: announcement.isImportant ? 'rgba(249, 115, 22, 0.05)' : colors.surface,
        borderColor: announcement.isImportant ? '#F97316' : colors.border
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {announcement.isImportant && (
            <div className="p-1 bg-[#F97316]/20 rounded-lg">
              <Star size={16} className="text-[#F97316]" />
            </div>
          )}
          <div className="p-2 bg-[#3B82F6]/20 rounded-lg">
            <MessageSquare size={16} className="text-[#3B82F6]" />
          </div>
          <div>
            <h3 className={`font-bold ${styles.title}`} style={{ color: colors.text }}>
              {announcement.title}
            </h3>
            {showAuthor && announcement.createdBy && (
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                <User size={12} />
                <span>بواسطة {announcement.createdBy.firstName} {announcement.createdBy.secondName}</span>
              </div>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex gap-1">
            {onView && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="p-1 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              >
                <Eye size={14} />
              </motion.button>
            )}
            
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              >
                <Edit size={14} />
              </motion.button>
            )}
            
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded-lg transition-all duration-300 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className={`${styles.content} leading-relaxed`} style={{ color: colors.textSecondary }}>
          {announcement.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(announcement.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{getTimeAgo(announcement.createdAt)}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {announcement.isImportant && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#F97316]/20 rounded-lg">
              <Bell size={12} className="text-[#F97316]" />
              <span className="text-xs font-semibold text-[#F97316]">مهم</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 px-2 py-1 bg-[#3B82F6]/20 rounded-lg">
            <CheckCircle size={12} className="text-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#3B82F6]">منشور</span>
          </div>
        </div>
      </div>

      {/* Action Button (for compact variant) */}
      {variant === 'compact' && onView && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="w-full mt-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye size={16} />
            <span>عرض التفاصيل</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
};

export default AnnouncementCard;
