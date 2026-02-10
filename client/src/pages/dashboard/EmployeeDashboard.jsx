import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Timeline, message, Spin, Avatar, List, Tag } from 'antd';
import {
    ClockCircleOutlined,
    CoffeeOutlined,
    LogoutOutlined,
    BellOutlined,
    FileTextOutlined,
    CarOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../../utils/axios';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState(null);
    const [todayActivity, setTodayActivity] = useState([]);
    const [stats, setStats] = useState({ presents: 0, lates: 0, absents: 0 });

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/today');
            setAttendance(data);
            updateTimeline(data);
        } catch (error) {
            console.error("Error fetching attendance", error);
        }
    };

    const updateTimeline = (data) => {
        if (!data) return;
        const items = [];
        if (data.loginTime) items.push({ color: 'green', children: `Check In at ${dayjs(data.loginTime).format('hh:mm A')}` });
        if (data.lunchOut || data.lunchOutTime) items.push({ color: 'orange', children: `Lunch Out at ${dayjs(data.lunchOut || data.lunchOutTime).format('hh:mm A')}` });
        if (data.lunchIn || data.lunchInTime) items.push({ color: 'blue', children: `Lunch In at ${dayjs(data.lunchIn || data.lunchInTime).format('hh:mm A')}` });
        if (data.logoutTime) items.push({ color: 'red', children: `Check Out at ${dayjs(data.logoutTime).format('hh:mm A')}` });
        setTodayActivity(items);
    };

    useEffect(() => {
        fetchTodayAttendance();
        setStats({ presents: 23, lates: 10, absents: 1 });

        // Socket connection
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socket.on('attendanceUpdate', (updatedAttendance) => {
            if (updatedAttendance.user === user._id || updatedAttendance.user._id === user._id) {
                setAttendance(updatedAttendance);
                updateTimeline(updatedAttendance);
            }
        });

        return () => socket.disconnect();
    }, []);

    const handleMarkAttendance = async (type) => {
        setLoading(true);
        const backendType = type === 'checkIn' ? 'login' : (type === 'checkOut' ? 'logout' : type);

        try {
            const { data } = await api.post('/attendance/mark', { type: backendType });
            message.success(`Marked ${type} successfully`);
            setAttendance(data);
            updateTimeline(data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Error marking attendance');
        }
        setLoading(false);
    };

    // Placeholder data for recent requests
    const recentRequests = [
        { id: 1, type: 'Sick Leave', status: 'Pending', dates: '12 Jul - 13 Jul, 2023', user: user?.name || 'User' },
        { id: 2, type: 'OD Request', status: 'Approved', dates: '18 Jul - 18 Jul, 2023', user: user?.name || 'User' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pb-20 md:pb-0"
        >
            {/* Mobile Header Section - Full width background */}
            <div className="block md:hidden relative bg-gradient-to-br from-blue-600 to-blue-700 -mx-6 -mt-6 p-6 pb-16 rounded-b-[40px] shadow-lg mb-6">
                <div className="flex justify-between items-start text-white">
                    <div>
                        <h1 className="text-2xl font-bold m-0">Good Morning</h1>
                        <h2 className="text-xl font-medium m-0 mt-1 opacity-90">{user?.name}</h2>
                    </div>
                    <BellOutlined className="text-2xl cursor-pointer" />
                </div>
            </div>

            {/* Desktop Header - Simple and clean */}
            <div className="hidden md:block mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 m-0">Good Morning, {user?.name}</h1>
                        <p className="text-gray-500 mt-2">Here's your attendance overview for today</p>
                    </div>
                    <BellOutlined className="text-2xl cursor-pointer text-gray-600 hover:text-blue-600 transition-colors" />
                </div>
            </div>

            <Row gutter={[16, 16]} className="px-4 md:px-0">
                {/* Main Content Column */}
                <Col xs={24} lg={16} xl={18} order={2} className="md:order-1">
                    {/* Recent Requests */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg m-0">Recent Requests</h3>
                            <Button type="link" size="small" className="text-blue-600">See All</Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {recentRequests.map(req => (
                                <Card key={req.id} className="rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar size={48} src="https://i.pravatar.cc/150?img=32" icon={<UserOutlined />} />
                                            <div>
                                                <div className="font-semibold text-gray-800">{req.user}</div>
                                                <div className="text-sm text-gray-500">{req.dates}</div>
                                                <div className="text-xs font-medium text-gray-400 mt-1">{req.type}</div>
                                            </div>
                                        </div>
                                        <Tag color={req.status === 'Pending' ? 'orange' : 'green'} className="rounded-full px-4 py-1 border-0">
                                            {req.status}
                                        </Tag>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Your Attendance This Month</h3>
                        <Row gutter={[16, 16]}>
                            <Col xs={8}>
                                <Card className="rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-green-500 mb-2">{stats.presents}</div>
                                    <div className="text-sm text-gray-500 font-medium">Presents</div>
                                </Card>
                            </Col>
                            <Col xs={8}>
                                <Card className="rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-orange-500 mb-2">{stats.lates}</div>
                                    <div className="text-sm text-gray-500 font-medium">Lates</div>
                                </Card>
                            </Col>
                            <Col xs={8}>
                                <Card className="rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-red-500 mb-2">{stats.absents}</div>
                                    <div className="text-sm text-gray-500 font-medium">Absents</div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Today's Timeline */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Today's Timeline</h3>
                        <Card className="rounded-xl shadow-sm border-0">
                            <Timeline items={todayActivity.length > 0 ? todayActivity : [{ color: 'gray', children: 'No activity yet' }]} />
                        </Card>
                    </div>
                </Col>

                {/* Sidebar Column */}
                <Col xs={24} lg={8} xl={6} order={1} className="md:order-2">
                    {/* Attendance Action Card */}
                    <Card
                        title={<span className="text-lg font-semibold">Mark Attendance</span>}
                        className="shadow-lg rounded-2xl border-0 mb-6 sticky top-6"
                    >
                        {loading ? <div className="text-center py-8"><Spin /></div> : (
                            <div className="flex flex-col gap-4 items-center py-4">
                                <div className="text-3xl font-mono font-bold text-gray-700 mb-2">{dayjs().format('hh:mm A')}</div>

                                {!attendance?.loginTime && (
                                    <Button type="primary" size="large" icon={<ClockCircleOutlined />}
                                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg shadow-lg"
                                        onClick={() => handleMarkAttendance('checkIn')}>
                                        Check In
                                    </Button>
                                )}

                                {attendance?.loginTime && !attendance?.logoutTime && (
                                    <div className="grid grid-cols-2 gap-3 w-full">
                                        {!(attendance?.lunchOut || attendance?.lunchOutTime) ? (
                                            <Button className="h-12 rounded-xl border-orange-500 text-orange-500 hover:text-orange-600" icon={<CoffeeOutlined />} onClick={() => handleMarkAttendance('lunchOut')}>
                                                Lunch Break
                                            </Button>
                                        ) : !(attendance?.lunchIn || attendance?.lunchInTime) ? (
                                            <Button className="h-12 rounded-xl bg-orange-50 border-orange-500 text-orange-600" icon={<CoffeeOutlined />} onClick={() => handleMarkAttendance('lunchIn')}>
                                                End Lunch
                                            </Button>
                                        ) : <div className="col-span-1"></div>}

                                        <Button type="primary" danger className="h-12 rounded-xl shadow-md" icon={<LogoutOutlined />} onClick={() => handleMarkAttendance('checkOut')}>
                                            Check Out
                                        </Button>
                                    </div>
                                )}

                                {attendance?.logoutTime && (
                                    <div className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                                        <ClockCircleOutlined /> Shift Completed
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Quick Actions</h3>
                        <Row gutter={[12, 12]}>
                            <Col span={24}>
                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-3 rounded-full">
                                            <FileTextOutlined className="text-2xl text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Permissions</div>
                                            <div className="text-xs text-gray-500">Request permission</div>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-green-600">23</span>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-3 rounded-full">
                                            <CalendarOutlined className="text-2xl text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">Leaves</div>
                                            <div className="text-xs text-gray-500">Apply for leave</div>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-blue-600">3</span>
                                </div>
                            </Col>
                            <Col span={24}>
                                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all border border-orange-200">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-3 rounded-full">
                                            <CarOutlined className="text-2xl text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">On Duty</div>
                                            <div className="text-xs text-gray-500">Request OD</div>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-orange-600">12</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default EmployeeDashboard;
