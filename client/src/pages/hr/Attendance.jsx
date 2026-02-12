import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, User, Search, Download, Filter, X } from 'lucide-react'; // Renamed import to avoid conflict
import { DatePicker, Space, Dropdown } from 'antd'; // Added Ant Design components
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { formatLateTime } from '../../utils/timeFormat';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState(null); // [start, end]
    const navigate = useNavigate();

    useEffect(() => {
        fetchAttendance();
    }, [dateRange]); // Refetch when date range changes

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            let url = '/attendance';
            if (dateRange) {
                const start = dateRange[0].format('YYYY-MM-DD');
                const end = dateRange[1].format('YYYY-MM-DD');
                url += `?startDate=${start}&endDate=${end}`;
            }
            const { data } = await api.get(url);
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

    // Export to Excel
    const exportToExcel = () => {
        const dataToExport = filteredAttendance.map(record => ({
            'Employee': record.user?.name || 'N/A',
            'Date': dayjs(record.date).format('DD MMM, YYYY'),
            'Status': record.status,
            'Login': record.loginTime ? dayjs(record.loginTime).format('hh:mm A') : '-',
            'Lunch Out': record.lunchOut ? dayjs(record.lunchOut).format('hh:mm A') : '-',
            'Lunch In': record.lunchIn ? dayjs(record.lunchIn).format('hh:mm A') : '-',
            'Logout': record.logoutTime ? dayjs(record.logoutTime).format('hh:mm A') : '-',
            'Total Late Time (Mins)': (record.lateMinutes || 0) + (record.lunchExceededMinutes || 0)
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Attendance Report", 14, 15);

        const tableColumn = ["Employee", "Date", "Status", "Login", "Lunch Out", "Lunch In", "Logout", "Late Time"];
        const tableRows = filteredAttendance.map(record => [
            record.user?.name || 'N/A',
            dayjs(record.date).format('DD MMM'),
            record.status,
            record.loginTime ? dayjs(record.loginTime).format('HH:mm') : '-',
            record.lunchOut ? dayjs(record.lunchOut).format('HH:mm') : '-',
            record.lunchIn ? dayjs(record.lunchIn).format('HH:mm') : '-',
            record.logoutTime ? dayjs(record.logoutTime).format('HH:mm') : '-',
            `${(record.lateMinutes || 0) + (record.lunchExceededMinutes || 0)}m`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("Attendance_Report.pdf");
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

                <div className="flex gap-2 items-center flex-wrap">
                    {/* Date Range Picker */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <RangePicker
                            onChange={(dates) => setDateRange(dates)}
                            className="border-none shadow-none"
                        />
                    </div>

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

                    {/* Export Dropdown */}
                    <Dropdown menu={{
                        items: [
                            { key: 'excel', label: 'Export to Excel', onClick: exportToExcel },
                            { key: 'pdf', label: 'Export to PDF', onClick: exportToPDF },
                        ]
                    }} placement="bottomRight">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors h-auto">
                            <Download size={18} /> Export <span className="text-xs">▼</span>
                        </button>
                    </Dropdown>

                    {/* Clear Filters (Optional, if dateRange is set) */}
                    {dateRange && (
                        <button
                            onClick={() => setDateRange(null)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Clear Date Filter"
                        >
                            <X size={18} />
                        </button>
                    )}
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
                                <th className="px-6 py-4">Login</th>
                                <th className="px-6 py-4">Lunch Out</th>
                                <th className="px-6 py-4">Lunch In</th>
                                <th className="px-6 py-4">Logout</th>
                                <th className="px-6 py-4">Total Late Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((record) => {
                                    const totalLateTime = (record.lateMinutes || 0) + (record.lunchExceededMinutes || 0);

                                    return (
                                        <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 max-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {record.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-medium text-gray-900 truncate" title={record.user?.name}>{record.user?.name}</p>
                                                        <p className="text-xs text-gray-500 truncate" title={record.user?.email}>{record.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {dayjs(record.date).format('MMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={record.status} />
                                            </td>

                                            {/* Times - Login */}
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                                                {record.loginTime ? dayjs(record.loginTime).format('hh:mm A') : '-'}
                                            </td>

                                            {/* Times - Lunch Out */}
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                                                {record.lunchOut ? dayjs(record.lunchOut).format('hh:mm A') : '-'}
                                            </td>

                                            {/* Times - Lunch In */}
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                                                {record.lunchIn ? dayjs(record.lunchIn).format('hh:mm A') : '-'}
                                            </td>

                                            {/* Times - Logout */}
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                                                {record.logoutTime ? dayjs(record.logoutTime).format('hh:mm A') : '-'}
                                            </td>

                                            {/* Total Late Time */}
                                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                {totalLateTime > 0 ? (
                                                    <span className="text-red-600 font-medium">{formatLateTime(totalLateTime)}</span>
                                                ) : (
                                                    <span className="text-green-600">On Time</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Attendance;
