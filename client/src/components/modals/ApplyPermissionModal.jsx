import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';

const ApplyPermissionModal = ({ visible, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [times, setTimes] = useState({ start: '', end: '' });
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setDate(dayjs().format('YYYY-MM-DD'));
            setTimes({ start: '', end: '' });
            setReason('');
            setError('');
        }
    }, [visible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!date || !times.start || !times.end || !reason) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (times.end <= times.start) {
            setError('End time must be after start time');
            setLoading(false);
            return;
        }

        try {
            await api.post('/permissions', {
                date,
                startTime: times.start,
                endTime: times.end,
                reason
            });
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to request permission');
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
                            <h3 className="text-lg font-bold text-gray-900">Request Permission</h3>
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
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                        value={date}
                                        min={dayjs().format('YYYY-MM-DD')}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Start Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                            value={times.start}
                                            onChange={(e) => setTimes({ ...times, start: e.target.value })}
                                        />
                                        <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">End Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
                                            value={times.end}
                                            min={times.start}
                                            onChange={(e) => setTimes({ ...times, end: e.target.value })}
                                        />
                                        <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Reason</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 resize-none"
                                    placeholder="Brief reason for permission..."
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

export default ApplyPermissionModal;
