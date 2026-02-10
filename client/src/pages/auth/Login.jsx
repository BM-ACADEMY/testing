import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const Login = () => {
    const { login } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const result = await login(values.email, values.password);
        setLoading(false);
        if (result.success) {
            message.success('Login successful');
        } else {
            message.error(result.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-4"
            >
                <Card className="shadow-lg rounded-xl overflow-hidden glassmorphism-effect">
                    <div className='text-center mb-6'>
                        <Title level={2} className="text-gray-800">Welcome Back</Title>
                        <Text type="secondary">Sign in to your account</Text>
                    </div>

                    <Form
                        name="login_form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 rounded-md font-medium" loading={loading}>
                                Log in
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <Text>Don't have an account? <Link to="/register" className='text-blue-500 hover:underline'>Register</Link></Text>
                        </div>
                    </Form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
