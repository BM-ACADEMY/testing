import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { motion } from 'framer-motion';
import { Check, X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Requests = () => {
    const [leaves, setLeaves] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async () => {
        try {
            const [leavesRes, permissionsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/permissions')
            ]);
            // Filter only pending requests for action
            // Or show all and let them filter
            // For now, let's show all but sort by pending first
            setLeaves(leavesRes.data);
            setPermissions(permissionsRes.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, id, status) => {
        try {
            if (type === 'leave') {
                await api.put(`/leaves/${id}/status`, { status });
            } else {
                await api.put(`/permissions/${id}/status`, { status });
            }
            fetchRequests(); // Refresh data
        } catch (error) {
            console.error(`Error updating ${type} status:`, error);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const RequestCard = ({ item, type }) => (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${type === 'leave' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        {item.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">{item.user?.name}</h4>
                        <p className="text-xs text-gray-500">{item.user?.email}</p>
                    </div>
                </div>
                <StatusBadge status={item.status} />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium">
                        {type === 'leave'
                            ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
                            : new Date(item.date).toLocaleDateString()
                        }
                    </span>
                </div>
                {type === 'permission' && (
                    <div className="flex items-center gap-2 text-gray-700 mb-1">
                        <Clock size={14} className="text-gray-400" />
                        <span>{item.startTime} - {item.endTime} ({Math.round(item.durationMinutes)}m)</span>
                    </div>
                )}
                <p className="text-gray-600 italic mt-2">"{item.reason}"</p>
                {item.lopDays > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-red-600 text-xs font-bold">
                        <AlertCircle size={12} />
                        <span>LOP Impact: {item.lopDays} Days</span>
                    </div>
                )}
            </div>

            {item.status === 'Pending' && (
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => handleAction(type, item._id, 'Approved')}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={() => handleAction(type, item._id, 'Rejected')}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        <X size={16} /> Reject
                    </button>
                </div>
            )}
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar size={20} className="text-blue-500" />
                        Leave Requests ({leaves.filter(l => l.status === 'Pending').length})
                    </h2>
                    {leaves.length === 0 ? (
                        <p className="text-gray-400 text-sm">No leave requests found.</p>
                    ) : (
                        leaves.map(leave => (
                            <RequestCard key={leave._id} item={leave} type="leave" />
                        ))
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Clock size={20} className="text-purple-500" />
                        Permission Requests ({permissions.filter(p => p.status === 'Pending').length})
                    </h2>
                    {permissions.length === 0 ? (
                        <p className="text-gray-400 text-sm">No permission requests found.</p>
                    ) : (
                        permissions.map(perm => (
                            <RequestCard key={perm._id} item={perm} type="permission" />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Requests;
