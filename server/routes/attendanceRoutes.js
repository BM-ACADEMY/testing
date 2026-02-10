const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getTodayAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAttendance);

router.route('/today')
    .get(protect, getTodayAttendance);

router.route('/mark')
    .post(protect, markAttendance);

module.exports = router;
