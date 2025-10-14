const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/upload-controller');

// Upload image route
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

module.exports = router;
