import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import api from '../utils/axios';

const { Option } = Select;

const UserManagement = ({ allowedRoles, title }) => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [shifts, setShifts] = useState([]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchShifts = async () => {
        try {
            const { data } = await api.get('/shifts');
            setShifts(data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchUsers();
        if (allowedRoles.includes('Employee')) {
            fetchShifts();
        }
    }, [allowedRoles]);

    const handleAddUser = async (values) => {
        setLoading(true);
        try {
            if (values._id) {
                await api.put(`/users/${values._id}`, values);
                message.success('User updated successfully');
            } else {
                await api.post('/users', values);
                message.success('User created successfully');
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            message.error(error.response?.data?.message || 'Operation failed');
        }
        setLoading(false);
    };

    const handleEdit = (record) => {
        form.setFieldsValue({
            ...record,
            shiftId: record.shift?._id
        });
        setIsModalVisible(true);
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Role', dataIndex: 'role', key: 'role', render: text => <Tag color="blue">{text}</Tag> },
        { title: 'Shift', dataIndex: 'shift', key: 'shift', render: shift => shift?.name || '-' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                    form.resetFields();
                    setIsModalVisible(true);
                }}>
                    Add New
                </Button>
            </div>

            <Table columns={columns} dataSource={users} rowKey="_id" />

            <Modal
                title={form.getFieldValue('_id') ? `Edit ${title}` : `Add ${title}`}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddUser}>
                    <Form.Item name="_id" hidden><Input /></Form.Item>
                    <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: false }]}>
                        <Input.Password placeholder={form.getFieldValue('_id') ? "Leave blank to keep current" : "Password"} />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select Role">
                            {allowedRoles.map(role => (
                                <Option key={role} value={role}>{role}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {(allowedRoles.includes('Employee') || allowedRoles.includes('Intern')) && (
                        <Form.Item name="shiftId" label="Assign Shift">
                            <Select placeholder="Select Shift">
                                {shifts.map(shift => (
                                    <Option key={shift._id} value={shift._id}>{shift.name} ({shift.loginTime} - {shift.logoutTime})</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                        {form.getFieldValue('_id') ? "Update User" : "Create User"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
