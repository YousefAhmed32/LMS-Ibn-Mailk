import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import {
  Users,
  MessageSquare,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Settings,
  Bell,
  Star,
  ArrowRight,
  Crown
} from 'lucide-react';

const GroupCard = ({ 
  group, 
  onView, 
  onEdit, 
  onDelete, 
  onManage, 
  showActions = true,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const { colors } = useTheme();

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          card: 'p-4',
          image: 'h-20',
          title: 'text-lg',
          description: 'text-sm line-clamp-1',
          stats: 'text-xs'
        };
      case 'detailed':
        return {
          card: 'p-8',
          image: 'h-40',
          title: 'text-2xl',
          description: 'text-base',
          stats: 'text-sm'
        };
      default:
        return {
          card: 'p-6',
          image: 'h-32',
          title: 'text-xl',
          description: 'text-sm line-clamp-2',
          stats: 'text-sm'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative rounded-2xl border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300 cursor-pointer ${styles.card}`}
      style={{
        background: colors.cardGradient,
        borderColor: colors.border
      }}
      onClick={onView}
    >
      {/* Group Cover */}
      <div className="relative mb-4">
        {group.coverImage ? (
          <img
            src={getImageUrl(group.coverImage)}
            alt={group.name}
            className={`w-full ${styles.image} object-cover rounded-xl`}
          />
        ) : (
          <div className={`w-full ${styles.image} bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl flex items-center justify-center`}>
            <Users size={variant === 'detailed' ? 48 : 32} className="text-[#F97316]" />
          </div>
        )}
        
        {/* Overlay Badges */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-[#F97316]/90 text-white text-xs font-semibold rounded-lg">
            {group.students?.length || 0} عضو
          </span>
        </div>
        
        {group.announcements?.length > 0 && (
          <div className="absolute top-2 left-2">
            <div className="p-1 bg-[#3B82F6]/90 rounded-full">
              <Bell size={12} className="text-white" />
            </div>
          </div>
        )}

        {group.createdBy && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg">
              <Crown size={12} className="text-[#F97316]" />
              <span className="text-white text-xs">
                {group.createdBy.firstName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Group Info */}
      <div className="mb-4">
        <h3 className={`font-bold mb-2 ${styles.title}`} style={{ color: colors.text }}>
          {group.name}
        </h3>
        <p className={`mb-3 ${styles.description}`} style={{ color: colors.textSecondary }}>
          {group.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>أنشئت في {formatDate(group.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Recent Announcements (for detailed variant) */}
      {variant === 'detailed' && group.announcements?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-[#3B82F6]" />
            <span className="text-sm font-semibold" style={{ color: colors.text }}>
              آخر الإعلانات
            </span>
          </div>
          <div className="space-y-2">
            {group.announcements.slice(0, 2).map((announcement) => (
              <div
                key={announcement._id}
                className={`p-3 rounded-lg text-xs ${
                  announcement.isImportant ? 'bg-[#F97316]/10 border border-[#F97316]/30' : 'bg-gray-100/50'
                }`}
                style={{
                  backgroundColor: announcement.isImportant ? 'rgba(249, 115, 22, 0.1)' : colors.surface
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {announcement.isImportant && (
                    <Star size={12} className="text-[#F97316]" />
                  )}
                  <span className="font-semibold" style={{ color: colors.text }}>
                    {announcement.title}
                  </span>
                </div>
                <p className="line-clamp-2" style={{ color: colors.textSecondary }}>
                  {announcement.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {onView && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
                className="p-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              >
                <Eye size={16} />
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
                className="p-2 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text
                }}
              >
                <Edit size={16} />
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
                className="p-2 rounded-lg transition-all duration-300 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>
          
          {onManage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: 'white'
              }}
            >
              <span>إدارة</span>
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      )}

      {/* Action Button (for compact variant) */}
      {variant === 'compact' && onView && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all duration-300 mt-4"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
            color: 'white'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
        >
          <span>عرض التفاصيل</span>
          <ArrowRight size={16} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default GroupCard;
