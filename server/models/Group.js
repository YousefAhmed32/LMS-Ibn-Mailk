const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  coverImage: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  announcements: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    link: {
      url: { type: String },
      label: { type: String },
      type: { type: String, enum: ['zoom', 'drive', 'youtube', 'custom'], default: 'custom' }
    }
  }],
  chatMessages: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    attachment: {
      url: { type: String },
      filename: { type: String },
      fileType: { type: String },
      fileSize: { type: Number }
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    }
  }],
  settings: {
    allowStudentMessages: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    maxStudents: {
      type: Number,
      default: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
groupSchema.index({ createdBy: 1 });
groupSchema.index({ students: 1 });
groupSchema.index({ isActive: 1 });

// Virtual for student count
groupSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

// Method to add student to group
groupSchema.methods.addStudent = function(studentId) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove student from group
groupSchema.methods.removeStudent = function(studentId) {
  this.students = this.students.filter(id => !id.equals(studentId));
  return this.save();
};

// Method to add announcement
groupSchema.methods.addAnnouncement = function(announcementData) {
  this.announcements.unshift(announcementData);
  return this.save();
};

// Method to add chat message
groupSchema.methods.addChatMessage = function(messageData) {
  this.chatMessages.push(messageData);
  return this.save();
};

// Method to get recent chat messages
groupSchema.methods.getRecentMessages = function(limit = 50) {
  return this.chatMessages
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .reverse();
};

// Static method to find groups by student
groupSchema.statics.findByStudent = function(studentId) {
  return this.find({ 
    students: studentId, 
    isActive: true 
  }).populate('createdBy', 'firstName secondName userEmail');
};

// Static method to find groups by admin
groupSchema.statics.findByAdmin = function(adminId) {
  return this.find({ 
    createdBy: adminId, 
    isActive: true 
  }).populate('students', 'firstName secondName userEmail parentPhone');
};

module.exports = mongoose.model('Group', groupSchema);
