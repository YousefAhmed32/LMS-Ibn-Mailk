import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  User,
  Mail,
  Phone,
  Eye,
  Trash2,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const StudentCard = ({ 
  student, 
  onView, 
  onRemove, 
  onMessage,
  showActions = true,
  variant = 'default', // 'default', 'compact', 'detailed'
  showStats = false,
  stats = null
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          card: 'p-3',
          avatar: 'w-8 h-8 text-sm',
          name: 'text-sm',
          email: 'text-xs',
          actions: 'text-xs'
        };
      case 'detailed':
        return {
          card: 'p-6',
          avatar: 'w-16 h-16 text-2xl',
          name: 'text-lg',
          email: 'text-sm',
          actions: 'text-sm'
        };
      default:
        return {
          card: 'p-4',
          avatar: 'w-12 h-12 text-lg',
          name: 'text-base',
          email: 'text-sm',
          actions: 'text-sm'
        };
    }
  };

  const styles = getVariantStyles();

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F97316';
    return '#EF4444';
  };

  const getPerformanceIcon = (score) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`rounded-xl border shadow-lg hover:shadow-[#F97316]/20 transition-all duration-300 ${styles.card}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${styles.avatar} bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
            {student.firstName.charAt(0)}
          </div>
          <div>
            <h3 className={`font-bold ${styles.name}`} style={{ color: colors.text }}>
              {student.firstName} {student.secondName}
            </h3>
            <p className={`${styles.email}`} style={{ color: colors.textSecondary }}>
              {student.userEmail}
            </p>
            {student.parentPhone && (
              <div className="flex items-center gap-1 text-xs" style={{ color: colors.textMuted }}>
                <Phone size={12} />
                <span>{student.parentPhone}</span>
              </div>
            )}
          </div>
        </div>
        
        {onRemove && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-300"
          >
            <Trash2 size={16} />
          </motion.button>
        )}
      </div>

      {/* Stats Section */}
      {showStats && stats && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen size={14} className="text-[#3B82F6]" />
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  الدورات
                </span>
              </div>
              <div className="text-lg font-bold" style={{ color: colors.text }}>
                {stats.totalCourses || 0}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award size={14} className="text-[#F97316]" />
                <span className="text-xs" style={{ color: colors.textSecondary }}>
                  المتوسط
                </span>
              </div>
              <div className="text-lg font-bold" style={{ color: colors.text }}>
                {stats.averageScore || 0}%
              </div>
            </div>
          </div>
          
          {stats.averageScore && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: colors.textSecondary }}>
                <span>الأداء</span>
                <span>{stats.averageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${stats.averageScore}%`,
                    backgroundColor: getPerformanceColor(stats.averageScore)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Indicator */}
      {stats?.averageScore && (
        <div className="mb-4 flex items-center gap-2">
          {(() => {
            const Icon = getPerformanceIcon(stats.averageScore);
            const color = getPerformanceColor(stats.averageScore);
            return (
              <>
                <Icon size={16} style={{ color }} />
                <span className="text-sm font-semibold" style={{ color }}>
                  {stats.averageScore >= 80 ? 'متفوق' : 
                   stats.averageScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                </span>
              </>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {onView && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex-1 py-2 rounded-lg font-semibold transition-all duration-300"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye size={16} />
                <span className={styles.actions}>عرض الملف</span>
              </div>
            </motion.button>
          )}
          
          {onMessage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onMessage();
              }}
              className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
              }}
            >
              <MessageSquare size={16} />
            </motion.button>
          )}
        </div>
      )}

      {/* Last Activity */}
      {stats?.lastActivity && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
            <Activity size={12} />
            <span>آخر نشاط: {new Date(stats.lastActivity).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCard;
