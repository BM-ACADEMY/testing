import React from 'react';
import { TrendingUp, TrendingDown, Users, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, trend, trendValue, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>
        <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
            {icon}
        </div>
    </div>
);

const CEODashboard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Workforce"
                    value="120"
                    icon={<Users size={24} />}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    trend="up"
                    trendValue="+5% vs last month"
                />
                <StatsCard
                    title="Attendance Rate"
                    value="92.5%"
                    icon={<TrendingUp size={24} />}
                    colorClass="text-green-600"
                    bgClass="bg-green-50"
                    trend="up"
                    trendValue="+2.1% vs last month"
                />
                <StatsCard
                    title="Absenteeism"
                    value="7.5%"
                    icon={<TrendingDown size={24} />}
                    colorClass="text-red-600"
                    bgClass="bg-red-50"
                    trend="down"
                    trendValue="-1.2% vs last month"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-80 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Department Wise Attendance</h2>
                    <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View Report</button>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="text-center text-gray-400">
                        <BarChart2 size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">Chart Visualization Placeholder</p>
                        <p className="text-xs">Select a date range to view data</p>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default CEODashboard;
