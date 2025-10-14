const mongoose = require('mongoose');

// User Course Progress Schema
const UserCourseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  // Track completed videos by their IDs
  completedVideos: [{
    videoId: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    watchPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  }],
  // Track completed exams by their IDs
  completedExams: [{
    examId: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean,
      default: false
    }
  }],
  // Overall course progress
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Last activity timestamp
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  // Course enrollment date
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  // Course completion date
  completedAt: {
    type: Date,
    default: null
  },
  // Whether the course is fully completed
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
UserCourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Pre-save middleware to calculate overall progress
UserCourseProgressSchema.pre('save', async function(next) {
  try {
    // Remove duplicate videos and exams before calculating progress
    const uniqueVideos = [];
    const seenVideoIds = new Set();
    
    for (const video of this.completedVideos) {
      if (!seenVideoIds.has(video.videoId)) {
        seenVideoIds.add(video.videoId);
        uniqueVideos.push(video);
      }
    }
    
    const uniqueExams = [];
    const seenExamIds = new Set();
    
    for (const exam of this.completedExams) {
      if (!seenExamIds.has(exam.examId)) {
        seenExamIds.add(exam.examId);
        uniqueExams.push(exam);
      }
    }
    
    // Update arrays if duplicates were found
    if (uniqueVideos.length !== this.completedVideos.length || 
        uniqueExams.length !== this.completedExams.length) {
      this.completedVideos = uniqueVideos;
      this.completedExams = uniqueExams;
    }

    // Get course to count total videos and exams
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.courseId);
    
    if (course) {
      const totalVideos = course.videos?.length || 0;
      const totalExams = course.exams?.length || 0;
      const totalItems = totalVideos + totalExams;
      
      if (totalItems > 0) {
        const completedItems = this.completedVideos.length + this.completedExams.length;
        
        // Calculate progress percentage and ensure it doesn't exceed 100%
        const calculatedProgress = Math.round((completedItems / totalItems) * 100);
        this.overallProgress = Math.min(calculatedProgress, 100);
        
        // Mark as completed if all items are done
        if (completedItems === totalItems && !this.isCompleted) {
          this.isCompleted = true;
          this.completedAt = new Date();
        }
      } else {
        // If no items in course, progress should be 0
        this.overallProgress = 0;
      }
    }
    
    // Update last activity
    this.lastActivityAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get or create user progress
UserCourseProgressSchema.statics.getOrCreateProgress = async function(userId, courseId) {
  let progress = await this.findOne({ userId, courseId });
  
  if (!progress) {
    progress = new this({ userId, courseId });
    await progress.save();
  }
  
  return progress;
};

// Static method to mark video as completed
UserCourseProgressSchema.statics.markVideoCompleted = async function(userId, courseId, videoId, watchPercentage = 100) {
  const progress = await this.getOrCreateProgress(userId, courseId);
  
  // Check if video is already completed
  const existingVideoIndex = progress.completedVideos.findIndex(v => v.videoId === videoId);
  
  if (existingVideoIndex === -1) {
    // Add new video completion
    progress.completedVideos.push({
      videoId,
      completedAt: new Date(),
      watchPercentage
    });
  } else {
    // Update existing video completion
    progress.completedVideos[existingVideoIndex].watchPercentage = watchPercentage;
    progress.completedVideos[existingVideoIndex].completedAt = new Date();
  }
  
  await progress.save();
  return progress;
};

// Static method to mark exam as completed
UserCourseProgressSchema.statics.markExamCompleted = async function(userId, courseId, examId, score = 0, passed = false) {
  const progress = await this.getOrCreateProgress(userId, courseId);
  
  // Check if exam is already completed
  const existingExamIndex = progress.completedExams.findIndex(e => e.examId === examId);
  
  if (existingExamIndex === -1) {
    // Add new exam completion
    progress.completedExams.push({
      examId,
      completedAt: new Date(),
      score,
      passed
    });
  } else {
    // Update existing exam completion
    progress.completedExams[existingExamIndex].score = score;
    progress.completedExams[existingExamIndex].passed = passed;
    progress.completedExams[existingExamIndex].completedAt = new Date();
  }
  
  await progress.save();
  return progress;
};

// Static method to get course progress summary
UserCourseProgressSchema.statics.getCourseProgress = async function(userId, courseId) {
  const progress = await this.getOrCreateProgress(userId, courseId);
  
  // Clean up duplicates before calculating progress
  await this.cleanupProgress(userId, courseId);
  
  // Get course details
  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  const totalVideos = course.videos?.length || 0;
  const totalExams = course.exams?.length || 0;
  const totalItems = totalVideos + totalExams;
  
  const completedVideos = progress.completedVideos.length;
  const completedExams = progress.completedExams.length;
  const completedItems = completedVideos + completedExams;
  
  // Calculate progress percentage and ensure it doesn't exceed 100%
  const calculatedProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const progressPercentage = Math.min(calculatedProgress, 100);
  
  return {
    userId,
    courseId,
    totalVideos,
    totalExams,
    totalItems,
    completedVideos,
    completedExams,
    completedItems,
    progressPercentage,
    isCompleted: progress.isCompleted,
    enrolledAt: progress.enrolledAt,
    completedAt: progress.completedAt,
    lastActivityAt: progress.lastActivityAt,
    videoProgress: progress.completedVideos,
    examProgress: progress.completedExams
  };
};

// Static method to check if specific video is completed
UserCourseProgressSchema.statics.isVideoCompleted = async function(userId, courseId, videoId) {
  const progress = await this.findOne({ userId, courseId });
  if (!progress) return false;
  
  return progress.completedVideos.some(v => v.videoId === videoId);
};

// Static method to check if specific exam is completed
UserCourseProgressSchema.statics.isExamCompleted = async function(userId, courseId, examId) {
  const progress = await this.findOne({ userId, courseId });
  if (!progress) return false;
  
  return progress.completedExams.some(e => e.examId === examId);
};

// Static method to get user's progress across all courses
UserCourseProgressSchema.statics.getUserProgressSummary = async function(userId) {
  const progressEntries = await this.find({ userId }).populate('courseId', 'title subject grade');
  
  const summary = {
    totalCourses: progressEntries.length,
    completedCourses: progressEntries.filter(p => p.isCompleted).length,
    inProgressCourses: progressEntries.filter(p => !p.isCompleted && p.overallProgress > 0).length,
    notStartedCourses: progressEntries.filter(p => p.overallProgress === 0).length,
    averageProgress: 0,
    courses: progressEntries.map(p => ({
      courseId: p.courseId._id,
      courseTitle: p.courseId.title,
      subject: p.courseId.subject,
      grade: p.courseId.grade,
      progress: p.overallProgress,
      isCompleted: p.isCompleted,
      lastActivityAt: p.lastActivityAt
    }))
  };
  
  // Calculate average progress
  if (summary.totalCourses > 0) {
    const totalProgress = progressEntries.reduce((sum, p) => sum + p.overallProgress, 0);
    summary.averageProgress = Math.round(totalProgress / summary.totalCourses);
  }
  
  return summary;
};

// Static method to clean up duplicate entries and fix progress calculation
UserCourseProgressSchema.statics.cleanupProgress = async function(userId, courseId) {
  const progress = await this.findOne({ userId, courseId });
  
  if (!progress) {
    return null;
  }
  
  // Remove duplicate videos
  const uniqueVideos = [];
  const seenVideoIds = new Set();
  
  for (const video of progress.completedVideos) {
    if (!seenVideoIds.has(video.videoId)) {
      seenVideoIds.add(video.videoId);
      uniqueVideos.push(video);
    }
  }
  
  // Remove duplicate exams
  const uniqueExams = [];
  const seenExamIds = new Set();
  
  for (const exam of progress.completedExams) {
    if (!seenExamIds.has(exam.examId)) {
      seenExamIds.add(exam.examId);
      uniqueExams.push(exam);
    }
  }
  
  // Update arrays if duplicates were found
  if (uniqueVideos.length !== progress.completedVideos.length || 
      uniqueExams.length !== progress.completedExams.length) {
    progress.completedVideos = uniqueVideos;
    progress.completedExams = uniqueExams;
    await progress.save();
  }
  
  return progress;
};

module.exports = mongoose.model('UserCourseProgress', UserCourseProgressSchema);
