import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Users,
  UserPlus,
  Activity,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star,
  Award,
  Target,
  Zap,
  Calendar,
  Clock
} from 'lucide-react';

const GroupsStats = ({ 
  stats, 
  loading = false,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'grid-cols-2 lg:grid-cols-4',
          card: 'p-4',
          icon: 'w-8 h-8',
          value: 'text-xl',
          label: 'text-xs',
          change: 'text-xs'
        };
      case 'detailed':
        return {
          container: 'grid-cols-1 lg:grid-cols-3',
          card: 'p-8',
          icon: 'w-12 h-12',
          value: 'text-3xl',
          label: 'text-sm',
          change: 'text-sm'
        };
      default:
        return {
          container: 'grid-cols-1 md:grid-cols-3',
          card: 'p-6',
          icon: 'w-10 h-10',
          value: 'text-2xl',
          label: 'text-sm',
          change: 'text-sm'
        };
    }
  };

  const styles = getVariantStyles();

  const statCards = [
    {
      id: 'totalGroups',
      label: 'إجمالي المجموعات',
      value: stats?.totalGroups || 0,
      icon: Users,
      color: '#F97316',
      change: stats?.totalGroupsChange || 0,
      changeType: 'positive'
    },
    {
      id: 'totalStudents',
      label: 'إجمالي الطلاب',
      value: stats?.totalStudents || 0,
      icon: UserPlus,
      color: '#3B82F6',
      change: stats?.totalStudentsChange || 0,
      changeType: 'positive'
    },
    {
      id: 'activeGroups',
      label: 'المجموعات النشطة',
      value: stats?.activeGroups || 0,
      icon: Activity,
      color: '#10B981',
      change: stats?.activeGroupsChange || 0,
      changeType: 'positive'
    },
    {
      id: 'totalAnnouncements',
      label: 'إجمالي الإعلانات',
      value: stats?.totalAnnouncements || 0,
      icon: MessageSquare,
      color: '#8B5CF6',
      change: stats?.totalAnnouncementsChange || 0,
      changeType: 'positive'
    },
    {
      id: 'averageGroupSize',
      label: 'متوسط حجم المجموعة',
      value: stats?.averageGroupSize || 0,
      icon: Target,
      color: '#F59E0B',
      change: stats?.averageGroupSizeChange || 0,
      changeType: 'neutral'
    },
    {
      id: 'engagementRate',
      label: 'معدل التفاعل',
      value: `${stats?.engagementRate || 0}%`,
      icon: Zap,
      color: '#EF4444',
      change: stats?.engagementRateChange || 0,
      changeType: 'positive'
    }
  ];

  const getChangeIcon = (changeType, change) => {
    if (changeType === 'neutral') return null;
    
    if (change > 0) {
      return <ArrowUpRight size={16} className="text-[#10B981]" />;
    } else if (change < 0) {
      return <ArrowDownRight size={16} className="text-[#EF4444]" />;
    }
    return null;
  };

  const getChangeColor = (changeType, change) => {
    if (changeType === 'neutral') return colors.textMuted;
    
    if (change > 0) return '#10B981';
    if (change < 0) return '#EF4444';
    return colors.textMuted;
  };

  if (loading) {
    return (
      <div className={`grid ${styles.container} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`rounded-2xl border shadow-xl ${styles.card}`}
            style={{
              background: colors.cardGradient,
              borderColor: colors.border
            }}
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className={`${styles.icon} bg-gray-300 rounded-xl`} />
                <div className="w-12 h-4 bg-gray-300 rounded" />
              </div>
              <div className="w-16 h-8 bg-gray-300 rounded mb-2" />
              <div className="w-20 h-4 bg-gray-300 rounded" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${styles.container} gap-6`}>
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`relative rounded-2xl border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300 ${styles.card}`}
            style={{
              background: colors.cardGradient,
              borderColor: colors.border
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${styles.icon} bg-gradient-to-br from-[${stat.color}]/20 to-[${stat.color}]/10 rounded-xl flex items-center justify-center`}>
                <Icon size={variant === 'detailed' ? 24 : 20} style={{ color: stat.color }} />
              </div>
              
              {stat.change !== 0 && (
                <div className="flex items-center gap-1" style={{ color: getChangeColor(stat.changeType, stat.change) }}>
                  {getChangeIcon(stat.changeType, stat.change)}
                  <span className={`font-semibold ${styles.change}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                </div>
              )}
            </div>
            
            <h3 className={`font-bold mb-1 ${styles.value}`} style={{ color: colors.text }}>
              {stat.value}
            </h3>
            <p className={`font-medium ${styles.label}`} style={{ color: colors.textSecondary }}>
              {stat.label}
            </p>
            
            {/* Decorative element */}
            <div 
              className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
              style={{ 
                background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                transform: 'translate(10px, -10px)'
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default GroupsStats;
