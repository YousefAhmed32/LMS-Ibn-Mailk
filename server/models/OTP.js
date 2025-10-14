const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  otpCode: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Index for faster queries
OTPSchema.index({ studentId: 1, parentId: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Static method to generate OTP
OTPSchema.statics.generateOTP = function(studentId, parentId) {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  return this.create({
    studentId,
    parentId,
    otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
};

// Instance method to verify OTP
OTPSchema.methods.verifyOTP = function(inputOTP) {
  // Check if OTP is expired
  if (new Date() > this.expiresAt) {
    return { success: false, message: 'رمز التحقق منتهي الصلاحية' };
  }
  
  // Check if OTP is already used
  if (this.isUsed) {
    return { success: false, message: 'رمز التحقق مستخدم بالفعل' };
  }
  
  // Check if max attempts reached
  if (this.attempts >= 3) {
    return { success: false, message: 'تم تجاوز عدد المحاولات المسموح' };
  }
  
  // Increment attempts
  this.attempts += 1;
  
  // Check if OTP matches
  if (this.otpCode === inputOTP) {
    this.isUsed = true;
    return { success: true, message: 'تم التحقق بنجاح' };
  }
  
  // Save attempts
  this.save();
  
  return { success: false, message: 'رمز التحقق غير صحيح' };
};

module.exports = mongoose.model('OTP', OTPSchema);
