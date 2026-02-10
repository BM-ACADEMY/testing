const asyncHandler = require('express-async-handler');
const Shift = require('../models/Shift');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private (HR/CEO)
const getShifts = asyncHandler(async (req, res) => {
    // Both HR and CEO should be able to see shifts
    // HR needs it to assign to employees
    // CEO needs it for analytics if needed
    const shifts = await Shift.find({});
    res.json(shifts);
});

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (HR/CEO)
const createShift = asyncHandler(async (req, res) => {
    // Only HR and CEO can create shifts
    if (req.user.role !== 'HR' && req.user.role !== 'CEO') {
        res.status(403);
        throw new Error('Not authorized');
    }
    const { name, loginTime, graceTime, lunchStartTime, lunchDuration, logoutTime } = req.body;

    if (!name || !loginTime || !logoutTime) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    const shift = await Shift.create({
        name,
        loginTime,
        graceTime,
        lunchStartTime,
        lunchDuration,
        logoutTime,
    });

    res.status(201).json(shift);
});

// @desc    Update a shift
// @route   PUT /api/shifts/:id
// @access  Private (HR)
const updateShift = asyncHandler(async (req, res) => {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
        res.status(404);
        throw new Error('Shift not found');
    }

    const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.json(updatedShift);
});

// @desc    Delete a shift (soft delete or hard delete?)
// @route   DELETE /api/shifts/:id
// @access  Private (HR)
const deleteShift = asyncHandler(async (req, res) => {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
        res.status(404);
        throw new Error('Shift not found');
    }

    await shift.deleteOne();

    res.json({ id: req.params.id });
});

module.exports = {
    getShifts,
    createShift,
    updateShift,
    deleteShift,
};
