const mongoose = require("mongoose");

// Gamification Schema
const GamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    unique: true
  },
  
  // XP System
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Streak System
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  // Badges System
  badges: [{
    badgeId: {
      type: String,
      required: true
    },
    badgeName: {
      type: String,
      required: true
    },
    badgeDescription: {
      type: String,
      required: true
    },
    badgeIcon: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['learning', 'streak', 'achievement', 'special'],
      default: 'achievement'
    }
  }],
  
  // Activity Tracking
  activities: [{
    type: {
      type: String,
      enum: ['video_watched', 'exam_completed', 'course_completed', 'daily_login', 'streak_milestone'],
      required: true
    },
    xpEarned: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    },
    examId: String,
    videoId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  stats: {
    videosWatched: {
      type: Number,
      default: 0
    },
    examsCompleted: {
      type: Number,
      default: 0
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    averageExamScore: {
      type: Number,
      default: 0
    }
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
GamificationSchema.index({ userId: 1 });
GamificationSchema.index({ totalXP: -1 });
GamificationSchema.index({ currentStreak: -1 });

// Pre-save middleware to calculate level and XP requirements
GamificationSchema.pre('save', function(next) {
  // Calculate level based on total XP
  // Level formula: level = floor(sqrt(totalXP / 100)) + 1
  this.currentLevel = Math.floor(Math.sqrt(this.totalXP / 100)) + 1;
  
  // Calculate XP needed for next level
  const nextLevelXP = Math.pow(this.currentLevel, 2) * 100;
  this.xpToNextLevel = nextLevelXP - this.totalXP;
  
  // Update longest streak if current streak is higher
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  next();
});

// Method to add XP and activity
GamificationSchema.methods.addXP = function(activityType, xpAmount, description, metadata = {}) {
  this.totalXP += xpAmount;
  
  // Add activity record
  this.activities.push({
    type: activityType,
    xpEarned: xpAmount,
    description: description,
    courseId: metadata.courseId,
    examId: metadata.examId,
    videoId: metadata.videoId,
    timestamp: new Date()
  });
  
  // Update stats based on activity type
  switch (activityType) {
    case 'video_watched':
      this.stats.videosWatched += 1;
      this.stats.totalStudyTime += metadata.duration || 0;
      break;
    case 'exam_completed':
      this.stats.examsCompleted += 1;
      if (metadata.score !== undefined) {
        // Update average exam score
        const totalScore = this.stats.averageExamScore * (this.stats.examsCompleted - 1) + metadata.score;
        this.stats.averageExamScore = Math.round(totalScore / this.stats.examsCompleted);
      }
      break;
    case 'course_completed':
      this.stats.coursesCompleted += 1;
      break;
  }
  
  return this.save();
};

// Method to update streak
GamificationSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.lastActivityDate);
  
  // Check if last activity was yesterday (maintain streak) or today (already counted)
  const daysDifference = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 1) {
    // Consecutive day - increment streak
    this.currentStreak += 1;
    this.lastActivityDate = today;
    
    // Check for streak milestones
    if (this.currentStreak % 7 === 0) {
      this.addXP('streak_milestone', 50, `${this.currentStreak} يوم متتالي!`, {});
    }
  } else if (daysDifference > 1) {
    // Streak broken - reset
    this.currentStreak = 1;
    this.lastActivityDate = today;
  }
  // If daysDifference === 0, it's the same day, don't update
  
  return this.save();
};

// Method to check and award badges
GamificationSchema.methods.checkBadges = function() {
  const badgesToAward = [];
  
  // Learning badges
  if (this.stats.videosWatched >= 10 && !this.hasBadge('first_10_videos')) {
    badgesToAward.push({
      badgeId: 'first_10_videos',
      badgeName: 'متعلم مبتدئ',
      badgeDescription: 'شاهد 10 فيديوهات',
      badgeIcon: '🎬',
      category: 'learning'
    });
  }
  
  if (this.stats.videosWatched >= 50 && !this.hasBadge('video_master')) {
    badgesToAward.push({
      badgeId: 'video_master',
      badgeName: 'سيد الفيديوهات',
      badgeDescription: 'شاهد 50 فيديو',
      badgeIcon: '🎥',
      category: 'learning'
    });
  }
  
  // Exam badges
  if (this.stats.examsCompleted >= 5 && !this.hasBadge('exam_taker')) {
    badgesToAward.push({
      badgeId: 'exam_taker',
      badgeName: 'خبير الامتحانات',
      badgeDescription: 'أكمل 5 امتحانات',
      badgeIcon: '📝',
      category: 'learning'
    });
  }
  
  // Streak badges
  if (this.currentStreak >= 7 && !this.hasBadge('week_warrior')) {
    badgesToAward.push({
      badgeId: 'week_warrior',
      badgeName: 'محارب الأسبوع',
      badgeDescription: '7 أيام متتالية',
      badgeIcon: '🔥',
      category: 'streak'
    });
  }
  
  if (this.currentStreak >= 30 && !this.hasBadge('month_master')) {
    badgesToAward.push({
      badgeId: 'month_master',
      badgeName: 'سيد الشهر',
      badgeDescription: '30 يوم متتالي',
      badgeIcon: '👑',
      category: 'streak'
    });
  }
  
  // Level badges
  if (this.currentLevel >= 5 && !this.hasBadge('level_5')) {
    badgesToAward.push({
      badgeId: 'level_5',
      badgeName: 'المستوى الخامس',
      badgeDescription: 'وصل للمستوى 5',
      badgeIcon: '⭐',
      category: 'achievement'
    });
  }
  
  if (this.currentLevel >= 10 && !this.hasBadge('level_10')) {
    badgesToAward.push({
      badgeId: 'level_10',
      badgeName: 'المستوى العاشر',
      badgeDescription: 'وصل للمستوى 10',
      badgeIcon: '🌟',
      category: 'achievement'
    });
  }
  
  // Add new badges
  badgesToAward.forEach(badge => {
    this.badges.push(badge);
  });
  
  return badgesToAward;
};

// Helper method to check if user has a specific badge
GamificationSchema.methods.hasBadge = function(badgeId) {
  return this.badges.some(badge => badge.badgeId === badgeId);
};

// Static method to get leaderboard
GamificationSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find()
    .populate('userId', 'firstName secondName thirdName fourthName email')
    .sort({ totalXP: -1 })
    .limit(limit);
};

// Static method to get user's rank
GamificationSchema.statics.getUserRank = function(userId) {
  return this.countDocuments({ totalXP: { $gt: this.totalXP } }) + 1;
};

module.exports = mongoose.model("Gamification", GamificationSchema);
