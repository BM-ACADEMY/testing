const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance'); // If needed for impact
const User = require('../models/User');
const dayjs = require('dayjs');

// @desc    Apply for Leave
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = asyncHandler(async (req, res) => {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    // Default to Loss of Pay until approved/adjusted
    const leave = await Leave.create({
        user: req.user.id,
        startDate,
        endDate,
        reason,
        status: 'Pending'
    });

    res.status(201).json(leave);
});

// @desc    Get all leaves (Admin) or My Leaves (Employee)
// @route   GET /api/leaves
// @access  Private
const getLeaves = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'Employee' || req.user.role === 'Intern') {
        query.user = req.user.id;
    }

    const leaves = await Leave.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(leaves);
});

// @desc    Approve/Reject Leave (Admin)
// @route   PUT /api/leaves/:id/status
// @access  Private (HR/CEO)
const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'Approved', 'Rejected'
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
        res.status(404);
        throw new Error('Leave not found');
    }

    leave.status = status;
    leave.approvedBy = req.user.id;

    // Calculate LOP Days if Approved
    if (status === 'Approved') {
        let totalLop = 0;
        let current = dayjs(leave.startDate);
        const end = dayjs(leave.endDate);

        while (current.isBefore(end) || current.isSame(end, 'day')) {
            const dayOfWeek = current.day(); // 0=Sunday, 1=Monday... 6=Saturday

            // Exclude Sunday (0)
            if (dayOfWeek !== 0) {
                // Check Special LOP Rule: Monday (1) or Saturday (6) => 2 Days LOP
                if (dayOfWeek === 1 || dayOfWeek === 6) {
                    totalLop += 2;
                } else {
                    totalLop += 1;
                }

                // Also create/update Attendance record for this day as 'On-Leave'
                // This ensures daily reports show them as on leave
                // NOTE: This might duplicate if user already clocked in, but assuming standard flow:
                // User applies leave -> Admin approves -> Attendance marked for future or past
                // For simplicity, we won't auto-create attendance here to avoid overwrite risks without more checks
                // But in a real system we would likely upsert an Attendance record with status 'On-Leave'
            }
            current = current.add(1, 'day');
        }
        leave.lopDays = totalLop;
    } else {
        leave.lopDays = 0;
    }

    await leave.save();
    res.json(leave);
});

module.exports = {
    applyLeave,
    getLeaves,
    updateLeaveStatus
};
