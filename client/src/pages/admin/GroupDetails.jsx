import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  UserPlus,
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
  RefreshCw
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  // State management
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Announcement form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    isImportant: false
  });

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get(`/api/groups/admin/groups/${id}`);
      
      if (response.data.success) {
        setGroup(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

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
            !group.students.some(groupStudent => groupStudent._id === student._id)
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
  }, [searchTimeout, group.students]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearchStudents(query);
  };

  const addStudentsToGroup = async () => {
    if (selectedStudents.length === 0) return;

    try {
      const response = await axiosInstance.post(`/api/groups/admin/groups/${id}/students`, {
        studentIds: selectedStudents
      });

      if (response.data.success) {
        setGroup(response.data.data);
        setSelectedStudents([]);
        setShowAddStudents(false);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding students:', error);
    }
  };

  const removeStudentFromGroup = async (studentId) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا الطالب من المجموعة؟')) {
      try {
        const response = await axiosInstance.delete(`/api/groups/admin/groups/${id}/students/${studentId}`);
        
        if (response.data.success) {
          setGroup(response.data.data);
        }
      } catch (error) {
        console.error('Error removing student:', error);
      }
    }
  };

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/api/groups/admin/groups/${id}/announcements`, announcementForm);
      
      if (response.data.success) {
        setGroup(prev => ({
          ...prev,
          announcements: [response.data.data, ...prev.announcements]
        }));
        setAnnouncementForm({ title: '', content: '', isImportant: false });
        setShowAnnouncementModal(false);
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
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

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>المجموعة غير موجودة</h2>
          <p style={{ color: colors.textSecondary }}>لا يمكن العثور على المجموعة المطلوبة</p>
        </div>
      </div>
    );
  }

  const filteredStudents = group.students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.secondName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/groups')}
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {group.name}
            </h1>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              {group.description}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchGroupDetails}
            disabled={refreshing}
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <RefreshCw 
              size={20} 
              className={`transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
            />
          </motion.button>
        </div>

        {/* Group Cover */}
        {group.coverImage && (
          <div className="relative mb-6">
            <img
              src={group.coverImage}
              alt={group.name}
              className="w-full h-48 object-cover rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F97316]/20 rounded-lg">
                <Users className="text-[#F97316]" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {group.students.length}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  طالب
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3B82F6]/20 rounded-lg">
                <MessageSquare className="text-[#3B82F6]" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {group.announcements.length}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  إعلان
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#10B981]/20 rounded-lg">
                <Calendar className="text-[#10B981]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  {formatDate(group.createdAt).split(' ')[0]}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  تاريخ الإنشاء
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                <Activity className="text-[#F59E0B]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: colors.text }}>
                  نشطة
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  الحالة
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex gap-2 border-b" style={{ borderColor: colors.border }}>
          {[
            { id: 'students', label: 'الطلاب', icon: Users },
            { id: 'announcements', label: 'الإعلانات', icon: MessageSquare },
            { id: 'settings', label: 'الإعدادات', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 relative ${
                  isActive ? 'text-[#F97316]' : 'text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {activeTab === 'students' && (
          <div>
            {/* Students Header */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="البحث في الطلاب..."
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
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddStudents(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                }}
              >
                <UserPlus size={18} />
                إضافة طلاب
              </motion.button>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="p-6 rounded-2xl border shadow-lg hover:shadow-[#F97316]/20 transition-all duration-300"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: colors.text }}>
                          {student.firstName} {student.secondName}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {student.email}
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeStudentFromGroup(student._id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                  
                  {student.parentPhone && (
                    <div className="flex items-center gap-2 text-sm mb-3" style={{ color: colors.textSecondary }}>
                      <Phone size={14} />
                      <span>{student.parentPhone}</span>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/groups/${id}/students/${student._id}`)}
                    className="w-full py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border
                    }}
                  >
                    عرض الملف الشخصي
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            {/* Announcements Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                الإعلانات
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                }}
              >
                <Bell size={18} />
                إرسال إعلان
              </motion.button>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {group.announcements.map((announcement, index) => (
                <motion.div
                  key={announcement._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border shadow-lg transition-all duration-300 ${
                    announcement.isImportant ? 'border-[#F97316]/50 bg-[#F97316]/5' : ''
                  }`}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: announcement.isImportant ? '#F97316' : colors.border
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {announcement.isImportant && (
                        <div className="p-2 bg-[#F97316]/20 rounded-lg">
                          <Star className="text-[#F97316]" size={20} />
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
                    
                    <div className="text-sm" style={{ color: colors.textMuted }}>
                      {formatDate(announcement.createdAt)}
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {announcement.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
              إعدادات المجموعة
            </h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                  معلومات المجموعة
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      اسم المجموعة
                    </label>
                    <input
                      type="text"
                      value={group.name}
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
                      الحد الأقصى للطلاب
                    </label>
                    <input
                      type="number"
                      value={group.settings.maxStudents}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    وصف المجموعة
                  </label>
                  <textarea
                    rows={3}
                    value={group.description}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

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
              className="w-full max-w-2xl rounded-2xl p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
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
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="البحث عن الطلاب... (أدخل حرفين على الأقل)"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
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
              
              <div className="max-h-64 overflow-y-auto space-y-2 mb-6">
                {isSearching && (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F97316] mx-auto mb-2"></div>
                    جاري البحث...
                  </div>
                )}
                
                {!isSearching && searchQuery.length > 0 && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Search className="mx-auto mb-2" size={24} />
                    لم يتم العثور على طلاب
                  </div>
                )}
                
                {!isSearching && searchQuery.length < 2 && (
                  <div className="text-center py-4 text-gray-400">
                    أدخل حرفين على الأقل للبحث
                  </div>
                )}
                
                {searchResults.map((student) => (
                  <div
                    key={student._id}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      selectedStudents.includes(student._id) ? 'border-[#F97316] bg-[#F97316]/10' : ''
                    }`}
                    style={{
                      backgroundColor: selectedStudents.includes(student._id) ? 'rgba(249, 115, 22, 0.1)' : colors.background,
                      borderColor: selectedStudents.includes(student._id) ? '#F97316' : colors.border
                    }}
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
                        {student.firstName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: colors.text }}>
                          {student.firstName} {student.secondName}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {student.email}
                        </p>
                      </div>
                      {selectedStudents.includes(student._id) && (
                        <CheckCircle className="text-[#F97316]" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddStudents(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  إلغاء
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addStudentsToGroup}
                  disabled={selectedStudents.length === 0}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                  }}
                >
                  إضافة {selectedStudents.length} طالب
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
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
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                  إرسال إعلان
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAnnouncementModal(false)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{ color: colors.text }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              <form onSubmit={sendAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    عنوان الإعلان
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
                    محتوى الإعلان
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
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={announcementForm.isImportant}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isImportant: e.target.checked })}
                    className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]/20"
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
                    onClick={() => setShowAnnouncementModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    style={{
                      backgroundColor: colors.background,
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
                    إرسال
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetails;
