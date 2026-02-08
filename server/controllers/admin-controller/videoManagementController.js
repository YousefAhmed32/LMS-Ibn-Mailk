const Course = require('../../models/Course');
const Notification = require('../../models/Notification');

/**
 * Reorder videos (Drag & Drop)
 * PUT /api/admin/courses/:courseId/videos/reorder
 */
const reorderVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoIds } = req.body; // Array of video IDs in new order

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'videoIds must be a non-empty array'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update order for each video
    videoIds.forEach((videoId, index) => {
      const video = course.videos.find(v => v.id === videoId || String(v._id) === String(videoId));
      if (video) {
        video.order = index;
        video.lastModified = new Date();
      }
    });

    await course.save();

    res.json({
      success: true,
      message: 'Videos reordered successfully',
      data: course.videos
    });
  } catch (error) {
    console.error('Error reordering videos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Schedule video
 * PUT /api/admin/courses/:courseId/videos/:videoId/schedule
 */
const scheduleVideo = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { publishDate, autoPublish, notifyStudents } = req.body;

    if (!publishDate) {
      return res.status(400).json({
        success: false,
        message: 'publishDate is required'
      });
    }

    const publishDateObj = new Date(publishDate);
    if (isNaN(publishDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid publishDate format'
      });
    }

    if (publishDateObj <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'publishDate must be in the future'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const video = course.videos.find(
      v => v.id === videoId || String(v._id) === String(videoId)
    );
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.status = 'scheduled';
    video.publishSettings = {
      publishDate: publishDateObj,
      autoPublish: autoPublish !== undefined ? autoPublish : true,
      notifyStudents: notifyStudents !== undefined ? notifyStudents : true
    };
    video.lastModified = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Video scheduled successfully',
      data: video
    });
  } catch (error) {
    console.error('Error scheduling video:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Change video status
 * PUT /api/admin/courses/:courseId/videos/:videoId/status
 */
const changeVideoStatus = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    const { status } = req.body; // 'visible' | 'hidden' | 'scheduled' | 'draft'

    const validStatuses = ['visible', 'hidden', 'scheduled', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const video = course.videos.find(
      v => v.id === videoId || String(v._id) === String(videoId)
    );
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.status = status;
    if (status === 'visible' && !video.publishedAt) {
      video.publishedAt = new Date();
    }
    if (status === 'draft') {
      video.publishSettings = undefined;
    }
    video.lastModified = new Date();

    await course.save();

    res.json({
      success: true,
      message: `Video status changed to ${status}`,
      data: video
    });
  } catch (error) {
    console.error('Error changing video status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Bulk actions on videos
 * PUT /api/admin/courses/:courseId/videos/bulk-action
 */
const bulkActionVideos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { videoIds, action, scheduleData } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'videoIds must be a non-empty array'
      });
    }

    const validActions = ['show', 'hide', 'schedule', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Action must be one of: ${validActions.join(', ')}`
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let updatedCount = 0;
    const now = new Date();

    videoIds.forEach(videoId => {
      const video = course.videos.find(
        v => v.id === videoId || String(v._id) === String(videoId)
      );
      if (!video) return;

      switch (action) {
        case 'show':
          video.status = 'visible';
          if (!video.publishedAt) {
            video.publishedAt = now;
          }
          updatedCount++;
          break;
        case 'hide':
          video.status = 'hidden';
          updatedCount++;
          break;
        case 'schedule':
          if (scheduleData && scheduleData.publishDate) {
            video.status = 'scheduled';
            video.publishSettings = {
              publishDate: new Date(scheduleData.publishDate),
              autoPublish: scheduleData.autoPublish !== undefined ? scheduleData.autoPublish : true,
              notifyStudents: scheduleData.notifyStudents !== undefined ? scheduleData.notifyStudents : true
            };
            updatedCount++;
          }
          break;
        case 'delete':
          course.videos = course.videos.filter(
            v => v.id !== videoId && String(v._id) !== String(videoId)
          );
          updatedCount++;
          break;
      }

      if (video && action !== 'delete') {
        video.lastModified = now;
      }
    });

    await course.save();

    res.json({
      success: true,
      message: `Bulk action '${action}' applied to ${updatedCount} video(s)`,
      data: {
        updatedCount,
        videos: course.videos
      }
    });
  } catch (error) {
    console.error('Error in bulk action:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Publish scheduled video immediately
 * POST /api/admin/courses/:courseId/videos/:videoId/publish-now
 */
const publishVideoNow = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId).populate('enrolledStudents', '_id firstName secondName thirdName fourthName');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const video = course.videos.find(
      v => v.id === videoId || String(v._id) === String(videoId)
    );
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Video is not scheduled'
      });
    }

    video.status = 'visible';
    video.publishedAt = new Date();
    video.lastModified = new Date();

    await course.save();

    // Send notifications if enabled
    if (video.publishSettings?.notifyStudents && course.enrolledStudents.length > 0) {
      await sendVideoPublishedNotifications(course, video);
    }

    res.json({
      success: true,
      message: 'Video published successfully',
      data: video
    });
  } catch (error) {
    console.error('Error publishing video:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Cancel schedule
 * DELETE /api/admin/courses/:courseId/videos/:videoId/schedule
 */
const cancelSchedule = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const video = course.videos.find(
      v => v.id === videoId || String(v._id) === String(videoId)
    );
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video.status = 'draft';
    video.publishSettings = undefined;
    video.lastModified = new Date();

    await course.save();

    res.json({
      success: true,
      message: 'Schedule cancelled',
      data: video
    });
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Helper: Send video published notifications
 */
async function sendVideoPublishedNotifications(course, video) {
  try {
    if (!course.enrolledStudents || course.enrolledStudents.length === 0) {
      return;
    }

    const notifications = course.enrolledStudents.map(student => ({
      userId: student._id,
      type: 'video_published',
      title: '🎥 فيديو جديد متاح',
      message: `تم نشر فيديو جديد "${video.title}" في كورس "${course.title}"`,
      data: {
        courseId: course._id,
        courseName: course.title,
        videoId: video.id || video._id,
        videoTitle: video.title
      },
      actionUrl: `/courses/${course._id}/content`,
      priority: 'medium',
      read: false,
      createdAt: new Date()
    }));

    await Notification.insertMany(notifications);

    console.log(`📧 Sent ${notifications.length} notifications for video: "${video.title}"`);

    // Real-time notifications via Socket.io (if available)
    try {
      const { getIO } = require('../../socket');
      const io = getIO();
      if (io) {
        course.enrolledStudents.forEach(student => {
          io.to(student._id.toString()).emit('new_notification', {
            type: 'video_published',
            title: '🎥 فيديو جديد',
            message: `"${video.title}" متاح الآن في كورس "${course.title}"`,
            courseId: course._id
          });
        });
      }
    } catch (socketError) {
      console.log('Socket.io not available, skipping real-time notifications');
    }
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  }
}

module.exports = {
  reorderVideos,
  scheduleVideo,
  changeVideoStatus,
  bulkActionVideos,
  publishVideoNow,
  cancelSchedule
};
