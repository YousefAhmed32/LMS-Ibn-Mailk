const mongoose = require("mongoose");

// Quiz Result Schema
const QuizResultSchema = new mongoose.Schema({
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
  quizId: {
    type: String,
    required: [true, "Quiz ID is required"]
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  passed: {
    type: Boolean,
    default: false
  },
  passingScore: {
    type: Number,
    default: 70 // 70% passing score
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
QuizResultSchema.index({ userId: 1, courseId: 1 });
QuizResultSchema.index({ userId: 1, lessonId: 1 });
QuizResultSchema.index({ courseId: 1, lessonId: 1 });

// Virtual for formatted score
QuizResultSchema.virtual('formattedScore').get(function() {
  return `${this.score}%`;
});

// Virtual for status
QuizResultSchema.virtual('status').get(function() {
  return this.passed ? 'passed' : 'failed';
});

// Ensure virtuals are included when converting to JSON
QuizResultSchema.set('toJSON', { virtuals: true });
QuizResultSchema.set('toObject', { virtuals: true });

// Static method to get user's quiz statistics for a course
QuizResultSchema.statics.getUserCourseStats = async function(userId, courseId) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        courseId: new mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$score' },
        passedQuizzes: {
          $sum: { $cond: ['$passed', 1, 0] }
        },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);

  return stats[0] || {
    totalQuizzes: 0,
    averageScore: 0,
    passedQuizzes: 0,
    totalTimeSpent: 0
  };
};

// Static method to get lesson completion status
QuizResultSchema.statics.getLessonCompletion = async function(userId, courseId, lessonId) {
  const result = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    courseId: new mongoose.Types.ObjectId(courseId),
    lessonId: lessonId
  }).sort({ completedAt: -1 });

  return result;
};

module.exports = mongoose.model("QuizResult", QuizResultSchema);
