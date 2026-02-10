import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, Check, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

const ApplyLeaveModal = ({ visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [reason, setReason] = useState('');
    const [type, setType] = useState('Loss of Pay');
    const [lopWarning, setLopWarning] = useState(null);
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setDates({ start: '', end: '' });
            setReason('');
            setType('Loss of Pay');
            setLopWarning(null);
            setError('');
        }
    }, [visible]);

    const checkLopImpact = (start, end) => {
        if (!start || !end) {
            setLopWarning(null);
            return;
        }

        const startDate = dayjs(start);
        const endDate = dayjs(end);

        if (endDate.isBefore(startDate)) {
            setError('End date cannot be before start date');
            setLopWarning(null);
            return;
        }
        setError('');

        let current = startDate.clone();
        let monSatCount = 0;
        let normalCount = 0;

        while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
            const day = current.day();
            if (day !== 0) { // Exclude Sunday
                if (day === 1 || day === 6) monSatCount++; // Mon or Sat
                else normalCount++;
            }
            current = current.add(1, 'day');
        }

        const totalLop = (monSatCount * 2) + normalCount;
        if (totalLop > 0) {
            setLopWarning(`Estimated Loss of Pay: ${totalLop} days (Mon/Sat = 2x)`);
        } else {
            setLopWarning(null);
        }
    };

    const handleDateChange = (field, value) => {
        const newDates = { ...dates, [field]: value };
        setDates(newDates);
        if (newDates.start && newDates.end) {
            checkLopImpact(newDates.start, newDates.end);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!dates.start || !dates.end || !reason) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            await api.post('/leaves', {
                startDate: dates.start,
                endDate: dates.end,
                reason,
                type
            });
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to request leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 -translate-x-1/2 top-4 md:top-1/2 md:-translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Apply for Leave</h3>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-center gap-3 p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                                    <AlertTriangle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Date Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Start Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                            value={dates.start}
                                            min={dayjs().format('YYYY-MM-DD')}
                                            onChange={(e) => handleDateChange('start', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">End Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                            value={dates.end}
                                            min={dates.start || dayjs().format('YYYY-MM-DD')}
                                            onChange={(e) => handleDateChange('end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* LOP Warning */}
                            <AnimatePresence>
                                {lopWarning && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800"
                                    >
                                        <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-600" />
                                        <div className="text-sm">
                                            <p className="font-bold">LOP Warning</p>
                                            <p className="opacity-90 mt-0.5">{lopWarning}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Leave Type */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Leave Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 appearance-none"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="Loss of Pay">Loss of Pay (Standard)</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Casual Leave">Casual Leave</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Reason</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 resize-none"
                                    placeholder="Brief reason for your leave..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Submitting...' : 'Confirm Request'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ApplyLeaveModal;
