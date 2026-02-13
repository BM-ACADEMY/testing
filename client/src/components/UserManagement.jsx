import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Tag } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import api from '../utils/axios';
import dayjs from 'dayjs';
import EmployeeDetailsModal from './modals/EmployeeDetailsModal';

const UserManagement = ({ allowedRoles, title }) => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [allowedRoles]);

    const handleAddUser = () => {
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedEmployee(user);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        message.success(selectedEmployee ? 'Employee updated successfully!' : 'Employee added successfully!');
        fetchUsers();
    };

    const handleEdit = (record) => {
        // 5. The instruction snippet *includes* the old `handleEdit` function. This means it should *remain* in the code, but its position might shift.
        //    The instruction shows it *after* `handleModalSuccess`.
        //    This implies the old `handleEdit` is still present, but `handleEditUser` is also present.
        //    This is a bit messy, but I must follow the instruction faithfully.
        //    The `handleEdit` in the `columns` will need to be updated to call `handleEditUser`.
        //    The instruction does not modify the `columns` definition.
        //    This means the `handleEdit` in the columns will still call the old `handleEdit` function.
        //    This is a logical inconsistency in the instruction.

        // I will make the change as literally as possible, inserting the new functions and modifying `useEffect`.
        // The `handleEdit` function from the original code will be kept, and the new `handleEditUser` will be added.
        // The instruction snippet shows `const handleEdit = (record) => { ... }` *after* `handleModalSuccess`.
        // This means the original `handleEdit` function should be moved to this new position.

        // Let's re-read the instruction carefully: "Simplify functions for new modal approach."
        // The provided `Code Edit` block shows the *new* state of the code.
        // It shows `useEffect` modified.
        // It shows `handleAddUser` replaced.
        // It shows `handleEditUser` added.
        // It shows `handleModalSuccess` added.
        // It then shows `const handleEdit = (record) => { ... }` which is the *original* `handleEdit` function.
        // This implies the original `handleEdit` function is *not* removed, but its position might be affected by the new insertions.
        // The instruction snippet shows it *after* `handleModalSuccess`.
        // This means the original `handleEdit` function should be moved to this new position.

        // This is the most faithful interpretation:
        // 1. Remove `fetchShifts` function.
        // 2. Modify `useEffect` to remove `fetchShifts` call.
        // 3. Replace the old `handleAddUser` with the new simplified one.
        // 4. Insert `handleEditUser` and `handleModalSuccess` after the new `handleAddUser`.
        // 5. The original `handleEdit` function (which was after `handleAddUser` in the original code) should now appear *after* `handleModalSuccess`.
        //    This means it's effectively moved.
    };



    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Joining Date', dataIndex: 'joiningDate', key: 'joiningDate', render: date => date ? dayjs(date).format('YYYY-MM-DD') : '-' },
        { title: 'Role', dataIndex: 'role', key: 'role', render: text => <Tag color="blue">{text}</Tag> },
        { title: 'Shift', dataIndex: 'shift', key: 'shift', render: shift => shift?.name || '-' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)}>Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                    Add New
                </Button>
            </div>

            <Table columns={columns} dataSource={users} rowKey="_id" />

            <EmployeeDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedEmployee}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default UserManagement;
