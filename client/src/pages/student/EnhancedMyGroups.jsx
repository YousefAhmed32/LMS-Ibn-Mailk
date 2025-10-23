import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
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
  ArrowLeft,
  RefreshCw,
  Search,
  X,
  Filter,
  Crown,
  UserCheck,
  Target,
  Zap,
  ExternalLink,
  Send,
  Smile,
  Paperclip,
  Image,
  MoreHorizontal
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import socketService from '../../services/socketService';

const EnhancedMyGroups = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };
  
  // State management
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  // Socket connection and real-time chat
  useEffect(() => {
    if (user && selectedGroup) {
      // Connect to socket and join group room
      socketService.connect(user._id);
      socketService.joinGroup(selectedGroup._id);

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.groupId === selectedGroup._id) {
          setChatMessages(prev => [...prev, data.message]);
        }
      };

      socketService.onNewGroupMessage(handleNewMessage);

      // Cleanup when group changes or component unmounts
      return () => {
        socketService.offNewGroupMessage(handleNewMessage);
        socketService.leaveGroup(selectedGroup._id);
      };
    }
  }, [user, selectedGroup]);

  useEffect(() => {
    if (selectedGroup && activeTab === 'chat') {
      fetchChatMessages(selectedGroup._id);
    }
  }, [selectedGroup, activeTab]);

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

  const fetchChatMessages = async (groupId) => {
    try {
      setChatLoading(true);
      const response = await axiosInstance.get(`/api/groups/${groupId}/chat/messages`);
      
      if (response.data.success) {
        setChatMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      const response = await axiosInstance.post(`/api/groups/${selectedGroup._id}/chat/messages`, {
        content: newMessage,
        messageType: 'text'
      });
      
      if (response.data.success) {
        setNewMessage('');
        fetchChatMessages(selectedGroup._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Eye },
    { id: 'announcements', label: 'الإعلانات', icon: Bell },
    ...(isAdmin ? [{ id: 'members', label: 'الأعضاء', icon: Users }] : []),
    { id: 'chat', label: 'المحادثة', icon: MessageSquare },
    { id: 'progress', label: 'تقدمي', icon: TrendingUp }
  ];

  return (
    <PageWrapper>
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
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300" size={20} />
          <input
            type="text"
            placeholder="البحث في مجموعاتي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]/50 hover:border-[#F97316]/30"
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
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Users size={32} className="text-[#F97316]" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-2xl font-bold mb-4" 
            style={{ color: colors.text }}
          >
            لا توجد مجموعات
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            style={{ color: colors.textSecondary }}
          >
            لم يتم إضافتك إلى أي مجموعات بعد
          </motion.p>
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
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/30 transition-all duration-500 cursor-pointer group"
              style={{
                background: colors.cardGradient,
                borderColor: colors.border
              }}
              onClick={() => {
                setSelectedGroup(group);
                setShowGroupDetails(true);
                setActiveTab('overview');
              }}
            >
              {/* Group Cover */}
              <div className="relative mb-4 overflow-hidden rounded-xl">
                {group.coverImage ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(group.coverImage)}
                      alt={group.name}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl flex items-center justify-center group-hover:from-[#F97316]/30 group-hover:to-[#EA580C]/30 transition-all duration-300">
                    <Users size={32} className="text-[#F97316] group-hover:scale-110 transition-transform duration-300" />
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
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#F97316] transition-colors duration-300" style={{ color: colors.text }}>
                  {group.name}
                </h3>
                <p className="text-sm mb-3 line-clamp-2 leading-relaxed" style={{ color: colors.textSecondary }}>
                  {group.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>أنشئت في {formatDate(group.createdAt)}</span>
                  </div>
                </div>

                {/* Quick Chat Access */}
                <div className="mt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                      setShowGroupDetails(true);
                      setActiveTab('chat');
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <MessageSquare size={14} className="text-[#F97316]" />
                    <span>محادثة سريعة</span>
                  </motion.button>
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
                        {announcement.link && announcement.link.url && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 text-[#F97316] text-xs">
                              <ExternalLink size={10} />
                              رابط مرفق
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.div
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-[#F97316]/30"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  color: 'white'
                }}
              >
                <span>عرض التفاصيل</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
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
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGroupDetails(false)}
                    className="p-2 rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: colors.background,
                      color: colors.text 
                    }}
                    title="العودة"
                  >
                    <ArrowLeft size={20} />
                  </motion.button>
                  
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
                  title="إغلاق"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        activeTab === tab.id ? 'text-white' : ''
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id 
                          ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                          : 'transparent',
                        color: activeTab === tab.id ? 'white' : colors.text
                      }}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentOverviewTab group={selectedGroup} colors={colors} />
                    </motion.div>
                  )}
                  
                  {activeTab === 'announcements' && (
                    <motion.div
                      key="announcements"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentAnnouncementsTab 
                        group={selectedGroup} 
                        colors={colors} 
                        formatDate={formatDate}
                      />
                    </motion.div>
                  )}
                  
                  {activeTab === 'members' && (
                    <motion.div
                      key="members"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isAdmin ? (
                        <StudentMembersTab group={selectedGroup} colors={colors} />
                      ) : (
                        <div className="text-center py-12">
                          <Users size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.textMuted }} />
                          <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                            غير مسموح بعرض الأعضاء
                          </h3>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            فقط الأدمن يمكنه رؤية قائمة أعضاء المجموعة
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentChatTab 
                        group={selectedGroup} 
                        colors={colors} 
                        chatMessages={chatMessages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                        formatDate={formatDate}
                        chatLoading={chatLoading}
                      />
                    </motion.div>
                  )}
                  
                  {activeTab === 'progress' && (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StudentProgressTab group={selectedGroup} colors={colors} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageWrapper>
  );
};

// Student Tab Components
const StudentOverviewTab = ({ group, colors }) => (
  <div className="space-y-6">
    {/* Group Info */}
    <div className="p-6 rounded-xl" style={{ backgroundColor: colors.background }}>
      <div className="flex items-start gap-6">
        {group.coverImage && (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-24 h-24 object-cover rounded-xl"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            {group.name}
          </h2>
          <p className="text-lg mb-4" style={{ color: colors.textSecondary }}>
            {group.description}
          </p>
          <div className="flex items-center gap-6 text-sm" style={{ color: colors.textMuted }}>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{group.students.length} عضو</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={16} />
              <span>{group.announcements.length} إعلان</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>أنشئت في {new Date(group.createdAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
        <div className="w-12 h-12 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-[#F97316]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.students.length}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          إجمالي الأعضاء
        </p>
      </div>

      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6]/20 to-[#1D4ED8]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Bell size={24} className="text-[#3B82F6]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.announcements.length}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          إجمالي الإعلانات
        </p>
      </div>

      <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.background }}>
        <div className="w-12 h-12 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Activity size={24} className="text-[#10B981]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.chatMessages?.length || 0}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          رسائل المحادثة
        </p>
      </div>
    </div>
  </div>
);

const StudentAnnouncementsTab = ({ group, colors, formatDate }) => (
  <div className="space-y-6">
    {group.announcements.length === 0 ? (
      <div className="p-12 text-center rounded-xl" style={{ backgroundColor: colors.background }}>
        <Bell size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          لا توجد إعلانات
        </h3>
        <p style={{ color: colors.textSecondary }}>
          لم يتم إرسال أي إعلانات في هذه المجموعة بعد
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {group.announcements.map((announcement) => (
          <div key={announcement._id} className="p-6 rounded-xl" style={{ backgroundColor: colors.background }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {announcement.isImportant && (
                  <div className="p-2 bg-[#F97316]/20 rounded-lg">
                    <Star size={16} className="text-[#F97316]" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                    {announcement.title}
                  </h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    بواسطة {announcement.createdBy.firstName} {announcement.createdBy.secondName}
                  </p>
                </div>
              </div>
              <span className="text-sm" style={{ color: colors.textMuted }}>
                {formatDate(announcement.createdAt)}
              </span>
            </div>
            
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              {announcement.content}
            </p>
            
            {announcement.link && announcement.link.url && (
              <motion.a
                href={announcement.link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-[#F97316]/20"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                }}
              >
                <ExternalLink size={16} />
                {announcement.link.label || 'فتح الرابط'}
              </motion.a>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const StudentMembersTab = ({ group, colors }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>
        أعضاء المجموعة ({group.students.length})
      </h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {group.students.map((student) => (
        <div key={student._id} className="p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold">
              {student.firstName ? student.firstName.charAt(0) : '?'}
            </div>
            <div className="flex-1">
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
);

const StudentChatTab = ({ group, colors, chatMessages, newMessage, setNewMessage, handleSendMessage, formatDate, chatLoading }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {group.coverImage ? (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-10 h-10 object-cover rounded-lg"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
        )}
        <h2 className="text-xl font-bold" style={{ color: colors.text }}>
          محادثة المجموعة
        </h2>
      </div>
      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        {group.settings.allowStudentMessages ? 'يمكنك المراسلة' : 'الطلاب لا يمكنهم المراسلة'}
      </div>
    </div>
    
    <div className="p-0 overflow-hidden rounded-xl" style={{ backgroundColor: colors.background }}>
      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {chatLoading ? (
          <div className="flex items-center justify-center h-full">
            <Activity size={24} className="text-[#F97316] animate-spin" />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
              <p style={{ color: colors.textSecondary }}>
                لا توجد رسائل في المحادثة بعد
              </p>
            </div>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender.role === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender.role === 'admin'
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender.role === 'admin' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {message.sender.firstName} • {formatDate(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Chat Input */}
      {group.settings.allowStudentMessages && (
        <div className="p-4 border-t" style={{ borderColor: colors.border }}>
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالة..."
              className="flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
              }}
            >
              <Send size={16} />
            </motion.button>
          </form>
        </div>
      )}
    </div>
  </div>
);

const StudentProgressTab = ({ group, colors }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold" style={{ color: colors.text }}>
      تقدمي في المجموعة
    </h2>
    
    <div className="p-12 text-center rounded-xl" style={{ backgroundColor: colors.background }}>
      <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
        قريباً
      </h3>
      <p style={{ color: colors.textSecondary }}>
        ستتوفر ميزة عرض التقدم والدرجات قريباً
      </p>
    </div>
  </div>
);

export default EnhancedMyGroups;
