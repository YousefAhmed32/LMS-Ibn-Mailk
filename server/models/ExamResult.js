const mongoose = require('mongoose');

// Exam Result Schema
const ExamResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  
  examId: {
    type: String,
    required: [true, 'Exam ID is required']
  },
  
  examTitle: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true
  },
  
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  
  maxScore: {
    type: Number,
    required: [true, 'Maximum score is required'],
    min: [1, 'Maximum score must be at least 1']
  },
  
  percentage: {
    type: Number,
    required: false, // Will be calculated in pre-save
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100']
  },
  
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
    required: false // Will be calculated in pre-save
  },
  
  level: {
    type: String,
    enum: ['Excellent', 'Very Good', 'Good', 'Average', 'Below Average', 'Poor'],
    required: false // Will be calculated in pre-save
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  examUrl: {
    type: String,
    required: false,
    trim: true
  },
  
  notes: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ExamResultSchema.index({ studentId: 1, courseId: 1 });
ExamResultSchema.index({ studentId: 1, examId: 1 });
ExamResultSchema.index({ courseId: 1, examId: 1 });
ExamResultSchema.index({ submittedAt: -1 });

// Virtual for formatted score display
ExamResultSchema.virtual('formattedScore').get(function() {
  return `${this.score}/${this.maxScore}`;
});

// Virtual for grade color (for UI styling)
ExamResultSchema.virtual('gradeColor').get(function() {
  const gradeColors = {
    'A+': 'text-green-600',
    'A': 'text-green-500',
    'B+': 'text-blue-600',
    'B': 'text-blue-500',
    'C+': 'text-yellow-600',
    'C': 'text-yellow-500',
    'D+': 'text-orange-600',
    'D': 'text-orange-500',
    'F': 'text-red-600'
  };
  return gradeColors[this.grade] || 'text-gray-600';
});

// Virtual for level color (for UI styling)
ExamResultSchema.virtual('levelColor').get(function() {
  const levelColors = {
    'Excellent': 'text-green-600',
    'Very Good': 'text-blue-600',
    'Good': 'text-blue-500',
    'Average': 'text-yellow-600',
    'Below Average': 'text-orange-600',
    'Poor': 'text-red-600'
  };
  return levelColors[this.level] || 'text-gray-600';
});

// Pre-save middleware to calculate percentage, grade, and level
ExamResultSchema.pre('save', function(next) {
  // Only calculate if score and maxScore are available
  if (this.score !== undefined && this.maxScore !== undefined && this.maxScore > 0) {
    // Calculate percentage
    this.percentage = Math.round((this.score / this.maxScore) * 100);
    
    // Calculate grade based on percentage
    if (this.percentage >= 95) {
      this.grade = 'A+';
      this.level = 'Excellent';
    } else if (this.percentage >= 90) {
      this.grade = 'A';
      this.level = 'Excellent';
    } else if (this.percentage >= 85) {
      this.grade = 'B+';
      this.level = 'Very Good';
    } else if (this.percentage >= 80) {
      this.grade = 'B';
      this.level = 'Very Good';
    } else if (this.percentage >= 75) {
      this.grade = 'C+';
      this.level = 'Good';
    } else if (this.percentage >= 70) {
      this.grade = 'C';
      this.level = 'Good';
    } else if (this.percentage >= 65) {
      this.grade = 'D+';
      this.level = 'Average';
    } else if (this.percentage >= 60) {
      this.grade = 'D';
      this.level = 'Average';
    } else {
      this.grade = 'F';
      this.level = this.percentage >= 50 ? 'Below Average' : 'Poor';
    }
    
    // Ensure passed is correctly set based on grade and percentage
    // High grades (A+, A, B+) should always be considered passed
    if (this.grade === 'A+' || this.grade === 'A' || this.grade === 'B+') {
      this.passed = true;
    } else if (this.passed === undefined) {
      // If passed is not set, use default logic
      this.passed = this.percentage >= 60;
    }
  }
  
  next();
});

// Static method to get student's exam results for a course
ExamResultSchema.statics.getStudentCourseResults = function(studentId, courseId) {
  return this.find({ studentId, courseId })
    .populate('studentId', 'firstName secondName thirdName fourthName')
    .populate('courseId', 'title subject grade')
    .sort({ submittedAt: -1 });
};

// Static method to get student's overall performance
ExamResultSchema.statics.getStudentPerformance = function(studentId) {
  return this.aggregate([
    { $match: { studentId: mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: null,
        totalExams: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        averageGrade: { 
          $avg: { 
            $cond: [
              { $eq: ['$grade', 'A+'] }, 12, 
              { $cond: [
                { $eq: ['$grade', 'A'] }, 11, 
                { $cond: [
                  { $eq: ['$grade', 'B+'] }, 10, 
                  { $cond: [
                    { $eq: ['$grade', 'B'] }, 9, 
                    { $cond: [
                      { $eq: ['$grade', 'C+'] }, 8, 
                      { $cond: [
                        { $eq: ['$grade', 'C'] }, 7, 
                        { $cond: [
                          { $eq: ['$grade', 'D+'] }, 6, 
                          { $cond: [
                            { $eq: ['$grade', 'D'] }, 5, 4
                          ]}
                        ]}
                      ]}
                    ]}
                  ]}
                ]}
              ]}
            ]
          }
        },
        bestScore: { $max: '$percentage' },
        worstScore: { $min: '$percentage' },
        recentResults: { $push: { examTitle: '$examTitle', percentage: '$percentage', grade: '$grade', submittedAt: '$submittedAt' } }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
ExamResultSchema.set('toJSON', { virtuals: true });
ExamResultSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ExamResult', ExamResultSchema);

