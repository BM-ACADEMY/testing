import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import api from '../../utils/axios';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const { data } = await api.get('/holidays');
            setHolidays(data);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        }
    };

    const dateCellRender = (value) => {
        const dateString = value.format('YYYY-MM-DD');
        const dayHolidays = holidays.filter(h =>
            dayjs(h.date).format('YYYY-MM-DD') === dateString
        );

        if (dayHolidays.length === 0) return null;

        return (
            <div className="space-y-1">
                {dayHolidays.map(holiday => (
                    <div
                        key={holiday._id}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded truncate font-medium"
                        title={`${holiday.name}${holiday.description ? ` - ${holiday.description}` : ''}`}
                    >
                        {holiday.name}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Company Holidays</h1>
                    <p className="text-gray-500 mt-1">View company holidays and events</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon size={16} />
                    <span>{holidays.length} holidays</span>
                </div>
            </div>

            {/* Calendar - View Only */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <Calendar
                    dateCellRender={dateCellRender}
                    className="custom-calendar"
                    fullscreen={false}
                />
            </div>

            {/* Holiday List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Holidays</h2>
                <div className="space-y-3">
                    {holidays
                        .filter(h => dayjs(h.date).isAfter(dayjs().subtract(1, 'day')))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(holiday => (
                            <div
                                key={holiday._id}
                                className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex-shrink-0 w-16 h-16 bg-red-50 rounded-lg flex flex-col items-center justify-center">
                                    <span className="text-xs text-red-600 font-medium">
                                        {dayjs(holiday.date).format('MMM')}
                                    </span>
                                    <span className="text-2xl font-bold text-red-700">
                                        {dayjs(holiday.date).format('DD')}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{holiday.name}</h3>
                                    {holiday.description && (
                                        <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                            {holiday.type}
                                        </span>
                                        {holiday.isRecurring && (
                                            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                                                Annual
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {dayjs(holiday.date).format('dddd, MMMM DD, YYYY')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    {holidays.filter(h => dayjs(h.date).isAfter(dayjs().subtract(1, 'day'))).length === 0 && (
                        <p className="text-center text-gray-500 py-8">No upcoming holidays</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Holidays;
