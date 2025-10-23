import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Calendar,
  Eye,
  Bell,
  Star,
  Activity,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  X,
  Filter,
  Crown,
  UserCheck,
  Target,
  Zap
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';

const MyGroups = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  // State management
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get('/api/groups/student/groups');
      
      if (response.data.success) {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching my groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} className="text-[#F97316]" />
        </motion.div>
      </div>
    );
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#DC2626] bg-clip-text text-transparent mb-2 h-20"
            >
              مجموعاتي
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg"
              style={{ color: colors.textSecondary }}
            >
              المجموعات التي أنت عضو فيها
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchMyGroups}
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-[#F97316]/20"
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.accent
              }}
            >
              <RefreshCw 
                size={18} 
                className={`transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
              />
              تحديث
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Total Groups */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300"
          style={{
            background: colors.cardGradient,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl">
              <Users size={24} className="text-[#F97316]" />
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <TrendingUp size={16} />
              <span className="text-sm font-semibold">+{Math.floor(Math.random() * 5)}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {groups.length}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            إجمالي المجموعات
          </p>
        </motion.div>

        {/* Active Groups */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300"
          style={{
            background: colors.cardGradient,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-xl">
              <Activity size={24} className="text-[#10B981]" />
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <Zap size={16} />
              <span className="text-sm font-semibold">نشط</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {groups.filter(g => g.announcements.length > 0).length}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            مجموعات نشطة
          </p>
        </motion.div>

        {/* Total Announcements */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300"
          style={{
            background: colors.cardGradient,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#3B82F6]/20 to-[#1D4ED8]/20 rounded-xl">
              <MessageSquare size={24} className="text-[#3B82F6]" />
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <Bell size={16} />
              <span className="text-sm font-semibold">جديد</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {groups.reduce((total, group) => total + group.announcements.length, 0)}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            إجمالي الإعلانات
          </p>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-8"
      >
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث في مجموعاتي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          />
        </div>
      </motion.div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-[#F97316]" />
          </div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
            لا توجد مجموعات
          </h3>
          <p style={{ color: colors.textSecondary }}>
            لم يتم إضافتك إلى أي مجموعات بعد
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300 cursor-pointer"
              style={{
                background: colors.cardGradient,
                borderColor: colors.border
              }}
              onClick={() => {
                setSelectedGroup(group);
                setShowGroupDetails(true);
              }}
            >
              {/* Group Cover */}
              <div className="relative mb-4">
                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.name}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl flex items-center justify-center">
                    <Users size={32} className="text-[#F97316]" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-[#F97316]/90 text-white text-xs font-semibold rounded-lg">
                    {group.students.length} عضو
                  </span>
                </div>
                {group.announcements.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <div className="p-1 bg-[#3B82F6]/90 rounded-full">
                      <Bell size={12} className="text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                  {group.name}
                </h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: colors.textSecondary }}>
                  {group.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>أنشئت في {formatDate(group.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Recent Announcements */}
              {group.announcements.length > 0 && (
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

              {/* Action Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  color: 'white'
                }}
              >
                <span>عرض التفاصيل</span>
                <ArrowRight size={16} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Group Details Modal */}
      <AnimatePresence>
        {showGroupDetails && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedGroup.coverImage && (
                    <img
                      src={selectedGroup.coverImage}
                      alt={selectedGroup.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                      {selectedGroup.name}
                    </h2>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      بواسطة {selectedGroup.createdBy.firstName} {selectedGroup.createdBy.secondName}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGroupDetails(false)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{ color: colors.text }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Group Description */}
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                  وصف المجموعة
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  {selectedGroup.description}
                </p>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
                  <Users size={24} className="text-[#F97316] mx-auto mb-2" />
                  <p className="text-2xl font-bold" style={{ color: colors.text }}>
                    {selectedGroup.students.length}
                  </p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    عضو
                  </p>
                </div>
                
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
                  <MessageSquare size={24} className="text-[#3B82F6] mx-auto mb-2" />
                  <p className="text-2xl font-bold" style={{ color: colors.text }}>
                    {selectedGroup.announcements.length}
                  </p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    إعلان
                  </p>
                </div>
                
                <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
                  <Calendar size={24} className="text-[#10B981] mx-auto mb-2" />
                  <p className="text-sm font-bold" style={{ color: colors.text }}>
                    {formatDate(selectedGroup.createdAt)}
                  </p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    تاريخ الإنشاء
                  </p>
                </div>
              </div>

              {/* Announcements */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                  الإعلانات
                </h3>
                
                {selectedGroup.announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="text-gray-400 mx-auto mb-4" />
                    <p style={{ color: colors.textSecondary }}>
                      لا توجد إعلانات في هذه المجموعة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedGroup.announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className={`p-4 rounded-xl border ${
                          announcement.isImportant ? 'border-[#F97316]/50 bg-[#F97316]/5' : ''
                        }`}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: announcement.isImportant ? '#F97316' : colors.border
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {announcement.isImportant && (
                              <div className="p-1 bg-[#F97316]/20 rounded-lg">
                                <Star size={16} className="text-[#F97316]" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold" style={{ color: colors.text }}>
                                {announcement.title}
                              </h4>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                بواسطة {announcement.createdBy.firstName} {announcement.createdBy.secondName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-sm" style={{ color: colors.textMuted }}>
                            {formatDateTime(announcement.createdAt)}
                          </div>
                        </div>
                        
                        <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                          {announcement.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Members - Only for Admins */}
              {isAdmin && (
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
                    أعضاء المجموعة
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedGroup.students.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold">
                            {student.firstName ? student.firstName.charAt(0) : student.name ? student.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <h4 className="font-semibold" style={{ color: colors.text }}>
                              {student.firstName && student.secondName 
                                ? `${student.firstName} ${student.secondName}` 
                                : student.name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              {student.userEmail || student.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyGroups;
