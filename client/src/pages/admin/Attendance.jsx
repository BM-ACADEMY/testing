import React, { useState, useEffect } from 'react';
import { Table, Tag, DatePicker, Button, Select } from 'antd';
import api from '../../utils/axios';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';

const { RangePicker } = DatePicker;

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchAttendance = async (params = {}) => {
        setLoading(true);
        try {
            // TODO: Backend should support filter params
            const { data } = await api.get('/attendance', { params });
            setAttendance(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAttendance();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socket.on('attendanceUpdate', (updatedRecord) => {
            // We need to update the list if the record exists, or add it if it's new
            // Check if record exists
            setAttendance(prev => {
                const index = prev.findIndex(item => item._id === updatedRecord._id);
                if (index > -1) {
                    const newArr = [...prev];
                    // We need to merge because updatedRecord from socket might not have populated fields like 'user' name
                    // But actually, for the table to update nicely, ideally the socket sends populated data or we re-fetch.
                    // For simplicity, let's just re-fetch or assume minimal update.
                    // Better yet: Re-fetch single row? Or just update fields.
                    // Problem: updatedRecord.user is likely just an ID string, but our table expects an object { name: ... }

                    // Simple approach: if ID matches, update times. Keep user object.
                    newArr[index] = { ...newArr[index], ...updatedRecord, user: newArr[index].user };
                    return newArr;
                } else {
                    // New record - we might miss user details if we just append.
                    // Safest for Admin view: Re-fetch list or fetch single
                    // Let's just re-fetch everyone for now to be safe and simple
                    fetchAttendance();
                    return prev;
                }
            });
        });

        return () => socket.disconnect();
    }, []);

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user?.name || 'Unknown'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Login Time',
            dataIndex: 'loginTime',
            key: 'loginTime',
            render: (time) => time ? dayjs(time).format('hh:mm A') : '-'
        },
        {
            title: 'Lunch Out',
            key: 'lunchOut',
            render: (record) => {
                const time = record.lunchOut || record.lunchOutTime;
                return time ? dayjs(time).format('hh:mm A') : '-';
            }
        },
        {
            title: 'Lunch In',
            key: 'lunchIn',
            render: (record) => {
                const time = record.lunchIn || record.lunchInTime;
                return time ? dayjs(time).format('hh:mm A') : '-';
            }
        },
        {
            title: 'Logout Time',
            dataIndex: 'logoutTime',
            key: 'logoutTime',
            render: (time) => time ? dayjs(time).format('hh:mm A') : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'Absent') color = 'red';
                if (status === 'Late') color = 'orange';
                if (status === 'Half Day') color = 'purple';
                return <Tag color={color}>{status}</Tag>
            }
        },
        {
            title: 'Late Mins',
            dataIndex: 'lateBy',
            key: 'lateBy',
            render: val => val > 0 ? <span className="text-red-500">{val}m</span> : '-'
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Attendance Records</h2>
                {/* Add filters later if needed */}
            </div>
            <Table
                columns={columns}
                dataSource={attendance}
                rowKey="_id"
                loading={loading}
            />
        </div>
    );
};

export default Attendance;
