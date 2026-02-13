import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { formatLateTime, formatDuration } from '../../utils/timeFormat';

import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    // Socket.io Connection
    useEffect(() => {
        if (!user) return;

        const socket = io(import.meta.env.VITE_API_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
        });

        socket.on('attendanceUpdate', (updatedRecord) => {
            // Check if update is for this user
            const updatedUserId = updatedRecord.user._id || updatedRecord.user;

            if (updatedUserId === user._id) {
                setAttendance((prev) => {
                    const index = prev.findIndex(item => item._id === updatedRecord._id);
                    if (index !== -1) {
                        // Update existing
                        const newAttendance = [...prev];
                        newAttendance[index] = updatedRecord;
                        return newAttendance;
                    } else {
                        // Add new (prepend)
                        return [updatedRecord, ...prev];
                    }
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const fetchAttendance = async () => {
        try {
            const { data } = await api.get('/attendance');
            setAttendance(data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let colorClass = 'bg-gray-100 text-gray-800';
        if (status === 'Present') colorClass = 'bg-green-100 text-green-800';
        if (status === 'Absent') colorClass = 'bg-red-100 text-red-800';
        if (status === 'Late') colorClass = 'bg-orange-100 text-orange-800';
        if (status === 'Half-Day') colorClass = 'bg-purple-100 text-purple-800';
        if (status === 'On-Leave') colorClass = 'bg-blue-100 text-blue-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance history...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Attendance History</h1>
                {/* Could add date filter here */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Login</th>
                                <th className="px-6 py-4">Lunch Out</th>
                                <th className="px-6 py-4">Lunch In</th>
                                <th className="px-6 py-4">Logout</th>
                                <th className="px-6 py-4">Total Late Time</th>
                                <th className="px-6 py-4">Came to Work Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                {new Date(record.date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={record.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.loginTime ? dayjs(record.loginTime).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.lunchOut ? dayjs(record.lunchOut).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.lunchIn ? dayjs(record.lunchIn).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.logoutTime ? dayjs(record.logoutTime).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {record.totalPermissionMinutes > 0 ? (
                                                <span className="text-red-600 font-medium">{formatDuration(record.totalPermissionMinutes)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>

                                        {/* Override Reason */}
                                        <td className="px-6 py-4 text-sm max-w-[250px]">
                                            {record.overrideReason ? (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-orange-600 shrink-0">💬</span>
                                                    <span className="text-gray-700 italic line-clamp-2" title={record.overrideReason}>
                                                        {record.overrideReason}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Attendance;
