const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/stats
// @access  Private (HR/CEO)
router.get('/stats', protect, authorize('HR', 'CEO'), getDashboardStats);

module.exports = router;
