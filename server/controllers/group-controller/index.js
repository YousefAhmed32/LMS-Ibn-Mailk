const Group = require('../../models/Group');
const User = require('../../models/User');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Create a new group
const createGroup = async (req, res) => {
  try {
    console.log('Create group request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, coverImage, settings } = req.body;
    const createdBy = req.user.id;

    const group = new Group({
      name,
      description,
      coverImage,
      createdBy,
      settings: settings || {}
    });

    await group.save();
    await group.populate('createdBy', 'firstName secondName userEmail');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all groups for admin
const getAdminGroups = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {
      createdBy: adminId,
      isActive: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('students', 'firstName secondName userEmail parentPhone')
      .populate('createdBy', 'firstName secondName userEmail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Group.countDocuments(query);

    res.json({
      success: true,
      data: groups,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching admin groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all groups for student
const getStudentGroups = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const groups = await Group.find({
      students: studentId,
      isActive: true
    })
      .populate('createdBy', 'firstName secondName userEmail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Group.countDocuments({
      students: studentId,
      isActive: true
    });

    res.json({
      success: true,
      data: groups,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching student groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single group details
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: id,
      isActive: true,
      $or: [
        { createdBy: userId },
        { students: userId }
      ]
    })
      .populate('students', 'firstName secondName userEmail parentPhone')
      .populate('createdBy', 'firstName secondName userEmail')
      .populate('announcements.createdBy', 'firstName secondName userEmail');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update group
const updateGroup = async (req, res) => {
  try {
    console.log('Update group request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const adminId = req.user.id;
    const { name, description, coverImage, settings } = req.body;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (coverImage !== undefined) group.coverImage = coverImage;
    if (settings) group.settings = { ...group.settings, ...settings };

    await group.save();
    await group.populate('students', 'firstName secondName userEmail parentPhone');
    await group.populate('createdBy', 'firstName secondName userEmail');

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add students to group
const addStudentsToGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required'
      });
    }

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    // Verify all students exist
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some students not found'
      });
    }

    // Add students to group (avoid duplicates)
    const newStudents = studentIds.filter(id => !group.students.includes(id));
    group.students.push(...newStudents);

    await group.save();
    await group.populate('students', 'firstName secondName userEmail parentPhone');
    await group.populate('createdBy', 'firstName secondName userEmail');

    res.json({
      success: true,
      message: `${newStudents.length} students added to group`,
      data: group
    });
  } catch (error) {
    console.error('Error adding students to group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove student from group
const removeStudentFromGroup = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const adminId = req.user.id;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    await group.removeStudent(studentId);
    await group.populate('students', 'firstName secondName userEmail parentPhone');
    await group.populate('createdBy', 'firstName secondName userEmail');

    res.json({
      success: true,
      message: 'Student removed from group',
      data: group
    });
  } catch (error) {
    console.error('Error removing student from group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add announcement to group
const addAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const adminId = req.user.id;
    const { title, content, isImportant = false, link } = req.body;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    const announcementData = {
      title,
      content,
      createdBy: adminId,
      isImportant,
      link: link || null
    };

    await group.addAnnouncement(announcementData);
    await group.populate('announcements.createdBy', 'firstName secondName userEmail');

    res.json({
      success: true,
      message: 'Announcement added successfully',
      data: group.announcements[0]
    });
  } catch (error) {
    console.error('Error adding announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search students for adding to group
const searchStudents = async (req, res) => {
  try {
    console.log('🔍 Student Search API: Starting search...');
    
    const { q } = req.query;
    const adminId = req.user._id;

    console.log('📝 Search parameters:', {
      query: q,
      queryLength: q ? q.length : 0,
      adminId: adminId
    });

    // Validate query parameter
    if (!q || q.trim().length < 2) {
      console.log('⚠️ Query too short or empty');
      return res.json({
        success: true,
        data: [],
        message: 'Query must be at least 2 characters'
      });
    }

    // Sanitize and escape regex input to prevent injection
    const sanitizedQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    console.log('🔒 Sanitized query:', sanitizedQuery);

    // Build search query with proper escaping
    const searchQuery = {
      role: 'student',
      isActive: true, // Only active students
      $or: [
        { firstName: { $regex: sanitizedQuery, $options: 'i' } },
        { secondName: { $regex: sanitizedQuery, $options: 'i' } },
        { thirdName: { $regex: sanitizedQuery, $options: 'i' } },
        { fourthName: { $regex: sanitizedQuery, $options: 'i' } },
        { email: { $regex: sanitizedQuery, $options: 'i' } },
        { studentId: { $regex: sanitizedQuery, $options: 'i' } }
      ]
    };

    console.log('🔍 MongoDB query:', JSON.stringify(searchQuery, null, 2));

    // Execute search with limit and proper field selection
    const students = await User.find(searchQuery)
      .select('firstName secondName thirdName fourthName email studentId phoneStudent grade governorate')
      .limit(10) // Limit to 10 results for performance
      .sort({ firstName: 1, secondName: 1 }); // Sort by name

    console.log('✅ Search completed:', {
      query: q,
      resultsCount: students.length,
      executionTime: Date.now()
    });

    // Log results (without sensitive data)
    students.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.firstName} ${student.secondName} (${student.email})`);
    });

    res.json({
      success: true,
      data: students,
      query: q,
      count: students.length
    });
  } catch (error) {
    console.error('💥 Student search error:', {
      error: error.message,
      stack: error.stack,
      query: req.query.q
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during student search',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Search failed'
    });
  }
};

// Get group statistics
const getGroupStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    const totalGroups = await Group.countDocuments({
      createdBy: adminId,
      isActive: true
    });

    const totalStudents = await Group.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(adminId), isActive: true } },
      { $unwind: '$students' },
      { $group: { _id: null, uniqueStudents: { $addToSet: '$students' } } },
      { $project: { count: { $size: '$uniqueStudents' } } }
    ]);

    const recentGroups = await Group.find({
      createdBy: adminId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('students', 'firstName secondName')
      .select('name studentCount createdAt');

    res.json({
      success: true,
      data: {
        totalGroups,
        totalStudents: totalStudents[0]?.count || 0,
        recentGroups
      }
    });
  } catch (error) {
    console.error('Error fetching group stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send chat message to group
const sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, messageType = 'text', attachment } = req.body;

    const group = await Group.findById(id).populate('students', '_id');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin or member
    const isAdmin = group.createdBy.toString() === userId;
    const isMember = group.students.some(student => student._id.toString() === userId);
    
    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if students are allowed to send messages
    if (!isAdmin && !group.settings.allowStudentMessages) {
      return res.status(403).json({
        success: false,
        message: 'Students are not allowed to send messages in this group'
      });
    }

    const messageData = {
      content,
      sender: userId,
      messageType,
      attachment: attachment || null
    };

    await group.addChatMessage(messageData);
    await group.populate('chatMessages.sender', 'firstName secondName userEmail role');

    // Get the newly added message
    const newMessage = group.chatMessages[group.chatMessages.length - 1];

    // Emit the message to all users in the group room
    const io = req.app.get('io');
    if (io) {
      io.to(`group_${id}`).emit('new-message', {
        groupId: id,
        message: newMessage
      });
      console.log(`📨 Message sent to group room: group_${id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get chat messages for a group
const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const group = await Group.findById(id).populate('students', '_id');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin or member
    const isAdmin = group.createdBy.toString() === userId;
    const isMember = group.students.some(student => student._id.toString() === userId);
    
    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await group.populate('chatMessages.sender', 'firstName secondName userEmail role');
    const messages = group.getRecentMessages(parseInt(limit));

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update group chat settings
const updateChatSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { allowStudentMessages } = req.body;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    group.settings.allowStudentMessages = allowStudentMessages;
    await group.save();

    res.json({
      success: true,
      message: 'Chat settings updated successfully',
      data: group.settings
    });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Edit announcement
const editAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id, announcementId } = req.params;
    const adminId = req.user.id;
    const { title, content, isImportant = false, link } = req.body;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    const announcement = group.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.title = title;
    announcement.content = content;
    announcement.isImportant = isImportant;
    announcement.link = link || null;

    await group.save();
    await group.populate('announcements.createdBy', 'firstName secondName userEmail');

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Error editing announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id, announcementId } = req.params;
    const adminId = req.user.id;

    const group = await Group.findOne({
      _id: id,
      createdBy: adminId,
      isActive: true
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or access denied'
      });
    }

    const announcement = group.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.deleteOne();
    await group.save();

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createGroup,
  getAdminGroups,
  getStudentGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  removeStudentFromGroup,
  addAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  searchStudents,
  getGroupStats,
  sendChatMessage,
  getChatMessages,
  updateChatSettings
};
