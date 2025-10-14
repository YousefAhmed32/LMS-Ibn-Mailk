const mongoose = require('mongoose');

const progressHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true
  },
  percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  currentTime: {
    type: Number,
    required: true,
    min: 0
  },
  event: {
    type: String,
    enum: ['progress', 'completed', 'paused', 'resumed'],
    default: 'progress'
  }
}, { _id: false });

const videoProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  currentTime: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  percent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  progressHistory: {
    type: [progressHistorySchema],
    default: []
  },
  // Metadata for analytics
  totalWatchTime: {
    type: Number,
    default: 0 // in seconds
  },
  watchSessions: {
    type: Number,
    default: 0
  },
  lastSessionDuration: {
    type: Number,
    default: 0 // in seconds
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
videoProgressSchema.index({ studentId: 1, courseId: 1, videoId: 1 }, { unique: true });
videoProgressSchema.index({ studentId: 1, courseId: 1 });
videoProgressSchema.index({ lastWatchedAt: -1 });

// Virtual for completion status
videoProgressSchema.virtual('isCompleted').get(function() {
  return this.completed || this.percent >= 70;
});

// Method to add progress entry
videoProgressSchema.methods.addProgressEntry = function(percent, currentTime, event = 'progress') {
  this.progressHistory.push({
    timestamp: Date.now(),
    percent,
    currentTime,
    event
  });
  
  // Keep only last 50 entries
  if (this.progressHistory.length > 50) {
    this.progressHistory = this.progressHistory.slice(-50);
  }
  
  // Update completion status
  if (percent >= 70 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  this.percent = percent;
  this.currentTime = currentTime;
  this.lastWatchedAt = new Date();
};

// Method to get progress statistics
videoProgressSchema.methods.getProgressStats = function() {
  const history = this.progressHistory;
  if (history.length === 0) {
    return {
      totalSessions: 0,
      averageProgress: 0,
      maxProgress: 0,
      completionTime: null
    };
  }
  
  const totalSessions = history.length;
  const averageProgress = history.reduce((sum, entry) => sum + entry.percent, 0) / totalSessions;
  const maxProgress = Math.max(...history.map(entry => entry.percent));
  const completionEntry = history.find(entry => entry.event === 'completed');
  
  return {
    totalSessions,
    averageProgress: Math.round(averageProgress * 100) / 100,
    maxProgress,
    completionTime: completionEntry ? new Date(completionEntry.timestamp) : null
  };
};

// Static method to get course progress summary
videoProgressSchema.statics.getCourseProgress = async function(studentId, courseId) {
  const progressEntries = await this.find({ studentId, courseId });
  
  const totalVideos = progressEntries.length;
  const completedVideos = progressEntries.filter(p => p.completed).length;
  const percentComplete = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  
  return {
    totalVideos,
    completedVideos,
    percentComplete: Math.round(percentComplete * 100) / 100,
    videos: progressEntries.map(entry => ({
      videoId: entry.videoId,
      percent: entry.percent,
      completed: entry.completed,
      lastWatchedAt: entry.lastWatchedAt
    }))
  };
};

module.exports = mongoose.model('VideoProgress', videoProgressSchema);
