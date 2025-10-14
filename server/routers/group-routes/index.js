const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../../middleware/auth');
const {
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
} = require('../../controllers/group-controller/index');

// Validation middleware
const groupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('coverImage')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        // Allow both full URLs and local file paths
        const urlPattern = /^https?:\/\/.+/;
        const localPathPattern = /^\/uploads\/.+/;
        if (!urlPattern.test(value) && !localPathPattern.test(value)) {
          throw new Error('Cover image must be a valid URL or local file path');
        }
      }
      return true;
    }),
  body('settings')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        throw new Error('Settings must be an object');
      }
      return true;
    })
];

const announcementValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Content must be between 10 and 1000 characters'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean')
];

// Admin routes
router.get('/admin/stats', authenticateToken, getGroupStats);
router.get('/admin/groups', authenticateToken, getAdminGroups);
router.post('/admin/groups', authenticateToken, groupValidation, createGroup);
router.get('/admin/groups/:id', authenticateToken, getGroupById);
router.put('/admin/groups/:id', authenticateToken, groupValidation, updateGroup);
router.delete('/admin/groups/:id', authenticateToken, deleteGroup);

// Student management routes
router.post('/admin/groups/:id/students', authenticateToken, addStudentsToGroup);
router.delete('/admin/groups/:id/students/:studentId', authenticateToken, removeStudentFromGroup);
router.get('/admin/students/search', authenticateToken, searchStudents);

// Announcement routes
router.post('/admin/groups/:id/announcements', authenticateToken, announcementValidation, addAnnouncement);
router.put('/admin/groups/:id/announcements/:announcementId', authenticateToken, announcementValidation, editAnnouncement);
router.delete('/admin/groups/:id/announcements/:announcementId', authenticateToken, deleteAnnouncement);

// Student routes
router.get('/student/groups', authenticateToken, getStudentGroups);
router.get('/student/groups/:id', authenticateToken, getGroupById);

// Chat routes
router.post('/:id/chat/messages', authenticateToken, sendChatMessage);
router.get('/:id/chat/messages', authenticateToken, getChatMessages);
router.put('/:id/chat/settings', authenticateToken, updateChatSettings);

module.exports = router;
