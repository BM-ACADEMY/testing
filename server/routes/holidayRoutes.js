const express = require('express');
const router = express.Router();
const {
    getHolidays,
    getHolidaysByMonth,
    checkHoliday,
    createHoliday,
    updateHoliday,
    deleteHoliday
} = require('../controllers/holidayController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all holidays
router.get('/', getHolidays);

// Get holidays by month
router.get('/month/:year/:month', getHolidaysByMonth);

// Check if specific date is holiday
router.get('/check/:date', checkHoliday);

// Create new holiday (HR/CEO only)
router.post('/', createHoliday);

// Update holiday (HR/CEO only)
router.put('/:id', updateHoliday);

// Delete holiday (HR/CEO only)
router.delete('/:id', deleteHoliday);

module.exports = router;
