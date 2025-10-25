import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  MessageSquare,
  Calendar,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star,
  Activity,
  BarChart3,
  Image,
  Upload,
  X
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { getImageUrlSafe, testImageUrl, getFallbackImage } from '../../utils/imageUtils';
import { testMultipleGroupImages, debugImageSystem, testServerImageAccess, testImageInBrowser } from '../../utils/testImageSystem';

const GroupsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();

  // Helper function to get full image URL is now imported from utils

  // State management
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalStudents: 0,
    recentGroups: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState('overview');

  // Form state for creating/editing groups
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    settings: {
      allowStudentMessages: false,
      isPrivate: false,
      maxStudents: 50
    }
  });

  // Image upload state
  const [imageUpload, setImageUpload] = useState({
    file: null,
    preview: null,
    uploading: false
  });

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const fetchGroupsData = async () => {
    try {
      setRefreshing(true);
      
      const [groupsResponse, statsResponse] = await Promise.all([
        axiosInstance.get('/api/groups/admin/groups'),
        axiosInstance.get('/api/groups/admin/stats')
      ]);

      if (groupsResponse.data.success) {
        const groupsData = groupsResponse.data.data || [];
        console.log('📊 Groups data fetched:', groupsData);
        console.log('📊 Groups analysis:', groupsData.map(g => ({
          name: g.name,
          coverImage: g.coverImage,
          hasImage: !!g.coverImage,
          imageType: g.coverImage ? (g.coverImage.startsWith('http') ? 'HTTP' : g.coverImage.startsWith('/api/image/') ? 'GRIDFS' : 'LOCAL') : 'NONE'
        })));
        
        // Test image URLs with enhanced logging
        for (const group of groupsData) {
          if (group.coverImage) {
            const imageUrl = getImageUrlSafe(group.coverImage);
            console.log(`🖼️ Testing image for group "${group.name}":`, {
              original: group.coverImage,
              processed: imageUrl,
              isHttp: group.coverImage.startsWith('http'),
              isGridFS: group.coverImage.startsWith('/api/image/'),
              isLocal: group.coverImage.startsWith('/uploads/') || !group.coverImage.startsWith('/')
            });
            
            // Test image accessibility with timeout
            testImageUrl(imageUrl).then(isAccessible => {
              console.log(`📸 Image accessibility for "${group.name}":`, {
                accessible: isAccessible,
                url: imageUrl,
                groupName: group.name
              });
            }).catch(error => {
              console.error(`❌ Error testing image for "${group.name}":`, error);
            });
          }
        }
        
        setGroups(groupsData);
        
        // Test all group images
        if (groupsData.length > 0) {
          console.log('🧪 Running comprehensive image tests...');
          testMultipleGroupImages(groupsData).then(({ results, summary }) => {
            console.log('📊 Image test results:', { results, summary });
          });
        }
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching groups data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUpload({
          file: file,
          preview: e.target.result,
          uploading: false
        });
        setFormData({ ...formData, coverImage: '' }); // Clear URL if file is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUpload({
      file: null,
      preview: null,
      uploading: false
    });
  };

  const uploadImageToServer = async () => {
    if (!imageUpload.file) return null;

    setImageUpload(prev => ({ ...prev, uploading: true }));
    
    try {
      console.log('📤 Uploading image:', {
        fileName: imageUpload.file.name,
        fileSize: imageUpload.file.size,
        fileType: imageUpload.file.type
      });
      
      const { uploadImageToGridFS } = await import('../../utils/imageUtils');
      const imageUrl = await uploadImageToGridFS(imageUpload.file);
      
      console.log('✅ Image uploaded successfully:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
    
    return null;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = formData.coverImage;
      
      // If image file is selected, upload it first
      if (imageUpload.file) {
        coverImageUrl = await uploadImageToServer();
        if (!coverImageUrl) {
          alert('فشل في رفع الصورة');
          return;
        }
      }

      const groupData = {
        ...formData,
        coverImage: coverImageUrl
      };

      console.log('📝 Creating group with data:', groupData);
      console.log('🖼️ Cover image URL:', coverImageUrl);
      console.log('📝 Data analysis:', {
        name: { value: groupData.name, type: typeof groupData.name, length: groupData.name?.length },
        description: { value: groupData.description, type: typeof groupData.description, length: groupData.description?.length },
        coverImage: { value: groupData.coverImage, type: typeof groupData.coverImage, isUrl: groupData.coverImage?.startsWith('http') },
        settings: { value: groupData.settings, type: typeof groupData.settings, isObject: typeof groupData.settings === 'object' }
      });
      const response = await axiosInstance.post('/api/groups/admin/groups', groupData);
      
      if (response.data.success) {
        console.log('✅ Group created successfully:', response.data.data);
        console.log('🖼️ Created group cover image:', response.data.data.coverImage);
        console.log('🖼️ Image URL analysis:', {
          original: response.data.data.coverImage,
          processed: response.data.data.coverImage ? getImageUrl(response.data.data.coverImage) : null,
          isHttp: response.data.data.coverImage?.startsWith('http'),
          isGridFS: response.data.data.coverImage?.startsWith('/api/image/')
        });
        setGroups([response.data.data, ...groups]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          coverImage: '',
          settings: {
            allowStudentMessages: false,
            isPrivate: false,
            maxStudents: 50
          }
        });
        setImageUpload({
          file: null,
          preview: null,
          uploading: false
        });
      }
    } catch (error) {
      console.error('❌ Error creating group:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Validation errors:', error.response?.data?.errors);
      console.error('❌ Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Show detailed error message
      const errorMessage = error.response?.data?.errors?.map(err => err.msg).join(', ') || 
                          error.response?.data?.message || 
                          error.message;
      alert(`خطأ في إنشاء المجموعة: ${errorMessage}`);
    }
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      coverImage: group.coverImage || '',
      settings: {
        allowStudentMessages: group.settings?.allowStudentMessages || false,
        isPrivate: group.settings?.isPrivate || false,
        maxStudents: group.settings?.maxStudents || 50
      }
    });
    setImageUpload({
      file: null,
      preview: null,
      uploading: false
    });
    setShowEditModal(true);
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      let coverImageUrl = formData.coverImage;
      
      // If image file is selected, upload it first
      if (imageUpload.file) {
        coverImageUrl = await uploadImageToServer();
        if (!coverImageUrl) {
          alert('فشل في رفع الصورة');
          return;
        }
      }

      const groupData = {
        ...formData,
        coverImage: coverImageUrl
      };

      console.log('Sending group data:', groupData);
      const response = await axiosInstance.put(`/api/groups/admin/groups/${selectedGroup._id}`, groupData);
      
      if (response.data.success) {
        setGroups(groups.map(group => 
          group._id === selectedGroup._id ? response.data.data : group
        ));
        setShowEditModal(false);
        setSelectedGroup(null);
        setFormData({
          name: '',
          description: '',
          coverImage: '',
          settings: {
            allowStudentMessages: false,
            isPrivate: false,
            maxStudents: 50
          }
        });
        setImageUpload({
          file: null,
          preview: null,
          uploading: false
        });
        alert('تم تحديث المجموعة بنجاح');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      alert(`خطأ في تحديث المجموعة: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      try {
        const response = await axiosInstance.delete(`/api/groups/admin/groups/${groupId}`);
        
        if (response.data.success) {
          setGroups(groups.filter(group => group._id !== groupId));
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
              إدارة المجموعات
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg mt-"
              style={{ color: colors.textSecondary }}
            >
              إدارة وتنظيم مجموعات الطلاب
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
              onClick={fetchGroupsData}
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('🔍 Running image system debug...');
                debugImageSystem();
                if (groups.length > 0) {
                  testMultipleGroupImages(groups).then(({ results, summary }) => {
                    console.log('📊 Manual image test results:', { results, summary });
                    alert(`تم اختبار ${summary.total} مجموعة. ${summary.accessible} صورة تعمل، ${summary.usingFallback} تستخدم الصورة البديلة.`);
                  });
                } else {
                  alert('لا توجد مجموعات لاختبارها');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-[#3B82F6]/20"
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: '#3B82F6'
              }}
            >
              <Activity size={18} />
              اختبار الصور
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (groups.length > 0 && groups[0].coverImage) {
                  console.log('🔍 Testing server image access...');
                  const result = await testServerImageAccess(groups[0].coverImage);
                  console.log('📊 Server test result:', result);
                  
                  let message = `اختبار السيرفر:\n`;
                  message += `URL: ${result.imageUrl}\n`;
                  message += `نجح: ${result.success ? 'نعم' : 'لا'}\n`;
                  
                  if (result.results) {
                    message += `HEAD: ${result.results.HEAD?.status || 'خطأ'}\n`;
                    message += `GET: ${result.results.GET?.status || 'خطأ'}`;
                  }
                  
                  alert(message);
                } else {
                  alert('لا توجد صور لاختبارها');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-[#10B981]/20"
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: '#10B981'
              }}
            >
              <Search size={18} />
              اختبار السيرفر
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (groups.length > 0 && groups[0].coverImage) {
                  console.log('🌐 Opening image in browser...');
                  const result = testImageInBrowser(groups[0].coverImage);
                  console.log('📊 Browser test result:', result);
                  
                  if (result.success) {
                    alert(`تم فتح الصورة في تبويب جديد:\n${result.url}`);
                  } else {
                    alert(`فشل في فتح الصورة (قد يكون popup محجوب):\n${result.url}`);
                  }
                } else {
                  alert('لا توجد صور لاختبارها');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-[#8B5CF6]/20"
              style={{
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: '#8B5CF6'
              }}
            >
              <ImageIcon size={18} />
              فتح الصورة
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-[#F97316]/20"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)'
              }}
            >
              <Plus size={18} />
              إنشاء مجموعة
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
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
              <ArrowUpRight size={16} />
              <span className="text-sm font-semibold">+{Math.floor(Math.random() * 10)}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {stats.totalGroups}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            إجمالي المجموعات
          </p>
        </motion.div>

        {/* Total Students */}
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
              <UserPlus size={24} className="text-[#3B82F6]" />
            </div>
            <div className="flex items-center gap-1 text-[#10B981]">
              <ArrowUpRight size={16} />
              <span className="text-sm font-semibold">+{Math.floor(Math.random() * 15)}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {stats.totalStudents}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            إجمالي الطلاب
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
              <ArrowUpRight size={16} />
              <span className="text-sm font-semibold">+{Math.floor(Math.random() * 8)}%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
            {groups.filter(g => g.students.length > 0).length}
          </h3>
          <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            المجموعات النشطة
          </p>
        </motion.div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث في المجموعات..."
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <Filter size={18} />
            فلترة
          </motion.button>
        </div>
      </motion.div>

      {/* Groups Grid */}
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
            className="relative rounded-2xl p-6 border shadow-xl hover:shadow-[#F97316]/20 transition-all duration-300"
            style={{
              background: colors.cardGradient,
              borderColor: colors.border
            }}
          >
            {/* Group Cover */}
            <div className="relative mb-4">
              {group.coverImage ? (
                <img
                  src={getImageUrlSafe(group.coverImage)}
                  alt={group.name}
                  className="w-full h-32 object-cover rounded-xl"
                  onError={(e) => {
                    console.error('❌ Group image failed to load:', {
                      originalSrc: group.coverImage,
                      processedSrc: e.target.src,
                      groupName: group.name
                    });
                    // Show fallback image instead of hiding
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    console.log('✅ Group image loaded successfully:', e.target.src);
                  }}
                />
              ) : null}
              
              {/* Fallback when no image or image fails to load */}
              <div 
                className={`w-full h-32 rounded-xl flex items-center justify-center ${group.coverImage ? 'hidden' : 'flex'}`}
                style={{
                  background: `linear-gradient(135deg, #F97316 0%, #EA580C 100%)`
                }}
              >
                <img
                  src={getFallbackImage('group')}
                  alt="Group placeholder"
                  className="w-16 h-16 opacity-80"
                />
              </div>
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-[#F97316]/90 text-white text-xs font-semibold rounded-lg">
                  {group.students.length} طالب
                </span>
              </div>
            </div>

            {/* Group Info */}
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                {group.name}
              </h3>
              <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                {group.description}
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: colors.textMuted }}>
                <Calendar size={14} />
                <span>أنشئت في {formatDate(group.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowGroupDetails(true);
                  }}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                >
                  <Eye size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEditGroup(group)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                  title="تعديل المجموعة"
                >
                  <Edit size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(`/admin/groups/${group._id}?tab=chat`)}
                  className="p-2 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text
                  }}
                  title="محادثة المجموعة"
                >
                  <MessageSquare size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteGroup(group._id)}
                  className="p-2 rounded-lg transition-all duration-300 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/groups/${group._id}`)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  color: 'white'
                }}
              >
                إدارة
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                إنشاء مجموعة جديدة
              </h2>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    اسم المجموعة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    الوصف
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
                
                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    صورة الغلاف <span className="text-xs text-gray-500">(اختيارية)</span>
                  </label>
                  
                  {/* Image Preview */}
                  {(imageUpload.preview || formData.coverImage) && (
                    <div className="mb-4 relative">
                      <img
                        src={imageUpload.preview || getImageUrl(formData.coverImage)}
                        alt="Group cover preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  )}

                  {/* Show fallback preview when no image */}
                  {!imageUpload.preview && !formData.coverImage && (
                    <div className="mb-4 relative">
                      <div 
                        className="w-full h-32 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, #F97316 0%, #EA580C 100%)`
                        }}
                      >
                        <img
                          src={getFallbackImage('group')}
                          alt="Group placeholder preview"
                          className="w-16 h-16 opacity-80"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs font-semibold rounded-lg">
                          صورة افتراضية
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Options */}
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        رفع صورة من الجهاز
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-[#F97316] hover:bg-[#F97316]/5"
                          style={{
                            borderColor: colors.border,
                            color: colors.text
                          }}
                        >
                          <Upload size={20} />
                          <span>اختر صورة</span>
                        </label>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        أو أدخل رابط الصورة
                      </label>
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => {
                          setFormData({ ...formData, coverImage: e.target.value });
                          if (e.target.value) {
                            setImageUpload({ file: null, preview: null, uploading: false });
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
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
                
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(false)}
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
                    disabled={imageUpload.uploading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    {imageUpload.uploading ? (
                      <>
                        <Activity size={16} className="animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      'إنشاء المجموعة'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && selectedGroup && (
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
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
                تعديل المجموعة
              </h2>
              
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    اسم المجموعة
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    الوصف
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
                
                {/* Cover Image Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    صورة الغلاف <span className="text-xs text-gray-500">(اختيارية)</span>
                  </label>
                  
                  {/* Image Preview */}
                  {(imageUpload.preview || formData.coverImage) && (
                    <div className="mb-4 relative">
                      <img
                        src={imageUpload.preview || getImageUrl(formData.coverImage)}
                        alt="Group cover preview"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  )}

                  {/* Show fallback preview when no image */}
                  {!imageUpload.preview && !formData.coverImage && (
                    <div className="mb-4 relative">
                      <div 
                        className="w-full h-32 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, #F97316 0%, #EA580C 100%)`
                        }}
                      >
                        <img
                          src={getFallbackImage('group')}
                          alt="Group placeholder preview"
                          className="w-16 h-16 opacity-80"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-black/50 text-white text-xs font-semibold rounded-lg">
                          صورة افتراضية
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Options */}
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        رفع صورة من الجهاز
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="edit-image-upload"
                        />
                        <label
                          htmlFor="edit-image-upload"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-[#F97316] hover:bg-[#F97316]/5"
                          style={{
                            borderColor: colors.border,
                            color: colors.text
                          }}
                        >
                          <Upload size={20} />
                          <span>اختر صورة</span>
                        </label>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        أو أدخل رابط الصورة
                      </label>
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => {
                          setFormData({ ...formData, coverImage: e.target.value });
                          if (e.target.value) {
                            setImageUpload({ file: null, preview: null, uploading: false });
                          }
                        }}
                        placeholder="https://example.com/image.jpg"
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
                
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(false)}
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
                    disabled={imageUpload.uploading}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    {imageUpload.uploading ? (
                      <>
                        <Activity size={16} className="animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      'حفظ التعديلات'
                    )}
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

export default GroupsManagement;
