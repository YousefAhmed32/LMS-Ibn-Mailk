const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"]
  },
  studentName: {
    type: String,
    required: [true, "Student full name is required"],
    trim: true,
    maxlength: [100, "Student name cannot exceed 100 characters"]
  },
  studentPhone: {
    type: String,
    required: [true, "Student phone number is required"],
    trim: true,
    validate: {
      validator: function(v) {
        if (!v || typeof v !== 'string') return false;
        const { isValidPhone } = require('../utils/phoneUtils');
        return isValidPhone(v.trim());
      },
      message: 'Please enter a valid international phone number (e.g. +201234567890)'
    }
  },
  
  // Course information
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course ID is required"]
  },
  
  // Payment details
  amount: {
    type: Number,
    required: [true, "Payment amount is required"],
    min: [0.01, "Amount must be greater than 0"]
  },
  transactionId: {
    type: String,
    required: false, // Optional transaction reference code
    trim: true,
    maxlength: [50, "Transaction ID cannot exceed 50 characters"]
  },
  screenshot: {
    type: String,
    required: [true, "Payment screenshot is required"]
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  
  // Additional fields for backward compatibility
  currency: {
    type: String,
    default: "EGP",
    enum: ["USD", "EGP", "EUR"]
  },
  paymentMethod: {
    type: String,
    default: "vodafone_cash",
    enum: ["credit_card", "debit_card", "bank_transfer", "paypal", "cash", "vodafone_cash"]
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  rejectionReason: {
    type: String,
    maxlength: [500, "Rejection reason cannot exceed 500 characters"]
  },
  notes: {
    type: String,
    maxlength: [1000, "Notes cannot exceed 1000 characters"]
  },
  metadata: {
    type: Map,
    of: String
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
PaymentSchema.index({ studentId: 1, courseId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { 
  unique: true, 
  sparse: true, // Allows null values but ensures uniqueness for non-null values
  name: 'transactionId_unique'
});
PaymentSchema.index({ submittedAt: 1 });
PaymentSchema.index({ studentId: 1, status: 1 }); // For student payment history
PaymentSchema.index({ courseId: 1, status: 1 }); // For course payment analytics

// Virtual for payment duration (time from creation to confirmation/rejection)
PaymentSchema.virtual('processingTime').get(function() {
  if (this.status === 'pending') {
    return Date.now() - this.createdAt.getTime();
  }
  if (this.acceptedAt) {
    return this.acceptedAt.getTime() - this.createdAt.getTime();
  }
  if (this.rejectedAt) {
    return this.rejectedAt.getTime() - this.createdAt.getTime();
  }
  return null;
});

// Virtual for formatted amount
PaymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for payment status badge color
PaymentSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    accepted: 'green',
    rejected: 'red',
    cancelled: 'gray'
  };
  return colors[this.status] || 'gray';
});

// Ensure virtuals are included when converting to JSON
PaymentSchema.set('toJSON', { virtuals: true });
PaymentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate transaction ID if not provided
PaymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to get payment statistics
PaymentSchema.statics.getPaymentStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        acceptedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "accepted"] }, "$amount", 0]
          }
        },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0]
          }
        },
        rejectedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "rejected"] }, "$amount", 0]
          }
        }
      }
    }
  ]);
};

// Instance method to accept payment
PaymentSchema.methods.accept = async function(adminId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending payments can be accepted');
  }
  
  this.status = 'accepted';
  this.acceptedAt = new Date();
  this.acceptedBy = adminId;
  
  return await this.save();
};

// Instance method to reject payment
PaymentSchema.methods.reject = async function(adminId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending payments can be rejected');
  }
  
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason || 'Payment rejected by admin';
  
  return await this.save();
};

module.exports = mongoose.model("Payment", PaymentSchema);
