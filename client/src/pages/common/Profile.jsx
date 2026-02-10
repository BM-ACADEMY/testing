import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Spin, Avatar, Upload } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [imageLoading, setImageLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile');
            setProfileData(data);
            form.setFieldsValue({
                name: data.name,
                email: data.email,
            });
        } catch (error) {
            message.error('Failed to load profile');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleImageUpload = async (file) => {
        setImageLoading(true);
        const formData = new FormData();
        formData.append('profileImage', file);

        try {
            const { data } = await api.post('/profile/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Profile image uploaded successfully');
            // Update profile data with new image
            setProfileData({ ...profileData, profileImage: data.profileImage });
            setUser({ ...user, profileImage: data.profileImage });
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setImageLoading(false);
        }
        return false; // Prevent default upload behavior
    };

    const handleImageDelete = async () => {
        setImageLoading(true);
        try {
            await api.delete('/profile/image');
            message.success('Profile image deleted successfully');
            setProfileData({ ...profileData, profileImage: null });
            setUser({ ...user, profileImage: null });
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete image');
        } finally {
            setImageLoading(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { data } = await api.put('/profile', values);
            setUser({ ...user, ...data });
            message.success('Profile updated successfully');
            form.setFieldsValue({ password: '' }); // Clear password field
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    const imageUrl = profileData?.profileImage
        ? `http://localhost:5000/${profileData.profileImage.replace(/\\/g, '/')}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto px-4 md:px-0"
        >
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>

            {/* Profile Image Card */}
            <Card className="shadow-md rounded-2xl border-0 mb-6">
                <div className="flex flex-col items-center">
                    <Avatar
                        size={120}
                        src={imageUrl}
                        icon={<UserOutlined />}
                        className="mb-4 border-4 border-blue-100"
                    />
                    <div className="flex gap-2">
                        <Upload
                            beforeUpload={handleImageUpload}
                            showUploadList={false}
                            accept="image/*"
                        >
                            <Button
                                icon={<CameraOutlined />}
                                loading={imageLoading}
                                type="primary"
                            >
                                {profileData?.profileImage ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                        </Upload>
                        {profileData?.profileImage && (
                            <Button
                                icon={<DeleteOutlined />}
                                loading={imageLoading}
                                danger
                                onClick={handleImageDelete}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Formats: JPG, PNG</p>
                </div>
            </Card>

            <Card className="shadow-md rounded-2xl border-0">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Your name" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="password"
                        help="Leave blank to keep current password"
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="New password (optional)"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            className="w-full md:w-auto"
                        >
                            Update Profile
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card className="shadow-md rounded-2xl border-0 mt-6">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">{user?.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium text-sm">{user?._id}</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default Profile;
