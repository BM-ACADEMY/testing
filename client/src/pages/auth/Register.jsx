import React from 'react';
import { Form, Input, Button, Card, Typography, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const result = await register(values);
        setLoading(false);
        if (result.success) {
            message.success('Registration successful');
            // Navigate handled in context, but just in case
        } else {
            message.error(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-4"
            >
                <Card className="shadow-lg rounded-xl overflow-hidden glassmorphism-effect">
                    <div className='text-center mb-6'>
                        <Title level={2} className="text-gray-800">Create Account</Title>
                        <Text type="secondary">Join the team</Text>
                    </div>

                    <Form
                        name="register_form"
                        initialValues={{ role: 'Employee' }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Please input your Name!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Full Name" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[{ required: true, message: 'Please select a role!' }]}
                        >
                            <Select placeholder="Select a role">
                                <Option value="Employee">Employee</Option>
                                <Option value="Intern">Intern</Option>
                                <Option value="HR">HR</Option>
                                <Option value="CEO">CEO</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-md font-medium" loading={loading}>
                                Register
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Text>Already have an account? <Link to="/login" className='text-blue-500 hover:underline'>Login</Link></Text>
                        </div>
                    </Form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
