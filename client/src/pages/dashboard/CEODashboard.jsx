import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { RiseOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const CEODashboard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold mb-6">Executive Overview</h2>

            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Workforce"
                            value={120}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Attendance Rate"
                            value={92.5}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Absenteeism"
                            value={7.5}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-6">
                <Col span={24}>
                    <Card title="Department Wise Attendance" className="h-64 flex items-center justify-center">
                        <span className="text-gray-400">Chart Placeholder</span>
                    </Card>
                </Col>
            </Row>

        </motion.div>
    );
};

export default CEODashboard;
