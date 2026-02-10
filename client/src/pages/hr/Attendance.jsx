import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { Calendar, User, Search, Download } from 'lucide-react';
import dayjs from 'dayjs';
import { formatLateTime } from '../../utils/timeFormat';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

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

    const filteredAttendance = attendance.filter(record =>
        record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance records...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>

                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Late</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {record.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{record.user?.name}</p>
                                                    <p className="text-xs text-gray-500">{record.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {dayjs(record.date).format('MMM DD, YYYY')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={record.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.loginTime ? dayjs(record.loginTime).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {record.logoutTime ? dayjs(record.logoutTime).format('hh:mm A') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {record.lateMinutes > 0 ? (
                                                <span className="text-red-600 font-medium">{formatLateTime(record.lateMinutes)}</span>
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
