const asyncHandler = require('express-async-handler');
const Permission = require('../models/Permission');
const Attendance = require('../models/Attendance');

// @desc    Request Permission
// @route   POST /api/permissions
// @access  Private (Employee)
const requestPermission = asyncHandler(async (req, res) => {
    const { date, startTime, endTime, reason } = req.body;

    if (!date || !startTime || !endTime || !reason) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    // Calculate duration
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const durationMinutes = (end - start) / 60000;

    if (durationMinutes <= 0) {
        res.status(400);
        throw new Error('Invalid time duration');
    }

    // Permission Limit: Max 3 Hours (180 Minutes)
    if (durationMinutes > 180) {
        res.status(400);
        throw new Error('Permission cannot exceed 3 hours. Please apply for Half-Day or Leave.');
    }

    const permission = await Permission.create({
        user: req.user.id,
        date,
        startTime,
        endTime,
        durationMinutes,
        reason,
        status: 'Pending'
    });

    res.status(201).json(permission);
});

// @desc    Get Permissions
// @route   GET /api/permissions
// @access  Private
const getPermissions = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role === 'Employee' || req.user.role === 'Intern') {
        query.user = req.user.id;
    }

    const permissions = await Permission.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.json(permissions);
});

// @desc    Update Permission Status (Admin)
// @route   PUT /api/permissions/:id/status
// @access  Private (HR/CEO)
const updatePermissionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
        res.status(404);
        throw new Error('Permission not found');
    }

    permission.status = status;
    permission.approvedBy = req.user.id;
    await permission.save();

    // If approved, update Attendance for that day
    if (status === 'Approved') {
        const startOfDay = new Date(permission.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(permission.date);
        endOfDay.setHours(23, 59, 59, 999);

        // Find or Create Attendance Logic
        // We need to support cases where user hasn't clocked in yet (Permission before work)
        // So we use findOneAndUpdate with upsert option suitable for this context.
        // However, usually permission attaches to existing or creates a skeleton.

        let attendance = await Attendance.findOne({
            user: permission.user,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!attendance) {
            // Create a skeleton attendance record if none exists
            attendance = await Attendance.create({
                user: permission.user,
                date: startOfDay,
                status: 'Present', // Default to Present if they have permission to be away part time
                // shiftName could be fetched but let's leave optional or fetch user
                totalPermissionMinutes: 0
            });
        }

        // Recalculate Total Permission
        const allPermissions = await Permission.find({
            user: permission.user,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: 'Approved'
        });

        const totalShortPermission = allPermissions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

        attendance.totalPermissionMinutes =
            (attendance.lateMinutes || 0) +
            (attendance.lunchExceededMinutes || 0) +
            totalShortPermission;

        // Note: We don't change status to Half-Day here based on 3hr limit because
        // we already enforce Max 3hr per permission.
        // If they take multiple permissions > 3hrs total, then yes, loop above logic check:

        if (attendance.totalPermissionMinutes > 180) {
            attendance.isHalfDay = true;
            attendance.status = 'Half-Day';
        }

        await attendance.save();
    }

    res.json(permission);
});

module.exports = {
    requestPermission,
    getPermissions,
    updatePermissionStatus
};
