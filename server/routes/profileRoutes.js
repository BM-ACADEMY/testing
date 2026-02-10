const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getProfile, updateProfile, uploadProfileImage, deleteProfileImage } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes require authentication
router.route('/')
    .get(protect, getProfile)
    .put(protect, updateProfile);

// Image upload/delete routes
router.post('/image', protect, upload.single('profileImage'), uploadProfileImage);
router.delete('/image', protect, deleteProfileImage);

module.exports = router;
