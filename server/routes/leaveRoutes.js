const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus, checkLeaveToday } = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming admin middleware exists or similar role check

router.route('/')
    .post(protect, applyLeave)
    .get(protect, getLeaves);

router.route('/check-today')
    .get(protect, checkLeaveToday);

router.route('/:id/status')
    .put(protect, updateLeaveStatus); // Add admin check if middleware available

module.exports = router;
