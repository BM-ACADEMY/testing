import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Lock,
    Camera,
    Trash2,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile');
            setProfileData(data);
            setFormData({
                name: data.name,
                email: data.email,
                password: ''
            });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setFetchLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 2MB' });
            return;
        }

        setImageLoading(true);
        const uploadData = new FormData();
        uploadData.append('profileImage', file);

        try {
            const response = await api.post('/profile/image', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Upload response:', response);
            console.log('Upload status:', response.status);
            console.log('Upload data:', response.data);
            setMessage({ type: 'success', text: 'Profile image uploaded successfully' });
            setProfileData({ ...profileData, profileImage: response.data.profileImage });
            setUser({ ...user, profileImage: response.data.profileImage });
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Upload error response:', error.response);
            console.error('Upload error status:', error.response?.status);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
        } finally {
            setImageLoading(false);
        }
    };

    const handleImageDelete = async () => {
        setImageLoading(true);
        try {
            const response = await api.delete('/profile/image');
            console.log('Delete response:', response);
            setMessage({ type: 'success', text: 'Profile image deleted successfully' });
            setProfileData({ ...profileData, profileImage: null });
            setUser({ ...user, profileImage: null });
        } catch (error) {
            console.error('Delete error:', error, error.response);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete image' });
        } finally {
            setImageLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.put('/profile', formData);
            setUser({ ...user, ...data });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setFormData(prev => ({ ...prev, password: '' })); // Clear password field
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) return null;
        const normalizedPath = imagePath.replace(/\\/g, '/');
        if (normalizedPath.startsWith('http')) return normalizedPath;
        return `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
    };

    const imageUrl = getProfileImageUrl(profileData?.profileImage);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto px-4 md:px-0 pb-10"
        >
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            {/* Notification Area */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="grid gap-6">

                {/* Profile Photo Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Profile Photo</h2>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                                        <User size={48} />
                                    </div>
                                )}

                                {imageLoading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleImageUpload}
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={imageLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                >
                                    <Camera size={16} />
                                    {profileData?.profileImage ? 'Change Photo' : 'Upload Photo'}
                                </button>

                                {profileData?.profileImage && (
                                    <button
                                        onClick={handleImageDelete}
                                        disabled={imageLoading}
                                        className="px-4 py-2 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Supports JPG, PNG. Max size 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your full name"
                                    />
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">New Password <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave blank to keep current"
                                    />
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
