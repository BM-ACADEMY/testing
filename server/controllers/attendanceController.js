const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');

// @desc    Get attendance logs
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
    // If HR/CEO, return all (or filtered). If Employee, return own.
    let query = {};

    if (req.user.role === 'Employee' || req.user.role === 'Intern') {
        query.user = req.user.id;
    }

    // TODO: Add date range filters if in query params

    const attendance = await Attendance.find(query)
        .populate('user', 'name email shift')
        .sort({ date: -1 });

    res.json(attendance);
});

// @desc    Mark attendance (Check-in/out, Lunch)
// @route   POST /api/attendance/mark
// @access  Private (Employee)
const markAttendance = asyncHandler(async (req, res) => {
    // Logic for marking attendance
    // ... (This logic likely needs careful implementation based on shift rules)
    // For now, simple check-in/out logic

    // This is complex logic, previously we might have just stubbed it or implemented partial
    // Let's ensure minimal working version
    const { type } = req.body; // 'login', 'lunchOut', 'lunchIn', 'logout'
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
        user: req.user.id,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (!attendance) {
        if (type !== 'login') {
            res.status(400);
            throw new Error('Must login first');
        }
        attendance = await Attendance.create({
            user: req.user.id,
            date: startOfDay,
            loginTime: new Date(),
            status: 'Present',
            // We need to calculate Late status here based on Shift
        });
    } else {
        if (type === 'logout') {
            attendance.logoutTime = new Date();
        } else if (type === 'lunchOut') {
            const now = new Date();
            attendance.lunchOut = now;
            attendance.lunchOutTime = now; // Also save to legacy field
        } else if (type === 'lunchIn') {
            const now = new Date();
            attendance.lunchIn = now;
            attendance.lunchInTime = now; // Also save to legacy field
        }
        await attendance.save();
    }

    // Emit socket event
    const io = req.app.get('socketio');
    io.emit('attendanceUpdate', attendance);

    res.json(attendance);
});

// @desc    Get today's attendance for current user
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We must find one that matches exact date or just today's date range
    // Since we store date as midnight in `markAttendance`, this should work
    // But to be safe lets use range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
        user: req.user.id,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    res.json(attendance || {});
});

module.exports = {
    getAttendance,
    markAttendance,
    getTodayAttendance
};
