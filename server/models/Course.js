const mongoose = require("mongoose");

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Course title is required"],
    trim: true,
    maxlength: [100, "Course title cannot exceed 100 characters"]
  },
  
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, "Course description cannot exceed 500 characters"]
  },
  
  grade: {
    type: String,
    required: [true, "Grade is required"],
    enum: {
      values: ["7", "8", "9", "10", "11", "12"],
      message: "Grade must be one of: 7, 8, 9, 10, 11, 12"
    }
  },
  
  term: {
    type: String,
    required: false,
    enum: {
      values: ["Term 1", "Term 2"],
      message: "Term must be either 'Term 1' or 'Term 2'"
    }
  },
  
  level: {
    type: String,
    required: false,
    enum: {
      values: ["beginner", "intermediate", "advanced"],
      message: "Level must be one of: beginner, intermediate, advanced"
    },
    default: "beginner"
  },
  
  duration: {
    type: Number,
    required: false,
    min: [0, "Duration cannot be negative"],
    default: 0
  },
  
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
    maxlength: [50, "Subject name cannot exceed 50 characters"]
  },
  
  imageUrl: {
    type: String,
    required: false,
    trim: true
  },
  
  coverImage: {
    type: String,
    required: false,
    trim: true
  },
  
  price: {
    type: Number,
    required: [true, "Course price is required"],
    min: [0, "Price cannot be negative"],
    default: 0
  },
  
  // Internal exams - embedded within course
  exams: [{
    id: {
      type: String,
      required: false // Make optional for frontend compatibility
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [200, 'Exam title cannot exceed 200 characters']
    },
    type: {
      type: String,
      required: false,
      enum: {
        values: ['internal_exam', 'google_form', 'external', 'link'],
        message: 'Exam type must be one of: internal_exam, google_form, external, link'
      },
      default: 'internal_exam'
    },
    url: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'Exam URL cannot exceed 500 characters']
    },
    migratedFromGoogleForm: {
      type: Boolean,
      default: false
    },
    migrationNote: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, 'Migration note cannot exceed 500 characters']
    },
    totalMarks: {
      type: Number,
      required: false,
      min: [0, 'Total marks must be at least 0'], // Allow 0 for external exams
      default: 100,
      validate: {
        validator: function(value) {
          // For external exams (google_form, external, link), allow 0 marks
          if (this.type && ['google_form', 'external', 'link'].includes(this.type)) {
            return value >= 0;
          }
          // For internal exams, require at least 1 mark
          return value >= 1;
        },
        message: 'Total marks must be at least 1 for internal exams, 0 for external exams'
      }
    },
    totalPoints: {
      type: Number,
      required: false,
      min: [0, 'Total points must be at least 0'],
      default: 0
    },
    duration: {
      type: Number,
      required: false,
      min: [0, "Exam duration must be at least 0 minutes"], // Allow 0 for external exams
      default: 30,
      validate: {
        validator: function(value) {
          // For external exams (google_form, external, link), allow 0 duration
          if (this.type && ['google_form', 'external', 'link'].includes(this.type)) {
            return value >= 0;
          }
          // For internal exams, require at least 1 minute
          return value >= 1;
        },
        message: 'Exam duration must be at least 1 minute for internal exams, 0 for external exams'
      }
    },
    passingScore: {
      type: Number,
      required: false,
      min: [0, "Passing score cannot be negative"],
      max: [100, "Passing score cannot exceed 100"],
      default: 60
    },
    questions: [{
      id: {
        type: String,
        required: false // Make optional for frontend compatibility
      },
      questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [2000, 'Question text cannot exceed 2000 characters']
      },
      type: {
        type: String,
        required: [true, 'Question type is required'],
        enum: {
          values: ['mcq', 'multiple_choice', 'true_false', 'essay'], // Support both mcq and multiple_choice
          message: 'Question type must be one of: mcq, multiple_choice, true_false, essay'
        }
      },
      questionType: {
        type: String,
        enum: {
          values: ['mcq', 'multiple_choice', 'true_false', 'essay'],
          message: 'Question type must be one of: mcq, multiple_choice, true_false, essay'
        }
      },
      points: {
        type: Number,
        required: false,
        min: [1, "Points must be at least 1"],
        default: 1
      },
      order: {
        type: Number,
        required: false // Make optional
      },
      // For MCQ questions
      options: {
        type: [{
          id: {
            type: String,
            required: false // Make optional
          },
          text: {
            type: String,
            required: false, // Make optional - will be set from optionText
            trim: true,
            maxlength: [500, 'Option text cannot exceed 500 characters']
          },
          optionText: {
            type: String,
            required: false, // Make optional - will be set from text
            trim: true,
            maxlength: [500, 'Option text cannot exceed 500 characters']
          },
          isCorrect: {
            type: Boolean,
            default: false
          }
        }],
        set: function(options) {
          // Handle string arrays by converting to object format
          if (Array.isArray(options)) {
            return options.map((option, index) => {
              if (typeof option === 'string') {
                return {
                  text: option,
                  optionText: option,
                  isCorrect: false // Will be set by correctAnswer later
                };
              }
              return option;
            });
          }
          return options;
        }
      },
      // For true/false questions
      correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be boolean or string/index
        required: false // Make optional - will be set based on question type
      },
      // For essay questions
      sampleAnswer: {
        type: String,
        required: false,
        trim: true,
        maxlength: [2000, "Sample answer cannot exceed 2000 characters"]
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  videos: [{
    // Legacy fields for backward compatibility
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, "Video title cannot exceed 100 characters"]
    },
    url: {
      type: String,
      required: false,
      trim: true
    },
    order: {
      type: Number,
      required: false,
      default: 0,
      min: [0, "Video order cannot be negative"]
    },
    thumbnail: {
      type: String,
      required: false,
      trim: true
    },
    duration: {
      type: Number, // Duration in minutes
      required: false,
      min: [1, "Video duration must be at least 1 minute"]
    },
    
    // New YouTube video embedding fields
    provider: {
      type: String,
      enum: ['youtube', 'vimeo', 'custom'],
      default: 'youtube'
    },
    videoId: {
      type: String,
      required: false,
      trim: true,
      maxlength: [50, "Video ID cannot exceed 50 characters"]
    },
    embedSrc: {
      type: String,
      required: false,
      trim: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '560'
    },
    allow: {
      type: String,
      default: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    },
    rawInputType: {
      type: String,
      enum: ['url', 'iframe'],
      required: false
    },
    sanitizedAt: {
      type: Date,
      default: Date.now
    },
    enableJsApi: {
      type: Boolean,
      default: false
    },
    
    quiz: {
      questions: [{
        id: {
          type: String,
          required: true
        },
        question: {
          type: String,
          required: true,
          trim: true
        },
        options: [{
          type: String,
          required: true,
          trim: true
        }],
        correctAnswer: {
          type: String,
          required: true,
          trim: true
        },
        explanation: {
          type: String,
          required: false,
          trim: true
        }
      }],
      passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
      },
      timeLimit: {
        type: Number, // in minutes
        default: 10
      }
    }
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Make it optional for now
  },
  
  // Additional fields for better course management
  isActive: {
    type: Boolean,
    default: true
  },
  
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  totalEnrollments: {
    type: Number,
    default: 0
  },
  
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalRatings: {
    type: Number,
    default: 0
  }
  
}, { 
  timestamps: true 
});

  // Indexes for better query performance
  CourseSchema.index({ title: 1 });
  CourseSchema.index({ grade: 1, level: 1 });
  CourseSchema.index({ subject: 1 });
  CourseSchema.index({ createdBy: 1 });
  CourseSchema.index({ isActive: 1 });

// Pre-save middleware to calculate totalQuestions for each exam and normalize question types
CourseSchema.pre('save', function(next) {
  if (this.exams && Array.isArray(this.exams)) {
    this.exams.forEach(exam => {
      exam.totalQuestions = exam.questions ? exam.questions.length : 0;
      
      // Calculate totalPoints and totalMarks automatically
      let totalPoints = 0;
      
      if (exam.questions && Array.isArray(exam.questions)) {
        exam.questions.forEach((question, index) => {
          // Set default points if not provided
          if (!question.points || question.points < 1) {
            question.points = 1;
          }
          
          // Add to total points
          totalPoints += question.points;
          
          // Normalize question type - use 'type' if provided, otherwise use 'questionType'
          if (question.type && !question.questionType) {
            question.questionType = question.type;
          } else if (question.questionType && !question.type) {
            question.type = question.questionType;
          }
          
          // Ensure both fields are set for consistency
          if (question.questionType) {
            question.type = question.questionType;
          }
          
          // Normalize options - support both 'optionText' and 'text'
          if (question.options && Array.isArray(question.options)) {
            question.options.forEach((option, optIndex) => {
              // Normalize field names
              if (option.optionText && !option.text) {
                option.text = option.optionText;
              } else if (option.text && !option.optionText) {
                option.optionText = option.text;
              }
              
              // Set isCorrect based on correctAnswer index for multiple choice
              if ((question.type === 'multiple_choice' || question.type === 'mcq') && 
                  typeof question.correctAnswer === 'number') {
                option.isCorrect = question.correctAnswer === optIndex;
              }
            });
          }
          
          // For multiple choice questions, set correctAnswer based on isCorrect
          if (question.type === 'multiple_choice' && question.options && !question.correctAnswer) {
            const correctOption = question.options.find(opt => opt.isCorrect);
            if (correctOption) {
              question.correctAnswer = correctOption.optionText || correctOption.text;
            }
          }
        });
      }
      
      // Set the calculated totalPoints and totalMarks
      exam.totalPoints = totalPoints;
      exam.totalMarks = totalPoints; // totalMarks should equal totalPoints
    });
  }
  next();
});

// Virtual for total course duration
CourseSchema.virtual('totalDuration').get(function() {
  if (!this.videos || !Array.isArray(this.videos)) {
    return 0;
  }
  return this.videos.reduce((total, video) => total + (video.duration || 0), 0);
});

// Virtual for course cover image (prefer coverImage over imageUrl)
CourseSchema.virtual('courseCoverImage').get(function() {
  return this.coverImage || this.imageUrl || null;
});

// Ensure virtual fields are serialized
CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Course", CourseSchema);
