import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { formatDuration } from '../../utils/timeFormat';
import { useAuth } from '../../context/AuthContext';

const PermissionAnalytics = () => {
    const { userId } = useParams(); // If HR/CEO viewing specific user
    const { user, loading: authLoading } = useAuth(); // Current user
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalLateCount: 0,
        totalLateMinutes: 0,
        avgLateMinutes: 0,
        lateLoginCount: 0,
        lunchExceededCount: 0
    });

    const targetUserId = userId || user?._id;

    useEffect(() => {
        if (targetUserId) {
            fetchAttendanceHistory();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [targetUserId, authLoading]);

    const fetchAttendanceHistory = async () => {
        try {
            // Fetch all attendance for this user
            // In a real app we might want a specific endpoint for analytics or date range
            // Reuse existing endpoint but filter manually or add query param if backed supports it
            const { data } = await api.get('/attendance');

            // Filter for the specific user if data contains all users (e.g. if HR endpoint returns all)
            // But /attendance endpoint usually returns based on role.
            // If HR calls /attendance it gets ALL. If Employee calls it gets OWN.
            // We need to support HR viewing specific employee.
            // We might need to ensure backend supports filtering by ?user=ID for HR.
            // For now, let's assume if we are HR we can filter the result.

            let userRecords = data;
            if (userId && data.length > 0 && data[0].user?._id) {
                userRecords = data.filter(r => r.user._id === userId || r.user === userId);
            }

            // Filter for records with ANY permission (late or lunch exceeded)
            // AND belonging to the current month to match Dashboard stats
            const currentMonth = dayjs().month();
            const currentYear = dayjs().year();

            const permissionRecords = userRecords.filter(r => {
                const recordDate = dayjs(r.date);
                const isCurrentMonth = recordDate.month() === currentMonth && recordDate.year() === currentYear;
                const hasPermission = (r.lateMinutes > 0 || r.lunchExceededMinutes > 0);
                return isCurrentMonth && hasPermission;
            });

            // Calculate Stats
            const totalLateMins = permissionRecords.reduce((acc, curr) => acc + (curr.totalPermissionMinutes || 0), 0);
            const lateLogins = permissionRecords.filter(r => (r.lateMinutes || 0) > 0).length;
            const lunchExceeds = permissionRecords.filter(r => (r.lunchExceededMinutes || 0) > 0).length;

            setStats({
                totalLateCount: permissionRecords.length,
                totalLateMinutes: totalLateMins,
                avgLateMinutes: permissionRecords.length ? Math.round(totalLateMins / permissionRecords.length) : 0,
                lateLoginCount: lateLogins,
                lunchExceededCount: lunchExceeds
            });

            setAttendance(permissionRecords.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) return <div className="p-8 text-center">Loading analytics...</div>;

    if (!targetUserId) return <div className="p-8 text-center text-red-500">User not found.</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-5xl mx-auto"
        >
            <div className="flex items-center gap-4">
                <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permission Analytics ({dayjs().format('MMMM')})</h1>
                    <p className="text-gray-500">Detailed breakdown of late arrivals and extended breaks for this month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Total Permission Time</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{formatDuration(stats.totalLateMinutes)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Late Logins</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.lateLoginCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Lunch Exceeded</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.lunchExceededCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">Avg. Permission / Instance</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatDuration(stats.avgLateMinutes)}</h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">History</h3>
                    <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full">
                        {attendance.length} Records
                    </span>
                </div>

                {attendance.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                        <p className="font-medium text-gray-900">Perfect Record!</p>
                        <p>No late arrivals or extended breaks found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {attendance.map((record) => (
                            <div key={record._id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{dayjs(record.date).format('MMMM DD, YYYY')}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {dayjs(record.date).format('dddd')}
                                            </span>
                                            <span>•</span>
                                            <span>{record.shiftName || 'Shift'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 md:gap-6">
                                    {(record.lateMinutes || 0) > 0 && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-medium uppercase">Login Late</span>
                                            <span className="font-mono font-medium text-gray-800">
                                                {formatDuration(record.lateMinutes)}
                                            </span>
                                        </div>
                                    )}
                                    {(record.lunchExceededMinutes || 0) > 0 && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 font-medium uppercase">Lunch Extra</span>
                                            <span className="font-mono font-medium text-gray-800">
                                                {formatDuration(record.lunchExceededMinutes)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-end min-w-[80px]">
                                        <span className="text-xs text-gray-400 font-medium uppercase">Total</span>
                                        <span className="font-mono font-bold text-red-600 text-lg">
                                            {formatDuration(record.totalPermissionMinutes)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
export default PermissionAnalytics;
