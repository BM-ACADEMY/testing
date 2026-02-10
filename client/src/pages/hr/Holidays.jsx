import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'antd';
import dayjs from 'dayjs';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const Holidays = () => {
    const { user } = useAuth();
    const isHR = user?.role === 'HR';

    const [holidays, setHolidays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Public Holiday',
        isRecurring: false
    });
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [loading, setLoading] = useState(false);

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
                        title={holiday.name}
                    >
                        {holiday.name}
                    </div>
                ))}
            </div>
        );
    };

    const onDateSelect = (date) => {
        // Only HR can add/edit holidays
        if (!isHR) return;

        const dateString = date.format('YYYY-MM-DD');
        const existingHoliday = holidays.find(h =>
            dayjs(h.date).format('YYYY-MM-DD') === dateString
        );

        if (existingHoliday) {
            setEditingHoliday(existingHoliday);
            setFormData({
                name: existingHoliday.name,
                description: existingHoliday.description || '',
                type: existingHoliday.type,
                isRecurring: existingHoliday.isRecurring
            });
        } else {
            setEditingHoliday(null);
            setFormData({
                name: '',
                description: '',
                type: 'Public Holiday',
                isRecurring: false
            });
        }

        setSelectedDate(date);
        setModalVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                date: selectedDate.toDate()
            };

            if (editingHoliday) {
                await api.put(`/holidays/${editingHoliday._id}`, payload);
            } else {
                await api.post('/holidays', payload);
            }

            fetchHolidays();
            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.error('Error saving holiday:', error);
            alert(error.response?.data?.message || 'Failed to save holiday');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!editingHoliday || !window.confirm('Delete this holiday?')) return;

        setLoading(true);
        try {
            await api.delete(`/holidays/${editingHoliday._id}`);
            fetchHolidays();
            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.error('Error deleting holiday:', error);
            alert('Failed to delete holiday');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'Public Holiday',
            isRecurring: false
        });
        setEditingHoliday(null);
        setSelectedDate(null);
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
                    <p className="text-gray-500 mt-1">
                        {isHR ? 'Manage company-wide holidays and events' : 'View company holidays and events'}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon size={16} />
                    <span>{holidays.length} holidays</span>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <Calendar
                    dateCellRender={dateCellRender}
                    onSelect={onDateSelect}
                    className="custom-calendar"
                    fullscreen={false}
                />
            </div>

            {/* Holiday Modal */}
            <AnimatePresence>
                {modalVisible && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setModalVisible(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-lg text-gray-900">
                                    {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                                </h3>
                                <button
                                    onClick={() => setModalVisible(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900">
                                        {selectedDate?.format('MMMM DD, YYYY')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="e.g., New Year's Day"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Optional description"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="Public Holiday">Public Holiday</option>
                                        <option value="Company Event">Company Event</option>
                                        <option value="Festival">Festival</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="recurring" className="text-sm text-gray-700">
                                        Recurring annually
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingHoliday && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} /> Delete
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingHoliday ? 'Update' : 'Add Holiday'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Holidays;
