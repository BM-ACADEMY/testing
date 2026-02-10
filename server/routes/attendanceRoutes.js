const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, getTodayAttendance, getMonthlySummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAttendance);

router.route('/today')
    .get(protect, getTodayAttendance);

router.route('/mark')
    .post(protect, markAttendance);

router.route('/summary/:month/:year')
    .get(protect, getMonthlySummary);

module.exports = router;
