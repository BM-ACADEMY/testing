const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { calculateLateMinutes, calculateLunchExceeded } = require('../utils/attendanceUtils');

// @desc    Get attendance logs
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
    // If HR/CEO, return all (or filtered). If Employee, return own.
    let query = {};

    if (req.user.role === 'Employee' || req.user.role === 'Intern') {
        query.user = req.user.id;
    }


    // Date Range Filtering
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }


    const attendance = await Attendance.find(query)
        .populate('user', 'name email shift')
        .sort({ date: -1 });

    res.json(attendance);
});

// @desc    Mark attendance (Check-in/out, Lunch)
// @route   POST /api/attendance/mark
// @access  Private (Employee)
const markAttendance = asyncHandler(async (req, res) => {
    const { type } = req.body; // 'login', 'lunchOut', 'lunchIn', 'logout'
    const userId = req.user.id;

    // Get User and Shift details
    const user = await User.findById(userId).populate('shift');
    if (!user || !user.shift) {
        res.status(400);
        throw new Error('User not found or no shift assigned');
    }

    const shift = user.shift;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
        user: userId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    const now = new Date();

    if (!attendance) {
        // --- CHECK IN LOGIC ---
        if (type !== 'login') {
            res.status(400);
            throw new Error('Must login first');
        }

        // Calculate Late Minutes
        const lateMinutes = calculateLateMinutes(now, shift.loginTime, shift.graceTime);
        console.log(`[Attendance] Login: ${now.toLocaleTimeString()}, Shift: ${shift.loginTime}, Grace: ${shift.graceTime}, Late: ${lateMinutes}`);

        attendance = await Attendance.create({
            user: userId,
            date: startOfDay,
            shiftName: shift.name,
            loginTime: now,
            lateMinutes: lateMinutes,
            status: 'Present',
            totalPermissionMinutes: lateMinutes // Initially just late minutes
        });
    } else {
        // --- UPDATE EXISTING RECORD ---

        // Check if this is a leave day and user hasn't confirmed override
        if (type === 'login' && attendance.status === 'On-Leave' && !req.body.overrideLeave) {
            res.status(403);
            throw new Error('You have approved leave today. Please confirm to override.');
        }

        // If overriding leave, update the record and also update the leave record
        if (type === 'login' && attendance.status === 'On-Leave' && req.body.overrideLeave) {
            const lateMinutes = calculateLateMinutes(now, shift.loginTime, shift.graceTime);
            attendance.loginTime = now;
            attendance.lateMinutes = lateMinutes;
            attendance.status = 'Present';
            attendance.shiftName = shift.name;
            attendance.totalPermissionMinutes = lateMinutes;
            attendance.overrideReason = req.body.overrideReason || 'No reason provided'; // Store reason

            // Also update the leave record with override reason
            const Leave = require('../models/Leave');
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            await Leave.findOneAndUpdate(
                {
                    user: userId,
                    startDate: { $lte: endOfDay },
                    endDate: { $gte: startOfDay },
                    status: 'Approved'
                },
                {
                    $set: { overrideReason: req.body.overrideReason || 'No reason provided' }
                }
            );
        } else if (type === 'logout') {
            attendance.logoutTime = now;
            // TODO: Could check for early logout if needed, for now just save
        } else if (type === 'lunchOut') {
            attendance.lunchOut = now;
            attendance.lunchOutTime = now;
        } else if (type === 'lunchIn') {
            attendance.lunchIn = now;
            attendance.lunchInTime = now;

            // Calculate Lunch Exceeded
            if (attendance.lunchOut) {
                const exceeded = calculateLunchExceeded(attendance.lunchOut, now, shift.lunchDuration);
                attendance.lunchExceededMinutes = exceeded;
            }
        }

        // Recalculate Total Permissions (Late + Lunch Exceeded + EXISTING short permissions if any)
        // Note: Short permissions are stored in a separate collection usually,
        // but for summary we store total in attendance.
        // We will assume for now we just sum Late + Lunch.
        // Ideally we query Permission model here too.

        attendance.totalPermissionMinutes =
            (attendance.lateMinutes || 0) +
            (attendance.lunchExceededMinutes || 0);
        // + (approvedShortPermissionMinutes || 0); // Future integration point

        // Check for Half Day Penalty (> 180 mins)
        if (attendance.totalPermissionMinutes > 180) {
            attendance.isHalfDay = true;
            attendance.status = 'Half-Day';
        }

        await attendance.save();
    }

    // Populate user info for frontend display before emitting
    const populatedAttendance = await Attendance.findById(attendance._id).populate('user', 'name emali profileImage');

    // Real-time Update via Socket.io
    const io = req.app.get('socketio');
    io.emit('attendanceUpdate', populatedAttendance);

    res.json(populatedAttendance);
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

// @desc    Get monthly attendance summary
// @route   GET /api/attendance/summary/:month/:year
// @access  Private
const getMonthlySummary = asyncHandler(async (req, res) => {
    const { month, year } = req.params;
    const userId = req.user.id; // Or from query if Admin

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendance = await Attendance.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate }
    });

    // Calculate Summary
    let totalPresents = 0;
    let totalAbsents = 0;
    let totalLates = 0;
    let totalHalfDays = 0;
    let totalLopDays = 0;

    let totalPermissionMinutes = 0;

    attendance.forEach(record => {
        if (record.status === 'Present') totalPresents++;
        if (record.status === 'Absent') totalAbsents++;
        if (record.lateMinutes > 0) totalLates++;
        if (record.status === 'Half-Day' || record.isHalfDay) totalHalfDays++;
        if (record.lopCount > 0 || record.status === 'On-Leave') totalLopDays += (record.lopDays || 0);

        // Sum total permissions
        totalPermissionMinutes += (record.totalPermissionMinutes || 0);
    });

    res.json({
        month,
        year,
        stats: {
            presents: totalPresents,
            absents: totalAbsents,
            lates: totalLates,
            halfDays: totalHalfDays,
            lates: totalLates,
            halfDays: totalHalfDays,
            lopDays: totalLopDays,
            totalPermissionMinutes // Send to frontend
        },
        records: attendance
    });
});

module.exports = {
    getAttendance,
    markAttendance,
    getTodayAttendance,
    getMonthlySummary
};
