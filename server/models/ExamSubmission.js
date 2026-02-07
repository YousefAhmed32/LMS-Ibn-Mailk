const mongoose = require('mongoose');

const ExamSubmissionSchema = new mongoose.Schema({
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
  examId: {
    type: String,
    required: true
  },
  answers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    answer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    skipped: Boolean,
    maxMarks: Number,
    earnedMarks: Number
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isEditable: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
ExamSubmissionSchema.index({ studentId: 1, courseId: 1, examId: 1 });

module.exports = mongoose.model('ExamSubmission', ExamSubmissionSchema);    