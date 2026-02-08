const cron = require('node-cron');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

let io = null;

/**
 * Initialize Socket.io instance
 */
function setIO(socketIO) {
  io = socketIO;
}

/**
 * Get Socket.io instance
 */
function getIO() {
  return io;
}

/**
 * Send video published notifications
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

    // Real-time notifications via Socket.io
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
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  }
}

/**
 * Video Publisher Cron Job
 * Runs every minute to check for scheduled videos that need to be published
 */
function startVideoPublisher() {
  // Run every minute: * * * * *
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      console.log(`🔍 [${now.toISOString()}] Checking for scheduled videos...`);

      // Find courses with scheduled videos that are ready to publish
      const courses = await Course.find({
        'videos': {
          $elemMatch: {
            status: 'scheduled',
            'publishSettings.publishDate': { $lte: now },
            'publishSettings.autoPublish': true,
            $or: [
              { publishedAt: { $exists: false } },
              { publishedAt: null }
            ]
          }
        }
      }).populate('enrolledStudents', '_id firstName secondName thirdName fourthName');

      let publishedCount = 0;

      for (const course of courses) {
        for (const video of course.videos) {
          // Check if video should be published
          if (
            video.status === 'scheduled' &&
            video.publishSettings?.autoPublish &&
            video.publishSettings?.publishDate &&
            new Date(video.publishSettings.publishDate) <= now &&
            !video.publishedAt
          ) {
            // ✅ Publish the video
            video.status = 'visible';
            video.publishedAt = now;
            video.lastModified = now;

            await course.save();

            publishedCount++;
            console.log(`✅ Published video: "${video.title}" in course: "${course.title}"`);

            // 🔔 Send notifications if enabled
            if (video.publishSettings.notifyStudents && course.enrolledStudents.length > 0) {
              await sendVideoPublishedNotifications(course, video);
            }
          }
        }
      }

      if (publishedCount > 0) {
        console.log(`✨ Total videos published: ${publishedCount}`);
      }
    } catch (error) {
      console.error('❌ Error in video publisher cron:', error);
    }
  });

  console.log('✅ Video publisher cron job started (runs every minute)');
}

module.exports = {
  startVideoPublisher,
  setIO,
  getIO
};
