import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { UserOutlined, TeamOutlined, ScheduleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const HRDashboard = () => {
    // Mock data
    const stats = [
        { title: 'Total Employees', value: 120, icon: <TeamOutlined />, color: '#1890ff' },
        { title: 'Present Today', value: 95, icon: <CheckCircleOutlined />, color: '#52c41a' },
        { title: 'On Leave', value: 5, icon: <UserOutlined />, color: '#faad14' },
        { title: 'Late Arrivals', value: 12, icon: <ScheduleOutlined />, color: '#f5222d' },
    ];

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Role', dataIndex: 'role', key: 'role', render: text => <Tag color="blue">{text}</Tag> },
        { title: 'Status', dataIndex: 'status', key: 'status', render: text => <Tag color={text === 'Present' ? 'green' : 'red'}>{text}</Tag> },
        { title: 'Check In', dataIndex: 'checkIn', key: 'checkIn' },
    ];

    const data = [
        { key: '1', name: 'John Doe', role: 'Employee', status: 'Present', checkIn: '09:00 AM' },
        { key: '2', name: 'Jane Smith', role: 'Intern', status: 'Absent', checkIn: '-' },
        { key: '3', name: 'Alice Johnson', role: 'Employee', status: 'Present', checkIn: '09:15 AM' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold mb-6">HR Dashboard</h2>

            <Row gutter={[16, 16]} className="mb-8">
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={<span style={{ color: stat.color, marginRight: 8 }}>{stat.icon}</span>}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title="Today's Attendance Overview" className="shadow-sm">
                <Table columns={columns} dataSource={data} pagination={false} />
            </Card>
        </motion.div>
    );
};

export default HRDashboard;
