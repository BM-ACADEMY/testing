import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';

const LeaveOverrideModal = ({ visible, onClose, onConfirm, leaveDetails }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('Please enter a reason for coming to work');
            return;
        }
        setLoading(true);
        onConfirm(reason);
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-orange-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-full">
                                    <AlertTriangle size={24} className="text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Leave Override Confirmation</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Warning Message */}
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                <p className="text-sm font-semibold text-orange-900">
                                    ⚠️ You have approved leave for today
                                </p>
                            </div>

                            {/* Leave Details Card */}
                            {leaveDetails && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                                    <div className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
                                        <Calendar size={18} />
                                        <span>Leave Details</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Start Date:</span>
                                            <span className="font-semibold text-blue-900">
                                                {dayjs(leaveDetails.startDate).format('DD MMM YYYY')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">End Date:</span>
                                            <span className="font-semibold text-blue-900">
                                                {dayjs(leaveDetails.endDate).format('DD MMM YYYY')}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-blue-200">
                                            <span className="text-blue-700">Reason:</span>
                                            <p className="font-medium text-blue-900 mt-1">{leaveDetails.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reason Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <FileText size={16} />
                                    Why are you coming to work today?
                                </label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400 resize-none"
                                    placeholder="Enter reason for override (e.g., urgent work, meeting, etc.)"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            {/* Information */}
                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                💡 <strong>Note:</strong> Proceeding will change your attendance status from "On-Leave" to "Present" for today.
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={loading}
                                className="flex-1 py-2.5 px-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Yes, Proceed to Work'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LeaveOverrideModal;
