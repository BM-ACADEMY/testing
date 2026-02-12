import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Coffee,
    LogOut,
    CheckCircle,
    FileText,
    Calendar,
    Briefcase,
    Activity,
    AlertCircle,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import dayjs from 'dayjs';
import { formatDuration } from '../../utils/timeFormat';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import ApplyLeaveModal from '../../components/modals/ApplyLeaveModal';
import ApplyPermissionModal from '../../components/modals/ApplyPermissionModal';


const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true); // Added to track initial data fetch
    const [attendance, setAttendance] = useState(null);
    const [todayActivity, setTodayActivity] = useState([]);
    const [stats, setStats] = useState({ presents: 0, lates: 0, absents: 0, halfDays: 0, lopDays: 0 });
    const [leaveModalVisible, setLeaveModalVisible] = useState(false);
    const [permissionModalVisible, setPermissionModalVisible] = useState(false);

    // Add missing recentRequests state and fetches from previous implementation
    const [recentRequests, setRecentRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            const [leavesRes, permissionsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/permissions')
            ]);

            const leaves = leavesRes.data.map(l => ({
                id: l._id,
                type: l.type || 'Leave',
                status: l.status,
                dates: `${dayjs(l.startDate).format('DD MMM')} - ${dayjs(l.endDate).format('DD MMM, YYYY')}`,
                user: l.user.name || user.name,
                createdAt: l.createdAt
            }));

            const permissions = permissionsRes.data.map(p => ({
                id: p._id,
                type: 'Permission',
                status: p.status,
                dates: `${dayjs(p.date).format('DD MMM, YYYY')} (${p.startTime} - ${p.endTime})`,
                user: p.user.name || user.name,
                createdAt: p.createdAt
            }));

            // Combine and sort by newest first
            const combined = [...leaves, ...permissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentRequests(combined.slice(0, 5)); // Show top 5
        } catch (error) {
            console.error("Error fetching requests", error);
        }
    };

    const fetchStats = async () => {
        try {
            const today = dayjs();
            const { data } = await api.get(`/attendance/summary/${today.month() + 1}/${today.year()}`);
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/today');
            setAttendance(data);
            updateTimeline(data);
        } catch (error) {
            console.error("Error fetching attendance", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const updateTimeline = (data) => {
        if (!data) return;
        const items = [];
        if (data.loginTime) items.push({
            type: 'checkIn',
            time: dayjs(data.loginTime).format('hh:mm A'),
            label: 'Checked In',
            color: 'bg-green-100 text-green-600',
            icon: <Clock size={16} />
        });
        if (data.lunchOut || data.lunchOutTime) items.push({
            type: 'lunchOut',
            time: dayjs(data.lunchOut || data.lunchOutTime).format('hh:mm A'),
            label: 'Lunch Break',
            color: 'bg-orange-100 text-orange-600',
            icon: <Coffee size={16} />
        });
        if (data.lunchIn || data.lunchInTime) items.push({
            type: 'lunchIn',
            time: dayjs(data.lunchIn || data.lunchInTime).format('hh:mm A'),
            label: 'Back from Lunch',
            color: 'bg-blue-100 text-blue-600',
            icon: <Coffee size={16} />
        });
        if (data.logoutTime) items.push({
            type: 'checkOut',
            time: dayjs(data.logoutTime).format('hh:mm A'),
            label: 'Checked Out',
            color: 'bg-red-100 text-red-600',
            icon: <LogOut size={16} />
        });
        setTodayActivity(items);
    };

    // Valid short beep sound (Base64)
    // Source: https://www.soundjay.com/buttons/sounds/button-3.mp3 (converted)
    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Audio play failed (interaction required?):', e));
        } catch (e) { console.error('Audio setup failed:', e); }
    };

    useEffect(() => {
        fetchTodayAttendance();
        fetchStats();
        fetchRequests();

        // Request Notification Permission on mount
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, [user]);

    // Separate Effect for Socket Connection (Stable)
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
        });

        socket.on('attendanceUpdate', (updatedAttendance) => {
            if (updatedAttendance.user === user._id || updatedAttendance.user._id === user._id) {
                setAttendance(updatedAttendance);
                updateTimeline(updatedAttendance);
                fetchStats();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user._id]); // Only re-connect if user ID changes

    // Separate Effect for Reminders (Depends on attendance state)
    const lastNotificationTime = React.useRef(null);

    useEffect(() => {
        const checkReminders = () => {
            if (!user?.shift || initialLoading) return; // Don't notify if user has no shift or data is loading

            const now = dayjs();
            const formatTime = (t) => dayjs(t, 'HH:mm');
            const currentMinuteKey = now.format('HH:mm');

            // Throttling: Check if we already notified this minute
            if (lastNotificationTime.current === currentMinuteKey) return;

            const sendNotification = (title, body) => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title, { body, icon: '/vite.svg' });
                    playNotificationSound();
                    lastNotificationTime.current = currentMinuteKey; // Mark as notified for this minute
                }
            };

            // Check Shift Start (Login)
            const shiftStart = formatTime(user.shift.loginTime);
            // Alert if it's the exact minute AND we haven't logged in
            if (!attendance?.loginTime && now.hour() === shiftStart.hour() && now.minute() === shiftStart.minute()) {
                sendNotification('Time to Check In!', `Your shift starts at ${user.shift.loginTime}. Please mark your attendance.`);
            }

            // Check Lunch Start
            if (user.shift.lunchStartTime) {
                const lunchStart = formatTime(user.shift.lunchStartTime);
                if (attendance?.loginTime && !attendance?.lunchOut && now.hour() === lunchStart.hour() && now.minute() === lunchStart.minute()) {
                    sendNotification('Lunch Time!', 'It\'s time for your lunch break using the system.');
                }
            }

            // Check Logout (Shift End)
            if (user.shift.logoutTime) {
                const logoutTime = formatTime(user.shift.logoutTime);
                // Only remind if logged in and NOT logged out yet
                if (attendance?.loginTime && !attendance?.logoutTime && now.hour() === logoutTime.hour() && now.minute() === logoutTime.minute()) {
                    sendNotification('Shift Completed!', 'Your shift has ended. Don\'t forget to Check Out.');
                }
            }
        };

        const reminderInterval = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check

        return () => clearInterval(reminderInterval);
    }, [user, attendance, initialLoading]); // Re-creates interval when attendance updates, which is fine/needed

    const handleMarkAttendance = async (type) => {
        setLoading(true);
        const backendType = type === 'checkIn' ? 'login' : (type === 'checkOut' ? 'logout' : type);

        try {
            const { data } = await api.post('/attendance/mark', { type: backendType });
            // Replaced message.success with console or custom toast logic (omitted for brevity, assume native alert or no-op)
            // console.log(`Marked ${type} successfully`);
            setAttendance(data);
            updateTimeline(data);
            fetchStats();
        } catch (error) {
            console.error(error);
            // message.error...
        }
        setLoading(false);
    };

    // Components
    const StatsCard = ({ title, value, icon, colorClass, bgClass }) => (
        <div className={`p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col items-center justify-center text-center`}>
            <div className={`p-3 rounded-full mb-3 ${bgClass} ${colorClass}`}>
                {icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        </div>
    );

    const ActionCard = ({ title, subtitle, icon, colorClass, gradientClass, onClick }) => (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-transparent ${gradientClass} group`}
        >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    {React.cloneElement(icon, { className: colorClass, size: 24 })}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">{title}</h4>
                    <p className="text-xs text-gray-600 font-medium">{subtitle}</p>
                </div>
            </div>
        </div>
    );

    // Helper to check if current time is within shift start time
    // We only restrict Check In. Logout is always enabled (as per req).
    const isShiftStarted = () => {
        if (!user?.shift) return true; // Fallback if no shift assigned
        // If shift logic is complex (e.g. night shift), detailed parsing needed.
        // For now, assume simple day comparison HH:mm
        // Parse current time
        const now = dayjs();
        const shiftStart = dayjs(user.shift.loginTime, 'HH:mm');

        // Set shift start to today
        const shiftStartToday = dayjs().set('hour', shiftStart.hour()).set('minute', shiftStart.minute());

        // Allow login if now >= shiftStart
        return now.isAfter(shiftStartToday) || now.isSame(shiftStartToday);
    };

    const LinkToAnalytics = () => navigate('/employee/permissions/analytics');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* ... Header ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Good Morning, {user?.name} 👋</h1>
                    <p className="text-gray-500">Here's what's happening today.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-400">{dayjs().format('dddd, DD MMMM YYYY')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Stats & Timeline) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatsCard
                            title="Presents"
                            value={stats.presents}
                            icon={<CheckCircle size={24} />}
                            bgClass="bg-emerald-50"
                            colorClass="text-emerald-600"
                        />
                        <div onClick={LinkToAnalytics} className="cursor-pointer">
                            <StatsCard
                                title="Lates"
                                value={stats.lates}
                                icon={<Clock size={24} />}
                                bgClass="bg-amber-50"
                                colorClass="text-amber-600"
                            />
                        </div>
                        <StatsCard
                            title="Half Days"
                            value={stats.halfDays}
                            icon={<Activity size={24} />}
                            bgClass="bg-violet-50"
                            colorClass="text-violet-600"
                        />
                        <div onClick={LinkToAnalytics} className="cursor-pointer">
                            <StatsCard
                                title="LOP Days"
                                value={stats.lopDays}
                                icon={<AlertCircle size={24} />}
                                bgClass="bg-rose-50"
                                colorClass="text-rose-600"
                            />
                        </div>

                        {/* New Permission Time Card */}
                        <div onClick={LinkToAnalytics} className="cursor-pointer md:col-span-4 lg:col-span-4">
                            <div className="p-4 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow bg-red-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-white text-red-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Total Permission Used</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                            {formatDuration(stats.totalPermissionMinutes || 0)}
                                        </h3>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <button className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">Today's Activity</h3>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                {dayjs().format('DD MMM')}
                            </span>
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-100">
                            {todayActivity.length > 0 ? todayActivity.map((activity, index) => (
                                <div key={index} className="relative flex items-center gap-4">
                                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${activity.color}`}>
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{activity.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{activity.time}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Clock size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>No activity recorded yet today.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Requests */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Recent Requests</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                        </div>
                        <div className="space-y-3">
                            {recentRequests.map(req => (
                                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                            {req.user.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 line-clamp-1">{req.user}</p>
                                            <p className="text-xs text-gray-500">{req.type} • {req.dates}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                        req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                            {recentRequests.length === 0 && (
                                <p className="text-gray-400 text-center py-4 text-sm">No recent requests.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column (Actions & Clock) */}
                <div className="space-y-6">

                    {/* Mark Attendance Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock size={120} className="text-blue-600" />
                        </div>

                        <div className="relative z-10 text-center mb-6">
                            <p className="text-gray-500 font-medium mb-1">Current Time</p>
                            <h2 className="text-4xl font-black text-gray-900 font-mono tracking-wider">
                                {dayjs().format('hh:mm A')}
                            </h2>
                        </div>

                        {/* Attendance Buttons */}
                        <div className="space-y-3 relative z-10">
                            {loading ? (
                                <div className="text-center py-4 text-blue-600">Processing...</div>
                            ) : (
                                <>
                                    {!attendance?.loginTime && (
                                        <button
                                            onClick={() => handleMarkAttendance('checkIn')}
                                            disabled={!isShiftStarted()}
                                            className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isShiftStarted()
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 active:scale-95'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            <Clock size={20} />
                                            {isShiftStarted() ? 'Check In' : `Check In starts at ${user?.shift?.loginTime || 'Unknown'}`}
                                        </button>
                                    )}

                                    {attendance?.loginTime && !attendance?.logoutTime && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {!(attendance?.lunchOut || attendance?.lunchOutTime) ? (
                                                <button
                                                    onClick={() => handleMarkAttendance('lunchOut')}
                                                    className="w-full py-3 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Coffee size={18} /> Lunch
                                                </button>
                                            ) : !(attendance?.lunchIn || attendance?.lunchInTime) ? (
                                                <button
                                                    onClick={() => handleMarkAttendance('lunchIn')}
                                                    className="w-full py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Coffee size={18} /> Return
                                                </button>
                                            ) : <div className="hidden"></div>}

                                            <button
                                                onClick={() => handleMarkAttendance('checkOut')}
                                                className="col-span-1 w-full py-3 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <LogOut size={18} /> Check Out
                                            </button>
                                        </div>
                                    )}

                                    {attendance?.logoutTime && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-bold border border-green-100 flex items-center justify-center gap-2">
                                            <CheckCircle size={20} /> Shift Completed
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <ActionCard
                                title="Apply Permission"
                                subtitle="Request short leave"
                                icon={<FileText />}
                                colorClass="text-emerald-600"
                                gradientClass="bg-gradient-to-r from-emerald-50/50 to-emerald-50 border-emerald-100"
                                onClick={() => setPermissionModalVisible(true)}
                            />
                            <ActionCard
                                title="Apply Leave"
                                subtitle="Request full day off"
                                icon={<Calendar />}
                                colorClass="text-blue-600"
                                gradientClass="bg-gradient-to-r from-blue-50/50 to-blue-50 border-blue-100"
                                onClick={() => setLeaveModalVisible(true)}
                            />
                            <ActionCard
                                title="On Duty"
                                subtitle="Work from outside"
                                icon={<Briefcase />}
                                colorClass="text-orange-600"
                                gradientClass="bg-gradient-to-r from-orange-50/50 to-orange-50 border-orange-100"
                                onClick={() => { }} // TODO: Implement OD Modal
                            />
                        </div>
                    </div>

                </div>
            </div>

            <ApplyLeaveModal
                visible={leaveModalVisible}
                onClose={() => setLeaveModalVisible(false)}
                onSuccess={() => { fetchStats(); fetchRequests(); }}
            />

            <ApplyPermissionModal
                visible={permissionModalVisible}
                onClose={() => setPermissionModalVisible(false)}
                onSuccess={() => { fetchStats(); fetchRequests(); }}
            />
        </motion.div>
    );
};

export default EmployeeDashboard;
