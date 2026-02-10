const asyncHandler = require('express-async-handler');
const CompanyHoliday = require('../models/CompanyHoliday');
const dayjs = require('dayjs');

// @desc    Get all company holidays
// @route   GET /api/holidays
// @access  Private
const getHolidays = asyncHandler(async (req, res) => {
    const holidays = await CompanyHoliday.find({})
        .populate('createdBy', 'name email')
        .sort({ date: 1 });
    res.json(holidays);
});

// @desc    Get holidays for specific month
// @route   GET /api/holidays/month/:year/:month
// @access  Private
const getHolidaysByMonth = asyncHandler(async (req, res) => {
    const { year, month } = req.params;

    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

    const holidays = await CompanyHoliday.find({
        date: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('createdBy', 'name email').sort({ date: 1 });

    res.json(holidays);
});

// @desc    Check if a date is a holiday
// @route   GET /api/holidays/check/:date
// @access  Private
const checkHoliday = asyncHandler(async (req, res) => {
    const { date } = req.params;

    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const holiday = await CompanyHoliday.findOne({
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    res.json({ isHoliday: !!holiday, holiday });
});

// @desc    Create new company holiday
// @route   POST /api/holidays
// @access  Private (HR/CEO)
const createHoliday = asyncHandler(async (req, res) => {
    // Only HR and CEO can create holidays
    if (req.user.role !== 'HR' && req.user.role !== 'CEO') {
        res.status(403);
        throw new Error('Not authorized to create holidays');
    }

    const { date, name, description, type, isRecurring } = req.body;

    if (!date || !name) {
        res.status(400);
        throw new Error('Please provide date and name');
    }

    // Check if holiday already exists on this date
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();

    const existingHoliday = await CompanyHoliday.findOne({
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (existingHoliday) {
        res.status(400);
        throw new Error('A holiday already exists on this date');
    }

    const holiday = await CompanyHoliday.create({
        date: dayjs(date).toDate(),
        name,
        description: description || '',
        type: type || 'Public Holiday',
        isRecurring: isRecurring || false,
        createdBy: req.user.id
    });

    const populatedHoliday = await CompanyHoliday.findById(holiday._id)
        .populate('createdBy', 'name email');

    res.status(201).json(populatedHoliday);
});

// @desc    Update company holiday
// @route   PUT /api/holidays/:id
// @access  Private (HR/CEO)
const updateHoliday = asyncHandler(async (req, res) => {
    if (req.user.role !== 'HR' && req.user.role !== 'CEO') {
        res.status(403);
        throw new Error('Not authorized to update holidays');
    }

    const holiday = await CompanyHoliday.findById(req.params.id);

    if (!holiday) {
        res.status(404);
        throw new Error('Holiday not found');
    }

    const updatedHoliday = await CompanyHoliday.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    ).populate('createdBy', 'name email');

    res.json(updatedHoliday);
});

// @desc    Delete company holiday
// @route   DELETE /api/holidays/:id
// @access  Private (HR/CEO)
const deleteHoliday = asyncHandler(async (req, res) => {
    if (req.user.role !== 'HR' && req.user.role !== 'CEO') {
        res.status(403);
        throw new Error('Not authorized to delete holidays');
    }

    const holiday = await CompanyHoliday.findById(req.params.id);

    if (!holiday) {
        res.status(404);
        throw new Error('Holiday not found');
    }

    await holiday.deleteOne();

    res.json({ id: req.params.id, message: 'Holiday deleted' });
});

module.exports = {
    getHolidays,
    getHolidaysByMonth,
    checkHoliday,
    createHoliday,
    updateHoliday,
    deleteHoliday
};
