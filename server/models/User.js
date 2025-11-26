// server/models/User.js - Production-ready schema with single email field
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Full Arabic Name
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  secondName: { 
    type: String, 
    required: [true, 'Second name is required'],
    trim: true,
    minlength: [2, 'Second name must be at least 2 characters']
  },
  thirdName: { 
    type: String, 
    required: [true, 'Third name is required'],
    trim: true,
    minlength: [2, 'Third name must be at least 2 characters']
  },
  fourthName: { 
    type: String, 
    required: [true, 'Fourth name is required'],
    trim: true,
    minlength: [2, 'Fourth name must be at least 2 characters']
  },

  // Authentication - PHONE NUMBER BASED
  phoneNumber: { 
    type: String, 
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^(\+20|0)?1[0125][0-9]{8}$/, 'Please enter a valid Egyptian phone number']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    enum: {
      values: ['student', 'admin', 'parent'],
      message: 'Role must be either student, admin, or parent'
    },
    default: 'student'
  },
  
  // Student ID for linking with parents
  studentId: { 
    type: String, 
    unique: true, 
    sparse: true // Allows null values but ensures uniqueness when present
  },
  
  // Parent-specific fields
  linkedStudents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  relation: { 
    type: String, 
    enum: ['Father', 'Mother', 'Guardian', 'Other', 'father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt'],
    required: false
  },

  // Contact Information (Additional phone numbers)
  phoneStudent: { type: String, required: false },
  phoneFather: { type: String, required: false },
  phoneMother: { type: String, required: false },
  guardianPhone: { type: String, required: false },

  // Location and Education
  governorate: { type: String, required: false },
  grade: { type: String, required: false },

  // LMS Features
  enrolledCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    paymentApprovedAt: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    proofImage: { type: String, default: null }
  }],
  allowedCourses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course'
  }],

  // Account Status
  isActive: { type: Boolean, default: true },
  approvedAt: { type: Date, default: null },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  strict: true // Prevent additional fields not defined in schema
});

// Performance indexes for faster enrollment lookups
UserSchema.index({ '_id': 1, 'enrolledCourses.course': 1 });
UserSchema.index({ 'enrolledCourses.course': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to normalize phone number
UserSchema.pre('save', async function(next) {
  // Normalize phone number (remove spaces, ensure consistent format)
  if (this.isModified('phoneNumber') && this.phoneNumber) {
    // Remove spaces and normalize
    let normalized = this.phoneNumber.trim().replace(/\s+/g, '');
    // If starts with +20, keep it; if starts with 0, convert to +20; if starts with 1, add +20
    if (normalized.startsWith('+20')) {
      normalized = normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+20' + normalized.substring(1);
    } else if (normalized.startsWith('1')) {
      normalized = '+20' + normalized;
    }
    this.phoneNumber = normalized;
  }
  next();
});

// Pre-save middleware to generate student ID for students
UserSchema.pre('save', async function(next) {
  if (this.role === 'student' && !this.studentId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.studentId = 'STU' + timestamp + random;
  }
  next();
});

// Indexes - PHONE NUMBER BASED
UserSchema.index({ phoneNumber: 1 }, { unique: true, name: 'phoneNumber_unique' });
UserSchema.index({ role: 1 }, { name: 'role_index' });
UserSchema.index({ studentId: 1 }, { unique: true, sparse: true, name: 'studentId_unique' });

// Search optimization indexes
UserSchema.index({ 
  role: 1, 
  isActive: 1, 
  firstName: 1, 
  secondName: 1 
}, { 
  name: 'student_search_compound',
  background: true 
});

// Text search index for student search
UserSchema.index(
  { 
    firstName: 'text', 
    secondName: 'text', 
    thirdName: 'text', 
    fourthName: 'text', 
    phoneNumber: 'text',
    studentId: 'text'
  },
  { 
    name: 'student_text_search',
    background: true,
    weights: {
      firstName: 10,
      secondName: 10,
      thirdName: 5,
      fourthName: 5,
      phoneNumber: 3,
      studentId: 8
    }
  }
);

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by phone number
UserSchema.statics.findByPhoneNumber = function(phoneNumber) {
  // Normalize phone number (remove spaces, handle +20 prefix)
  const normalized = phoneNumber.trim().replace(/\s+/g, '');
  return this.findOne({ 
    phoneNumber: normalized
  });
};

module.exports = mongoose.model('User', UserSchema);