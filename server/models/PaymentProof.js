const mongoose = require("mongoose");

const PaymentProofSchema = new mongoose.Schema({
  // Student information
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"]
  },
  studentPhone: {
    type: String,
    required: [true, "Student phone number is required"],
    validate: {
      validator: function(v) {
        return /^01[0-9]{9}$/.test(v);
      },
      message: 'Please enter a valid Egyptian phone number (e.g., 01012345678)'
    }
  },
  parentPhone: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^01[0-9]{9}$/.test(v);
      },
      message: 'Please enter a valid Egyptian phone number (e.g., 01012345678)'
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
  senderPhone: {
    type: String,
    required: [true, "Sender phone number is required"],
    validate: {
      validator: function(v) {
        return /^01[0-9]{9}$/.test(v);
      },
      message: 'Please enter a valid Egyptian phone number (e.g., 01012345678)'
    }
  },
  transferTime: {
    type: Date,
    required: [true, "Transfer time is required"]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  proofImage: {
    type: String,
    required: [true, "Proof image is required"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  
  // Payment gateway integration
  paymentMethod: {
    type: String,
    enum: ["vodafone_cash", "credit_card", "debit_card", "bank_transfer", "paypal", "stripe", "cash"],
    default: "vodafone_cash"
  },
  gatewayTransactionId: {
    type: String,
    sparse: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Admin approval fields
  approvedAt: {
    type: Date
  },
  approvedBy: {
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
  
  // Additional metadata
  currency: {
    type: String,
    default: "EGP",
    enum: ["USD", "EGP", "EUR"]
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
PaymentProofSchema.index({ studentId: 1, courseId: 1 });
PaymentProofSchema.index({ status: 1 });
PaymentProofSchema.index({ submittedAt: 1 });
PaymentProofSchema.index({ paymentMethod: 1 });

// Virtual for payment duration
PaymentProofSchema.virtual('processingTime').get(function() {
  if (this.status === 'pending') {
    return Date.now() - this.createdAt.getTime();
  }
  if (this.approvedAt) {
    return this.approvedAt.getTime() - this.createdAt.getTime();
  }
  if (this.rejectedAt) {
    return this.rejectedAt.getTime() - this.createdAt.getTime();
  }
  return null;
});

// Virtual for formatted amount
PaymentProofSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for status color
PaymentProofSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    approved: 'green',
    rejected: 'red'
  };
  return colors[this.status] || 'gray';
});

// Ensure virtuals are included when converting to JSON
PaymentProofSchema.set('toJSON', { virtuals: true });
PaymentProofSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate transaction ID if not provided
PaymentProofSchema.pre('save', function(next) {
  if (!this.gatewayTransactionId && this.paymentMethod !== 'vodafone_cash') {
    this.gatewayTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Static method to get payment statistics
PaymentProofSchema.statics.getPaymentStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        approvedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0]
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

// Instance method to approve payment
PaymentProofSchema.methods.approve = async function(adminId) {
  if (this.status !== 'pending') {
    throw new Error('Only pending payments can be approved');
  }
  
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = adminId;
  
  return await this.save();
};

// Instance method to reject payment
PaymentProofSchema.methods.reject = async function(adminId, reason) {
  if (this.status !== 'pending') {
    throw new Error('Only pending payments can be rejected');
  }
  
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectedBy = adminId;
  this.rejectionReason = reason || 'Payment rejected by admin';
  
  return await this.save();
};

module.exports = mongoose.model("PaymentProof", PaymentProofSchema);
