import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Settings,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Award,
  TrendingUp,
  Activity,
  Bell,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  UserPlus,
  Link,
  ExternalLink,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Plus,
  Image,
  Paperclip,
  Smile,
  MoreHorizontal
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import socketService from '../../services/socketService';
import { getImageUrl } from '../../utils/imageUtils';

const EnhancedGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Helper function to get full image URL is now imported from utils
  
  // State management
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    isImportant: false,
    link: {
      url: '',
      label: '',
      type: 'custom'
    }
  });
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Edit announcement state
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    isImportant: false,
    link: { url: '', label: '', type: 'custom' }
  });

  // Check for tab query parameter on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'announcements', 'members', 'chat', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchGroupDetails();
    if (activeTab === 'chat') {
      fetchChatMessages();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (showAddStudents) {
      fetchAvailableStudents();
    }
  }, [showAddStudents]);

  // Socket connection and real-time chat
  useEffect(() => {
    if (user && id) {
      // Connect to socket and join group room
      const socket = socketService.connect(user._id);
      socketService.joinGroup(id);

      // Track connection status
      setSocketConnected(socketService.isSocketConnected());

      // Listen for connection status changes
      const handleConnect = () => {
        setSocketConnected(true);
        socketService.joinGroup(id); // Rejoin group on reconnect
      };

      const handleDisconnect = () => {
        setSocketConnected(false);
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.groupId === id) {
          setChatMessages(prev => [...prev, data.message]);
        }
      };

      socketService.onNewGroupMessage(handleNewMessage);

      // Fallback polling when socket is disconnected
      let pollInterval;
      if (!socketService.isSocketConnected()) {
        pollInterval = setInterval(() => {
          if (activeTab === 'chat') {
            fetchChatMessages();
          }
        }, 5000); // Poll every 5 seconds when disconnected
      }

      // Cleanup on unmount
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socketService.offNewGroupMessage(handleNewMessage);
        socketService.leaveGroup(id);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      };
    }
  }, [user, id, activeTab]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/groups/admin/groups/${id}`);
      
      if (response.data.success) {
        setGroup(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      setChatLoading(true);
      const response = await axiosInstance.get(`/api/groups/${id}/chat/messages`);
      
      if (response.data.success) {
        setChatMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/api/groups/admin/groups/${id}/announcements`, announcementForm);
      
      if (response.data.success) {
        setShowCreateAnnouncement(false);
        setAnnouncementForm({
          title: '',
          content: '',
          isImportant: false,
          link: { url: '', label: '', type: 'custom' }
        });
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axiosInstance.post(`/api/groups/${id}/chat/messages`, {
        content: newMessage,
        messageType: 'text'
      });
      
      if (response.data.success) {
        setNewMessage('');
        fetchChatMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/api/groups/admin/groups/${id}/announcements/${editingAnnouncement._id}`,
        editForm
      );
      
      if (response.data.success) {
        setEditingAnnouncement(null);
        setEditForm({ title: '', content: '', isImportant: false, link: { url: '', label: '', type: 'custom' } });
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error editing announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    
    try {
      const response = await axiosInstance.delete(
        `/api/groups/admin/groups/${id}/announcements/${announcementId}`
      );
      
      if (response.data.success) {
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    try {
      const response = await axiosInstance.post(`/api/groups/admin/groups/${id}/students`, {
        studentIds: selectedStudents
      });
      
      if (response.data.success) {
        setShowAddStudents(false);
        setSelectedStudents([]);
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error adding students:', error);
    }
  };

  const handleToggleChatPermissions = async () => {
    try {
      const response = await axiosInstance.put(`/api/groups/${id}/chat/settings`, {
        allowStudentMessages: !group.settings.allowStudentMessages
      });
      
      if (response.data.success) {
        fetchGroupDetails();
      }
    } catch (error) {
      console.error('Error updating chat settings:', error);
    }
  };

  // Debounced search function
  const debouncedSearchStudents = useCallback((query) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        console.log('🔍 Searching students with query:', query);
        const response = await axiosInstance.get(`/api/groups/admin/students/search?q=${encodeURIComponent(query)}`);
        
        if (response.data.success) {
          // Filter out students already in the group
          const filteredStudents = response.data.data.filter(student => 
            !group?.students?.some(groupStudent => groupStudent._id === student._id)
          );
          setSearchResults(filteredStudents);
          console.log('✅ Search results:', filteredStudents.length, 'students found');
        } else {
          setSearchResults([]);
          console.log('❌ Search failed:', response.data.message);
        }
      } catch (error) {
        console.error('❌ Error searching students:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250); // 250ms debounce

    setSearchTimeout(timeout);
  }, [searchTimeout, group?.students]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearchStudents(query);
  };

  const fetchAvailableStudents = async () => {
    try {
      // Load initial students (first 20)
      const response = await axiosInstance.get('/api/groups/admin/students/search?q=a');
      if (response.data.success) {
        setAvailableStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: Eye },
    { id: 'announcements', label: 'الإعلانات', icon: Bell },
    { id: 'members', label: 'الأعضاء', icon: Users },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare },
    { id: 'grades', label: 'الدرجات والتقدم', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Activity size={32} className="text-[#F97316]" />
        </motion.div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            المجموعة غير موجودة
          </h2>
          <p style={{ color: colors.textSecondary }}>
            لا يمكن العثور على المجموعة المطلوبة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 p-6 border-b" style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg transition-all duration-300"
              style={{ 
                backgroundColor: colors.background,
                color: colors.text 
              }}
              title="العودة"
            >
              <ArrowLeft size={20} />
            </motion.button>
            
            <div className="flex items-center gap-4">
              {group.coverImage && (
                <img
                  src={getImageUrl(group.coverImage)}
                  alt={group.name}
                  className="w-12 h-12 object-cover rounded-xl"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                  {group.name}
                </h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {group.students.length} عضو • {group.announcements.length} إعلان
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateAnnouncement(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                color: 'white'
              }}
            >
              <Plus size={16} />
              إعلان جديد
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddStudents(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <UserPlus size={16} />
              إضافة طلاب
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b" style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }}>
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
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab group={group} colors={colors} />
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
              <AnnouncementsTab 
                group={group} 
                colors={colors} 
                formatDate={formatDate}
                onEditAnnouncement={(announcement) => {
                  setEditingAnnouncement(announcement);
                  setEditForm({
                    title: announcement.title,
                    content: announcement.content,
                    isImportant: announcement.isImportant,
                    link: announcement.link || { url: '', label: '', type: 'custom' }
                  });
                }}
                onDeleteAnnouncement={handleDeleteAnnouncement}
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
              <MembersTab group={group} colors={colors} />
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
              <ChatTab 
                group={group} 
                colors={colors} 
                chatMessages={chatMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                formatDate={formatDate}
                chatLoading={chatLoading}
                onToggleChatPermissions={handleToggleChatPermissions}
                socketConnected={socketConnected}
              />
            </motion.div>
          )}
          
          {activeTab === 'grades' && (
            <motion.div
              key="grades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GradesTab group={group} colors={colors} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showCreateAnnouncement && (
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
              className="w-full max-w-2xl rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  إعلان جديد
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateAnnouncement(false)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{ color: colors.text }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    العنوان
                  </label>
                  <input
                    type="text"
                    required
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    المحتوى
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>

                {/* Link Section */}
                <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    رابط مرفق (اختياري)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        رابط الرابط
                      </label>
                      <input
                        type="url"
                        value={announcementForm.link.url}
                        onChange={(e) => setAnnouncementForm({ 
                          ...announcementForm, 
                          link: { ...announcementForm.link, url: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        نص الزر
                      </label>
                      <input
                        type="text"
                        value={announcementForm.link.label}
                        onChange={(e) => setAnnouncementForm({ 
                          ...announcementForm, 
                          link: { ...announcementForm.link, label: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        placeholder="انضم إلى الاجتماع"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      نوع الرابط
                    </label>
                    <select
                      value={announcementForm.link.type}
                      onChange={(e) => setAnnouncementForm({ 
                        ...announcementForm, 
                        link: { ...announcementForm.link, type: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      <option value="custom">رابط مخصص</option>
                      <option value="zoom">اجتماع Zoom</option>
                      <option value="drive">Google Drive</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={announcementForm.isImportant}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isImportant: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isImportant" className="text-sm font-semibold" style={{ color: colors.text }}>
                    إعلان مهم
                  </label>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateAnnouncement(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    إلغاء
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    إرسال الإعلان
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Announcement Modal */}
      <AnimatePresence>
        {editingAnnouncement && (
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
              className="w-full max-w-2xl rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  تعديل الإعلان
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingAnnouncement(null)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{ color: colors.text }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleEditAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    العنوان
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    المحتوى
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>

                {/* Link Section */}
                <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    رابط مرفق (اختياري)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        رابط الرابط
                      </label>
                      <input
                        type="url"
                        value={editForm.link.url}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          link: { ...editForm.link, url: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        نص الزر
                      </label>
                      <input
                        type="text"
                        value={editForm.link.label}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          link: { ...editForm.link, label: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        placeholder="انضم إلى الاجتماع"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      نوع الرابط
                    </label>
                    <select
                      value={editForm.link.type}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        link: { ...editForm.link, type: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    >
                      <option value="custom">رابط مخصص</option>
                      <option value="zoom">اجتماع Zoom</option>
                      <option value="drive">Google Drive</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="editIsImportant"
                    checked={editForm.isImportant}
                    onChange={(e) => setEditForm({ ...editForm, isImportant: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="editIsImportant" className="text-sm font-semibold" style={{ color: colors.text }}>
                    إعلان مهم
                  </label>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingAnnouncement(null)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    إلغاء
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    حفظ التعديلات
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Students Modal */}
      <AnimatePresence>
        {showAddStudents && (
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
              className="w-full max-w-4xl rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  إضافة طلاب للمجموعة
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddStudents(false)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{ color: colors.text }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    البحث عن الطلاب
                  </label>
                  <div className="relative">
                    <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="ابحث بالاسم أو البريد الإلكتروني... (أدخل حرفين على الأقل)"
                      className="w-full pl-4 pr-12 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    />
                    {isSearching && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F97316]"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Students List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {isSearching && (
                    <div className="text-center py-4 text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F97316] mx-auto mb-2"></div>
                      جاري البحث...
                    </div>
                  )}
                  
                  {!isSearching && searchTerm.length > 0 && searchResults.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Search className="mx-auto mb-2" size={24} />
                      لم يتم العثور على طلاب
                    </div>
                  )}
                  
                  {!isSearching && searchTerm.length < 2 && (
                    <div className="text-center py-4 text-gray-400">
                      أدخل حرفين على الأقل للبحث
                    </div>
                  )}
                  
                  {(searchTerm.length >= 2 ? searchResults : availableStudents)
                    .filter(student => 
                      !group?.students?.some(groupStudent => groupStudent._id === student._id)
                    )
                    .map((student) => (
                      <div
                        key={student._id}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          selectedStudents.includes(student._id)
                            ? 'border-[#F97316] bg-[#F97316]/5'
                            : 'border-gray-200 hover:border-[#F97316]/50'
                        }`}
                        onClick={() => {
                          if (selectedStudents.includes(student._id)) {
                            setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                          } else {
                            setSelectedStudents([...selectedStudents, student._id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold">
                            {student.firstName ? student.firstName.charAt(0) : '?'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: colors.text }}>
                              {student.firstName && student.secondName 
                                ? `${student.firstName} ${student.secondName}` 
                                : student.name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              {student.email || 'No email'}
                            </p>
                          </div>
                          {selectedStudents.includes(student._id) && (
                            <CheckCircle size={20} className="text-[#F97316]" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Selected Count */}
                {selectedStudents.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                    <p className="text-sm font-semibold" style={{ color: colors.text }}>
                      تم اختيار {selectedStudents.length} طالب
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddStudents(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  >
                    إلغاء
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddStudents}
                    disabled={selectedStudents.length === 0}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    إضافة الطلاب المختارين
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ group, colors }) => (
  <div className="space-y-6">
    {/* Group Info */}
    <LuxuryCard className="p-6">
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
    </LuxuryCard>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <LuxuryCard className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-[#F97316]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.students.length}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          إجمالي الأعضاء
        </p>
      </LuxuryCard>

      <LuxuryCard className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6]/20 to-[#1D4ED8]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Bell size={24} className="text-[#3B82F6]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.announcements.length}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          إجمالي الإعلانات
        </p>
      </LuxuryCard>

      <LuxuryCard className="p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Activity size={24} className="text-[#10B981]" />
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
          {group.chatMessages?.length || 0}
        </h3>
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          رسائل المحادثة
        </p>
      </LuxuryCard>
    </div>
  </div>
);

const AnnouncementsTab = ({ group, colors, formatDate, onEditAnnouncement, onDeleteAnnouncement }) => (
  <div className="space-y-6">
    {group.announcements.length === 0 ? (
      <LuxuryCard className="p-12 text-center">
        <Bell size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          لا توجد إعلانات
        </h3>
        <p style={{ color: colors.textSecondary }}>
          لم يتم إرسال أي إعلانات في هذه المجموعة بعد
        </p>
      </LuxuryCard>
    ) : (
      <div className="space-y-4">
        {group.announcements.map((announcement) => (
          <LuxuryCard key={announcement._id} className="p-6">
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
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  {formatDate(announcement.createdAt)}
                </span>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditAnnouncement(announcement)}
                    className="p-2 rounded-lg transition-all duration-300 hover:bg-[#F97316]/10"
                    style={{ color: colors.text }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteAnnouncement(announcement._id)}
                    className="p-2 rounded-lg transition-all duration-300 hover:bg-red-500/10"
                    style={{ color: '#EF4444' }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
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
          </LuxuryCard>
        ))}
      </div>
    )}
  </div>
);

const MembersTab = ({ group, colors }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>
        أعضاء المجموعة ({group.students.length})
      </h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {group.students.map((student) => {
        // Debug: Log student data to see what fields are available
        console.log('Student data for admin:', student);
        console.log('Student email fields:', {
          userEmail: student.userEmail,
          email: student.email
        });
        
        return (
          <LuxuryCard key={student._id} className="p-4">
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
                  {(() => {
                    // Debug: Log all possible email fields
                    console.log('All student fields:', Object.keys(student));
                    console.log('Email fields check:', {
                      userEmail: student.userEmail,
                      email: student.email
                    });
                    
                    // Try to find email from possible field names
                    const email = student.userEmail || student.email;
                    
                    if (email) {
                      console.log('Found email:', email);
                      return email;
                    } else {
                      console.log('No email found, showing fallback');
                      return 'عضو في المجموعة';
                    }
                  })()}
                </p>
                {student.parentPhone && (
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    <Phone size={12} className="inline mr-1" />
                    {student.parentPhone}
                  </p>
                )}
              </div>
            </div>
          </LuxuryCard>
        );
      })}
    </div>
  </div>
);

const ChatTab = ({ group, colors, chatMessages, newMessage, setNewMessage, handleSendMessage, formatDate, chatLoading, onToggleChatPermissions, socketConnected }) => (
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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {socketConnected ? 'متصل' : 'غير متصل'}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <div className={`w-2 h-2 rounded-full ${group.settings.allowStudentMessages ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {group.settings.allowStudentMessages ? 'الطلاب يمكنهم المراسلة' : 'الطلاب لا يمكنهم المراسلة'}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleChatPermissions}
          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
            group.settings.allowStudentMessages 
              ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20' 
              : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
          }`}
        >
          {group.settings.allowStudentMessages ? 'منع الطلاب' : 'السماح للطلاب'}
        </motion.button>
      </div>
    </div>
    
    <LuxuryCard className="p-0 overflow-hidden">
      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: colors.background }}>
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
      <div className="p-4 border-t" style={{ borderColor: colors.border }}>
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالة..."
            className="flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
            style={{
              backgroundColor: colors.background,
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
    </LuxuryCard>
  </div>
);

const GradesTab = ({ group, colors }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold" style={{ color: colors.text }}>
      الدرجات والتقدم
    </h2>
    
    <LuxuryCard className="p-12 text-center">
      <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
        قريباً
      </h3>
      <p style={{ color: colors.textSecondary }}>
        ستتوفر ميزة عرض الدرجات والتقدم قريباً
      </p>
    </LuxuryCard>
  </div>
);

export default EnhancedGroupDetails;
