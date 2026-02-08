import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  Video,
  Plus,
  Search,
  Eye,
  EyeOff,
  Calendar,
  Trash2,
  Filter
} from 'lucide-react';
import SortableVideoCard from './SortableVideoCard';
import VideoFormModal from './VideoFormModal';
import VideoScheduleModal from './VideoScheduleModal';
import LuxuryButton from '../ui/LuxuryButton';
import LuxuryCard from '../ui/LuxuryCard';
import { extractYouTubeVideoId } from '../../utils/videoUtils';

const VideoManagementSection = ({ videos, onVideosChange, colors, courseId = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showVideoFormModal, setShowVideoFormModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [schedulingVideo, setSchedulingVideo] = useState(null);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = filteredVideos.findIndex(v => (v.id || v._id) === active.id);
      const newIndex = filteredVideos.findIndex(v => (v.id || v._id) === over.id);

      const reorderedVideos = arrayMove(filteredVideos, oldIndex, newIndex).map((v, index) => ({
        ...v,
        order: index
      }));

      // Update remaining videos with their original order
      const updatedVideos = videos.map(video => {
        const foundIndex = reorderedVideos.findIndex(rv => (rv.id || rv._id) === (video.id || video._id));
        if (foundIndex !== -1) {
          return reorderedVideos[foundIndex];
        }
        return video;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      onVideosChange(updatedVideos);
    }
  };

  // Add new video
  const handleAddVideo = (videoData) => {
    const videoId = extractYouTubeVideoId(videoData.url);
    const newVideo = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: videoData.title,
      url: videoData.url,
      duration: parseInt(videoData.duration) || 0,
      videoId: videoId,
      provider: 'youtube',
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
      status: videoData.status || 'visible', // ✅ احفظ الحالة كما هي
      order: videos.length,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // ✅ فقط إذا كان visible، حدد publishedAt
    if (newVideo.status === 'visible') {
      newVideo.publishedAt = new Date().toISOString();
    }

    // ✅ إذا مجدول، احفظ publishSettings
    if (newVideo.status === 'scheduled' && videoData.publishSettings) {
      newVideo.publishSettings = videoData.publishSettings;
    } else {
      newVideo.publishSettings = {
        autoPublish: true,
        notifyStudents: true
      };
    }

    onVideosChange([...videos, newVideo]);
    setShowVideoFormModal(false);
    
    console.log('✅ Video added with status:', newVideo.status);
  };

  // Update video
  const handleUpdateVideo = (videoData) => {
    const videoId = extractYouTubeVideoId(videoData.url);
    const updatedVideos = videos.map(v => {
      if ((v.id || v._id) === (editingVideo.id || editingVideo._id)) {
        const updated = {
          ...v,
          title: videoData.title,
          url: videoData.url,
          duration: parseInt(videoData.duration) || 0,
          videoId: videoId,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : v.thumbnail,
          status: videoData.status, // ✅ احفظ الحالة كما هي
          lastModified: new Date().toISOString()
        };

        // ✅ إذا تحول لـ visible ولم يكن منشوراً من قبل
        if (videoData.status === 'visible' && !v.publishedAt) {
          updated.publishedAt = new Date().toISOString();
        }

        // ✅ إذا مجدول، احفظ الإعدادات
        if (videoData.status === 'scheduled' && videoData.publishSettings) {
          updated.publishSettings = videoData.publishSettings;
        } else if (videoData.status !== 'scheduled') {
          // ✅ إذا ليس مجدول، احذف publishSettings أو اتركه كما هو
          // لا نحذفه تماماً، فقط لا نضيف publishDate
          if (updated.publishSettings) {
            updated.publishSettings = {
              autoPublish: updated.publishSettings.autoPublish || true,
              notifyStudents: updated.publishSettings.notifyStudents || true
            };
          }
        }

        return updated;
      }
      return v;
    });

    onVideosChange(updatedVideos);
    setEditingVideo(null);
    setShowVideoFormModal(false);
    
    console.log('✅ Video updated with status:', videoData.status);
  };

  // Delete video
  const handleDeleteVideo = (videoId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      onVideosChange(videos.filter(v => (v.id || v._id) !== videoId));
    }
  };

  // Change video status
  const handleChangeStatus = (videoId, newStatus) => {
    const updatedVideos = videos.map(v => {
      if ((v.id || v._id) === videoId) {
        const updated = { ...v, status: newStatus, lastModified: new Date().toISOString() };
        if (newStatus === 'visible' && !v.publishedAt) {
          updated.publishedAt = new Date().toISOString();
        }
        return updated;
      }
      return v;
    });

    onVideosChange(updatedVideos);
  };

  // Open schedule modal
  const handleOpenSchedule = (video) => {
    setSchedulingVideo(video);
    setShowScheduleModal(true);
  };

  // Save schedule
  const handleSaveSchedule = (videoData) => {
    // VideoScheduleModal يرسل كائن video كامل مع publishSettings
    const scheduleData = videoData.publishSettings || videoData;
    
    console.log('💾 Saving schedule data:', {
      videoData,
      scheduleData,
      publishDate: scheduleData.publishDate,
      publishDateType: typeof scheduleData.publishDate
    });
    
    const updatedVideos = videos.map(v =>
      (v.id || v._id) === (schedulingVideo.id || schedulingVideo._id)
        ? {
            ...v,
            status: 'scheduled',
            publishSettings: {
              publishDate: scheduleData.publishDate || null,
              autoPublish: scheduleData.autoPublish !== undefined ? scheduleData.autoPublish : true,
              notifyStudents: scheduleData.notifyStudents !== undefined ? scheduleData.notifyStudents : true
            },
            lastModified: new Date().toISOString()
          }
        : v
    );

    const updatedVideo = updatedVideos.find(v => (v.id || v._id) === (schedulingVideo.id || schedulingVideo._id));
    console.log('✅ Updated video:', {
      id: updatedVideo.id,
      status: updatedVideo.status,
      publishSettings: updatedVideo.publishSettings,
      publishDate: updatedVideo.publishSettings?.publishDate,
      publishDateType: typeof updatedVideo.publishSettings?.publishDate
    });

    onVideosChange(updatedVideos);
    setShowScheduleModal(false);
    setSchedulingVideo(null);
  };

  // Publish now (for scheduled videos)
  const handlePublishNow = (videoId) => {
    if (window.confirm('هل تريد نشر هذا الفيديو الآن؟')) {
      handleChangeStatus(videoId, 'visible');
    }
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selectedVideos.length === 0) return;

    switch (action) {
      case 'show':
        const showVideos = videos.map(v =>
          selectedVideos.includes(v.id || v._id)
            ? { ...v, status: 'visible', publishedAt: v.publishedAt || new Date().toISOString() }
            : v
        );
        onVideosChange(showVideos);
        break;

      case 'hide':
        const hideVideos = videos.map(v =>
          selectedVideos.includes(v.id || v._id) ? { ...v, status: 'hidden' } : v
        );
        onVideosChange(hideVideos);
        break;

      case 'delete':
        if (window.confirm(`هل تريد حذف ${selectedVideos.length} فيديو؟`)) {
          onVideosChange(videos.filter(v => !selectedVideos.includes(v.id || v._id)));
        }
        break;
    }

    setSelectedVideos([]);
  };

  // Toggle select video
  const toggleSelectVideo = (videoId) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedVideos.length === filteredVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(filteredVideos.map(v => v.id || v._id));
    }
  };

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <LuxuryCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Video size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: colors?.text || '#1f2937' }}>
            فيديوهات الدورة
          </h2>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20" style={{ color: colors?.accent || '#06b6d4' }}>
            {videos.length}
          </span>
        </div>

        <LuxuryButton
          onClick={() => {
            setEditingVideo(null);
            setShowVideoFormModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus size={18} />
          إضافة فيديو
        </LuxuryButton>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث عن فيديو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-cyan-500 dark:focus:border-cyan-400 bg-white dark:bg-gray-800 transition-colors"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-cyan-500 bg-white dark:bg-gray-800"
          >
            <option value="all">الكل ({videos.length})</option>
            <option value="visible">مرئي ({videos.filter(v => v.status === 'visible').length})</option>
            <option value="scheduled">مجدول ({videos.filter(v => v.status === 'scheduled').length})</option>
            <option value="hidden">مخفي ({videos.filter(v => v.status === 'hidden').length})</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedVideos.length > 0 && (
          <div className="flex items-center gap-2">
            <LuxuryButton
              onClick={() => handleBulkAction('show')}
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <Eye size={14} className="ml-1" />
              إظهار ({selectedVideos.length})
            </LuxuryButton>
            <LuxuryButton
              onClick={() => handleBulkAction('hide')}
              size="sm"
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
            >
              <EyeOff size={14} className="ml-1" />
              إخفاء
            </LuxuryButton>
            <LuxuryButton
              onClick={() => handleBulkAction('delete')}
              size="sm"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 size={14} className="ml-1" />
              حذف
            </LuxuryButton>
          </div>
        )}
      </div>

      {/* Select All */}
      {filteredVideos.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-2 border-cyan-500 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="font-medium text-sm">
              تحديد الكل ({selectedVideos.length}/{filteredVideos.length})
            </span>
          </label>
        </div>
      )}

      {/* Videos List */}
      <div className="space-y-3">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Video size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors?.textMuted || '#6b7280' }} />
            <p className="text-lg font-medium mb-2" style={{ color: colors?.text || '#1f2937' }}>
              {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد فيديوهات'}
            </p>
            <p className="text-sm mb-4" style={{ color: colors?.textMuted || '#6b7280' }}>
              {searchQuery || filterStatus !== 'all'
                ? 'جرب تغيير البحث أو الفلتر'
                : 'ابدأ بإضافة أول فيديو للدورة'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <LuxuryButton
                onClick={() => setShowVideoFormModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl"
              >
                <Plus size={16} className="inline ml-2" />
                إضافة أول فيديو
              </LuxuryButton>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredVideos.map(v => v.id || v._id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredVideos.map((video) => (
                <SortableVideoCard
                  key={video.id || video._id}
                  video={video}
                  isSelected={selectedVideos.includes(video.id || video._id)}
                  onToggleSelect={toggleSelectVideo}
                  onEdit={() => {
                    setEditingVideo(video);
                    setShowVideoFormModal(true);
                  }}
                  onDelete={handleDeleteVideo}
                  onChangeStatus={handleChangeStatus}
                  onSchedule={handleOpenSchedule}
                  onPublishNow={handlePublishNow}
                  colors={colors}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <VideoFormModal
        isOpen={showVideoFormModal}
        onClose={() => {
          setShowVideoFormModal(false);
          setEditingVideo(null);
        }}
        onSave={editingVideo ? handleUpdateVideo : handleAddVideo}
        video={editingVideo}
        colors={colors}
      />

      <VideoScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSchedulingVideo(null);
        }}
        onSave={handleSaveSchedule}
        video={schedulingVideo}
        colors={colors}
      />
    </LuxuryCard>
  );
};

export default VideoManagementSection;
