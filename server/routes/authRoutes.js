const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// router.post('/register', registerUser); // REMOVED PUBLIC REGISTER
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
