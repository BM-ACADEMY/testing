const express = require('express');
const router = express.Router();
const { getShifts, createShift, updateShift, deleteShift } = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getShifts)
    .post(protect, authorize('HR', 'CEO'), createShift);

router.route('/:id')
    .put(protect, authorize('HR', 'CEO'), updateShift)
    .delete(protect, authorize('HR', 'CEO'), deleteShift);

module.exports = router;
