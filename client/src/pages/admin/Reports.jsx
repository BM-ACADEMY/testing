import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';

// Placeholder for Reports
const Reports = () => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Reports & Analytics</h2>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Total Employees" value={10} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Present Today" value={8} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Absent Today" value={2} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="On Leave" value={1} />
                    </Card>
                </Col>
            </Row>

            <div className="mt-8 p-8 text-center text-gray-500 bg-gray-50 rounded">
                Detailed reports feature is coming soon.
            </div>
        </div>
    );
};

export default Reports;
