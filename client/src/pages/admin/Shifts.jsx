import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, TimePicker, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../utils/axios';
import dayjs from 'dayjs';

const Shifts = () => {
    const [shifts, setShifts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [form] = Form.useForm();

    const fetchShifts = async () => {
        try {
            const { data } = await api.get('/shifts');
            setShifts(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleAddEditShift = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                loginTime: values.loginTime.format('HH:mm'),
                lunchStart: values.lunchStart.format('HH:mm'),
                logoutTime: values.logoutTime.format('HH:mm'),
            };

            if (editingShift) {
                await api.put(`/shifts/${editingShift._id}`, payload);
                message.success('Shift updated successfully');
            } else {
                await api.post('/shifts', payload);
                message.success('Shift created successfully');
            }
            setIsModalVisible(false);
            form.resetFields();
            setEditingShift(null);
            fetchShifts();
        } catch (error) {
            message.error(error.response?.data?.message || 'Operation failed');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/shifts/${id}`);
            message.success('Shift deleted');
            fetchShifts();
        } catch (error) {
            message.error('Failed to delete shift');
        }
    };

    const openModal = (shift = null) => {
        setEditingShift(shift);
        if (shift) {
            form.setFieldsValue({
                ...shift,
                loginTime: dayjs(shift.loginTime, 'HH:mm'),
                lunchStart: dayjs(shift.lunchStart, 'HH:mm'),
                logoutTime: dayjs(shift.logoutTime, 'HH:mm'),
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const columns = [
        { title: 'Shift Name', dataIndex: 'name', key: 'name' },
        { title: 'Login Time', dataIndex: 'loginTime', key: 'loginTime' },
        { title: 'Logout Time', dataIndex: 'logoutTime', key: 'logoutTime' },
        { title: 'Grace Period', dataIndex: 'gracePeriod', key: 'gracePeriod', render: text => `${text} mins` },
        { title: 'Lunch Start', dataIndex: 'lunchStart', key: 'lunchStart' },
        { title: 'Max Lunch', dataIndex: 'maxLunchDuration', key: 'maxLunchDuration', render: text => `${text} mins` },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm title="Delete this shift?" onConfirm={() => handleDelete(record._id)}>
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shift Management</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Add Shift
                </Button>
            </div>

            <Table columns={columns} dataSource={shifts} rowKey="_id" />

            <Modal
                title={editingShift ? "Edit Shift" : "Add Shift"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEditShift}>
                    <Form.Item name="name" label="Shift Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="loginTime" label="Login Time" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                        <Form.Item name="logoutTime" label="Logout Time" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" className="w-full" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="gracePeriod" label="Grace Period (mins)" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="maxLunchDuration" label="Max Lunch (mins)" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                    </div>

                    <Form.Item name="lunchStart" label="Lunch Start Time" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" className="w-full" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                        {editingShift ? "Update Shift" : "Create Shift"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default Shifts;
