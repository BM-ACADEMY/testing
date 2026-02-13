import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Calendar, MapPin, Droplet, IdCard, Phone } from 'lucide-react';
import api from '../../utils/axios';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const EmployeeDetailsModal = ({ isOpen, onClose, employee, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Employee',
        designation: '',
        joiningDate: null,
        address: '',
        bloodGroup: '',
        idNumber: '',
        phoneNumber: '',
        dob: null,
        shift: ''
    });
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchShifts();
            if (employee) {
                setFormData({
                    name: employee.name || '',
                    email: employee.email || '',
                    role: employee.role || 'Employee',
                    designation: employee.designation || '',
                    joiningDate: employee.joiningDate ? dayjs(employee.joiningDate) : null,
                    address: employee.address || '',
                    bloodGroup: employee.bloodGroup || '',
                    idNumber: employee.idNumber || '',
                    phoneNumber: employee.phoneNumber || '',
                    dob: employee.dob ? dayjs(employee.dob) : null,
                    shift: employee.shift?._id || employee.shift || ''
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, employee]);

    const fetchShifts = async () => {
        try {
            const { data } = await api.get('/shifts');
            setShifts(data);
        } catch (error) {
            console.error('Error fetching shifts:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            role: 'Employee',
            designation: '',
            joiningDate: null,
            address: '',
            bloodGroup: '',
            idNumber: '',
            phoneNumber: '',
            dob: null,
            shift: ''
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                joiningDate: formData.joiningDate ? formData.joiningDate.toISOString() : null,
                dob: formData.dob ? formData.dob.toISOString() : null
            };

            if (employee) {
                // Update existing employee
                await api.put(`/users/${employee._id}`, payload);
            } else {
                // Create new employee - requires password
                if (!formData.password) {
                    setError('Password is required for new employees');
                    setLoading(false);
                    return;
                }
                await api.post('/users', payload);
            }

            onSuccess?.();
            onClose();
            resetForm();
        } catch (error) {
            setError(error.response?.data?.message || 'Error saving employee details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {employee ? 'Edit Employee Details' : 'Add New Employee'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-blue-600" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="john@example.com"
                                    disabled={!!employee}
                                />
                            </div>
                            {!employee && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required={!employee}
                                        value={formData.password || ''}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <DatePicker
                                    value={formData.dob}
                                    onChange={(date) => setFormData({ ...formData, dob: date })}
                                    className="w-full"
                                    format="MMM DD, YYYY"
                                    placeholder="Select DOB"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Group
                                </label>
                                <select
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                rows="2"
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Briefcase size={18} className="text-purple-600" />
                            Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="HR">HR</option>
                                    <option value="CEO">CEO</option>
                                    <option value="Intern">Intern</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="EMP001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Joining Date
                                </label>
                                <DatePicker
                                    value={formData.joiningDate}
                                    onChange={(date) => setFormData({ ...formData, joiningDate: date })}
                                    className="w-full"
                                    format="MMM DD, YYYY"
                                    placeholder="Select joining date"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Shift <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.shift}
                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                >
                                    <option value="">Select Shift</option>
                                    {shifts.map(shift => (
                                        <option key={shift._id} value={shift._id}>
                                            {shift.name} ({shift.loginTime} - {shift.logoutTime})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                resetForm();
                            }}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeDetailsModal;
