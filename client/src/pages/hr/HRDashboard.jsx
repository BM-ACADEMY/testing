import React from 'react';
import { Users, CheckCircle, UserX, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const HRDashboard = () => {
    // Mock data
    const stats = [
        { title: 'Total Employees', value: 120, icon: <Users size={24} />, colorClass: 'text-blue-600', bgClass: 'bg-blue-50' },
        { title: 'Present Today', value: 95, icon: <CheckCircle size={24} />, colorClass: 'text-green-600', bgClass: 'bg-green-50' },
        { title: 'On Leave', value: 5, icon: <UserX size={24} />, colorClass: 'text-amber-600', bgClass: 'bg-amber-50' },
        { title: 'Late Arrivals', value: 12, icon: <Clock size={24} />, colorClass: 'text-red-600', bgClass: 'bg-red-50' },
    ];

    const data = [
        { key: '1', name: 'John Doe', role: 'Employee', status: 'Present', checkIn: '09:00 AM' },
        { key: '2', name: 'Jane Smith', role: 'Intern', status: 'Absent', checkIn: '-' },
        { key: '3', name: 'Alice Johnson', role: 'Employee', status: 'Present', checkIn: '09:15 AM' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">HR Overview</h1>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Today's Attendance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Check In</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((row) => (
                                <tr key={row.key} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {row.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === 'Present'
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{row.checkIn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default HRDashboard;
