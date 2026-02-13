const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Permission = require('../models/Permission');
const dayjs = require('dayjs');

// @desc    Get dashboard stats for HR/CEO
// @route   GET /api/dashboard/stats
// @access  Private (HR/CEO)
const getDashboardStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Total Employees
    const totalEmployees = await User.countDocuments({
        role: { $in: ['Employee', 'Intern'] },
        isActive: true
    });

    // Today's Attendance Stats
    const todayAttendance = await Attendance.find({
        date: { $gte: today, $lte: endOfDay }
    });

    const presentToday = todayAttendance.filter(a => a.status === 'Present' || a.loginTime).length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.lateMinutes > 0).length;
    const onLeaveToday = todayAttendance.filter(a => a.status === 'On-Leave').length;

    // Pending Requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const pendingPermissions = await Permission.countDocuments({ status: 'Pending' });

    // This Month Stats
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    const monthlyAttendance = await Attendance.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalWorkingDays = dayjs().date(); // Days passed this month
    const avgAttendanceRate = totalEmployees > 0
        ? ((monthlyAttendance.filter(a => a.status === 'Present' || a.loginTime).length / (totalEmployees * totalWorkingDays)) * 100).toFixed(1)
        : 0;

    // Recent Leaves
    const recentLeaves = await Leave.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

    // Recent Permissions
    const recentPermissions = await Permission.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

    // Department/Role Distribution
    const roleDistribution = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Monthly Attendance Trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day').startOf('day').toDate();
        const nextDate = dayjs().subtract(i, 'day').endOf('day').toDate();

        const dayAttendance = await Attendance.countDocuments({
            date: { $gte: date, $lte: nextDate },
            $or: [{ status: 'Present' }, { loginTime: { $exists: true } }]
        });

        last7Days.push({
            date: dayjs(date).format('MMM DD'),
            count: dayAttendance
        });
    }

    res.json({
        overview: {
            totalEmployees,
            presentToday,
            absentToday,
            lateToday,
            onLeaveToday,
            avgAttendanceRate: parseFloat(avgAttendanceRate)
        },
        pendingRequests: {
            leaves: pendingLeaves,
            permissions: pendingPermissions,
            total: pendingLeaves + pendingPermissions
        },
        recentActivity: {
            leaves: recentLeaves,
            permissions: recentPermissions
        },
        roleDistribution,
        attendanceTrend: last7Days
    });
});

module.exports = {
    getDashboardStats
};
