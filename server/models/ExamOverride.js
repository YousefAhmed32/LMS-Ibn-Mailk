const mongoose = require('mongoose');

const examOverrideSchema = new mongoose.Schema({
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
  examId: {
    type: String,
    required: true
  },
  percentWatched: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  serverPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  clientPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Additional metadata
  examToken: {
    type: String,
    required: true
  },
  examUrl: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Status tracking
  examStarted: {
    type: Boolean,
    default: false
  },
  examCompleted: {
    type: Boolean,
    default: false
  },
  examScore: {
    type: Number,
    min: 0,
    max: 100
  },
  examCompletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
examOverrideSchema.index({ studentId: 1, courseId: 1 });
examOverrideSchema.index({ courseId: 1, timestamp: -1 });
examOverrideSchema.index({ examToken: 1 }, { unique: true });
examOverrideSchema.index({ timestamp: -1 });

// Virtual for time since override
examOverrideSchema.virtual('timeSinceOverride').get(function() {
  return Date.now() - this.timestamp.getTime();
});

// Virtual for is expired
examOverrideSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Method to check if override is valid
examOverrideSchema.methods.isValid = function() {
  return !this.isExpired && !this.examCompleted;
};

// Method to mark exam as started
examOverrideSchema.methods.markExamStarted = function() {
  this.examStarted = true;
  return this.save();
};

// Method to mark exam as completed
examOverrideSchema.methods.markExamCompleted = function(score) {
  this.examCompleted = true;
  this.examScore = score;
  this.examCompletedAt = new Date();
  return this.save();
};

// Static method to get override statistics for a course
examOverrideSchema.statics.getCourseOverrideStats = async function(courseId) {
  const overrides = await this.find({ courseId });
  
  const totalOverrides = overrides.length;
  const uniqueStudents = new Set(overrides.map(o => o.studentId.toString())).size;
  const completedExams = overrides.filter(o => o.examCompleted).length;
  const expiredOverrides = overrides.filter(o => o.isExpired).length;
  
  const averagePercentWatched = overrides.length > 0 
    ? overrides.reduce((sum, o) => sum + o.percentWatched, 0) / overrides.length 
    : 0;
  
  const averageExamScore = completedExams > 0
    ? overrides.filter(o => o.examCompleted && o.examScore !== undefined)
        .reduce((sum, o) => sum + o.examScore, 0) / completedExams
    : 0;
  
  return {
    totalOverrides,
    uniqueStudents,
    completedExams,
    expiredOverrides,
    averagePercentWatched: Math.round(averagePercentWatched * 100) / 100,
    averageExamScore: Math.round(averageExamScore * 100) / 100,
    completionRate: totalOverrides > 0 ? (completedExams / totalOverrides) * 100 : 0
  };
};

// Static method to get student override history
examOverrideSchema.statics.getStudentOverrideHistory = async function(studentId) {
  const overrides = await this.find({ studentId })
    .populate('courseId', 'title subject')
    .sort({ timestamp: -1 });
  
  return overrides.map(override => ({
    id: override._id,
    course: {
      id: override.courseId._id,
      title: override.courseId.title,
      subject: override.courseId.subject
    },
    videoId: override.videoId,
    examId: override.examId,
    percentWatched: override.percentWatched,
    examScore: override.examScore,
    examCompleted: override.examCompleted,
    timestamp: override.timestamp,
    isExpired: override.isExpired
  }));
};

// Pre-save middleware to generate exam token and URL
examOverrideSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate exam token
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    this.examToken = Buffer.from(`${this.studentId}-${this.courseId}-${this.examId}-${timestamp}-${random}`).toString('base64');
    
    // Generate exam URL
    this.examUrl = `/exam/${this.examId}?token=${this.examToken}&student=${this.studentId}`;
    
    // Set expiration (2 hours from now)
    this.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('ExamOverride', examOverrideSchema);
