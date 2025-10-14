/**
 * Migration Script: Convert Legacy Video Data to YouTube Embed Format
 * 
 * This script migrates existing course video data to the new YouTube embedding format.
 * It processes videos that have URL fields and converts them to the new sanitized format.
 */

const mongoose = require('mongoose');
const Course = require('../models/Course');
const { sanitizeVideoInput, extractVideoId } = require('../utils/youtubeUtils');
require('dotenv').config();

// Migration statistics
let stats = {
  totalCourses: 0,
  coursesWithVideos: 0,
  totalVideos: 0,
  migratedVideos: 0,
  skippedVideos: 0,
  errors: []
};

/**
 * Check if a video is already in the new format
 */
function isNewFormat(video) {
  return video.provider && video.videoId && video.embedSrc;
}

/**
 * Check if a video has a valid YouTube URL
 */
function hasYouTubeUrl(video) {
  return video.url && extractVideoId(video.url);
}

/**
 * Migrate a single video to the new format
 */
function migrateVideo(video) {
  try {
    // Skip if already in new format
    if (isNewFormat(video)) {
      return { ...video, _migrated: false, _reason: 'Already in new format' };
    }

    // Skip if no URL or not a YouTube URL
    if (!hasYouTubeUrl(video)) {
      return { ...video, _migrated: false, _reason: 'No valid YouTube URL' };
    }

    // Extract video ID from existing URL
    const videoId = extractVideoId(video.url);
    if (!videoId) {
      return { ...video, _migrated: false, _reason: 'Could not extract video ID' };
    }

    // Create sanitized video object
    const sanitizedVideo = {
      // Preserve existing fields
      title: video.title || `Video ${videoId}`,
      order: video.order || 0,
      duration: video.duration,
      thumbnail: video.thumbnail,
      quiz: video.quiz,
      
      // Add new YouTube fields
      provider: 'youtube',
      videoId: videoId,
      embedSrc: `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`,
      width: '100%',
      height: '560',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      rawInputType: 'url',
      sanitizedAt: new Date(),
      enableJsApi: false,
      
      // Keep original URL for reference
      url: video.url,
      
      // Migration metadata
      _migrated: true,
      _migratedAt: new Date(),
      _originalFormat: 'legacy'
    };

    return sanitizedVideo;
  } catch (error) {
    console.error(`Error migrating video:`, error.message);
    return { 
      ...video, 
      _migrated: false, 
      _reason: `Migration error: ${error.message}`,
      _error: error.message
    };
  }
}

/**
 * Migrate all videos in a course
 */
function migrateCourseVideos(course) {
  if (!course.videos || course.videos.length === 0) {
    return course;
  }

  const migratedVideos = course.videos.map(video => {
    const migrated = migrateVideo(video);
    
    if (migrated._migrated) {
      stats.migratedVideos++;
    } else {
      stats.skippedVideos++;
      console.log(`Skipped video in course "${course.title}": ${migrated._reason}`);
    }
    
    return migrated;
  });

  return {
    ...course,
    videos: migratedVideos,
    _migrationApplied: true,
    _migratedAt: new Date()
  };
}

/**
 * Main migration function
 */
async function migrateVideoData() {
  try {
    console.log('🚀 Starting video data migration...');
    console.log('=====================================');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all courses
    const courses = await Course.find({});
    stats.totalCourses = courses.length;
    console.log(`📊 Found ${stats.totalCourses} courses`);

    // Process each course
    for (const course of courses) {
      if (course.videos && course.videos.length > 0) {
        stats.coursesWithVideos++;
        stats.totalVideos += course.videos.length;
        
        console.log(`\n📚 Processing course: "${course.title}" (${course.videos.length} videos)`);
        
        try {
          const migratedCourse = migrateCourseVideos(course);
          
          // Save the migrated course
          await Course.findByIdAndUpdate(
            course._id,
            { 
              videos: migratedCourse.videos,
              _migrationApplied: true,
              _migratedAt: new Date()
            },
            { new: true }
          );
          
          console.log(`✅ Successfully migrated course: "${course.title}"`);
        } catch (error) {
          const errorMsg = `Failed to migrate course "${course.title}": ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          stats.errors.push(errorMsg);
        }
      }
    }

    // Print migration summary
    console.log('\n=====================================');
    console.log('📊 Migration Summary:');
    console.log(`Total Courses: ${stats.totalCourses}`);
    console.log(`Courses with Videos: ${stats.coursesWithVideos}`);
    console.log(`Total Videos: ${stats.totalVideos}`);
    console.log(`Migrated Videos: ${stats.migratedVideos}`);
    console.log(`Skipped Videos: ${stats.skippedVideos}`);
    console.log(`Errors: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Rollback function to remove migration metadata
 */
async function rollbackMigration() {
  try {
    console.log('🔄 Starting migration rollback...');
    
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Remove migration metadata from all courses
    const result = await Course.updateMany(
      { _migrationApplied: true },
      { 
        $unset: { 
          _migrationApplied: 1,
          _migratedAt: 1
        }
      }
    );

    console.log(`✅ Rollback completed. Updated ${result.modifiedCount} courses.`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackMigration();
  } else {
    migrateVideoData();
  }
}

module.exports = {
  migrateVideoData,
  rollbackMigration,
  migrateVideo,
  migrateCourseVideos
};
