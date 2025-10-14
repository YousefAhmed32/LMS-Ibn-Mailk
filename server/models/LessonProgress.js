const mongoose = require("mongoose");

// Lesson Progress Schema
const LessonProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course ID is required"]
  },
  lessonId: {
    type: String,
    required: [true, "Lesson ID is required"]
  },
  videoId: {
    type: String,
    required: [true, "Video ID is required"]
  },
  watchedDuration: {
    type: Number, // in seconds
    default: 0
  },
  totalDuration: {
    type: Number, // in seconds
    required: true
  },
  watchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  watchCount: {
    type: Number,
    default: 1
  },
  quizCompleted: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100
  },
  quizPassed: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
LessonProgressSchema.index({ userId: 1, courseId: 1 });
LessonProgressSchema.index({ userId: 1, lessonId: 1 });
LessonProgressSchema.index({ courseId: 1, lessonId: 1 });

// Virtual for formatted watch percentage
LessonProgressSchema.virtual('formattedWatchPercentage').get(function() {
  return `${this.watchPercentage.toFixed(1)}%`;
});

// Virtual for formatted watched duration
LessonProgressSchema.virtual('formattedWatchedDuration').get(function() {
  const minutes = Math.floor(this.watchedDuration / 60);
  const seconds = this.watchedDuration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted total duration
LessonProgressSchema.virtual('formattedTotalDuration').get(function() {
  const minutes = Math.floor(this.totalDuration / 60);
  const seconds = this.totalDuration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Ensure virtuals are included when converting to JSON
LessonProgressSchema.set('toJSON', { virtuals: true });
LessonProgressSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate watch percentage
LessonProgressSchema.pre('save', function(next) {
  if (this.totalDuration > 0) {
    this.watchPercentage = (this.watchedDuration / this.totalDuration) * 100;
    
    // Mark as completed if watched more than 90% of the video
    if (this.watchPercentage >= 90 && !this.isCompleted) {
      this.isCompleted = true;
      this.completedAt = new Date();
    }
  }
  next();
});

// Static method to get user's course progress
LessonProgressSchema.statics.getUserCourseProgress = async function(userId, courseId) {
  try {
    // Validate input parameters
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!courseId) {
      throw new Error('courseId is required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error('Invalid courseId format');
    }

    console.log('📊 LessonProgress.getUserCourseProgress:', {
      userId: userId.toString(),
      courseId: courseId.toString()
    });

    // Convert to ObjectId safely
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const courseIdObj = new mongoose.Types.ObjectId(courseId);

    const progress = await this.find({
      userId: userIdObj,
      courseId: courseIdObj
    });

    console.log(`📊 Found ${progress.length} progress records`);

    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.isCompleted).length;
    const totalWatchTime = progress.reduce((sum, p) => sum + (p.watchedDuration || 0), 0);
    const totalDuration = progress.reduce((sum, p) => sum + (p.totalDuration || 0), 0);
    const overallProgress = totalDuration > 0 ? (totalWatchTime / totalDuration) * 100 : 0;

    const result = {
      totalLessons,
      completedLessons,
      totalWatchTime,
      totalDuration,
      overallProgress: Math.round(overallProgress * 100) / 100,
      lessons: progress
    };

    console.log('✅ Progress calculated:', {
      totalLessons,
      completedLessons,
      overallProgress: result.overallProgress
    });

    return result;

  } catch (error) {
    console.error('❌ Error in getUserCourseProgress:', {
      error: error.message,
      userId: userId,
      courseId: courseId,
      errorName: error.name
    });
    throw error;
  }
};

// Static method to get lesson progress
LessonProgressSchema.statics.getLessonProgress = async function(userId, courseId, lessonId) {
  try {
    // Validate input parameters
    if (!userId || !courseId || !lessonId) {
      throw new Error('userId, courseId, and lessonId are required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error('Invalid courseId format');
    }

    return await this.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      lessonId: lessonId
    });

  } catch (error) {
    console.error('❌ Error in getLessonProgress:', error.message);
    throw error;
  }
};

// Static method to update lesson progress
LessonProgressSchema.statics.updateLessonProgress = async function(userId, courseId, lessonId, videoId, watchedDuration, totalDuration) {
  try {
    // Validate input parameters
    if (!userId || !courseId || !lessonId || !videoId) {
      throw new Error('userId, courseId, lessonId, and videoId are required');
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new Error('Invalid courseId format');
    }

    // Validate numeric values
    if (typeof watchedDuration !== 'number' || watchedDuration < 0) {
      throw new Error('watchedDuration must be a non-negative number');
    }
    if (typeof totalDuration !== 'number' || totalDuration <= 0) {
      throw new Error('totalDuration must be a positive number');
    }

    const progress = await this.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        courseId: new mongoose.Types.ObjectId(courseId),
        lessonId: lessonId
      },
      {
        $set: {
          videoId: videoId,
          watchedDuration: watchedDuration,
          totalDuration: totalDuration,
          lastWatchedAt: new Date()
        },
        $inc: { watchCount: 1 }
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    return progress;

  } catch (error) {
    console.error('❌ Error in updateLessonProgress:', error.message);
    throw error;
  }
};

module.exports = mongoose.model("LessonProgress", LessonProgressSchema);
