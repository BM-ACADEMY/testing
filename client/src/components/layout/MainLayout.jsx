import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    DashboardOutlined,
    TeamOutlined,
    ScheduleOutlined,
    FileTextOutlined,
    LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const getMenuItems = () => {
        const role = user?.role;
        const items = [
            {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: <Link to="/">Dashboard</Link>,
            },
        ];

        if (role === 'HR') {
            items.push(
                {
                    key: 'employees',
                    icon: <TeamOutlined />,
                    label: <Link to="/hr/employees">Employees & Interns</Link>,
                },
                {
                    key: 'shifts',
                    icon: <ScheduleOutlined />,
                    label: <Link to="/hr/shifts">Shifts</Link>,
                },
                {
                    key: 'attendance',
                    icon: <FileTextOutlined />,
                    label: <Link to="/hr/attendance">Attendance</Link>,
                },
                {
                    key: 'reports',
                    icon: <FileTextOutlined />,
                    label: <Link to="/hr/reports">Reports</Link>,
                }
            );
        } else if (role === 'CEO') {
            items.push(
                {
                    key: 'hrs',
                    icon: <TeamOutlined />,
                    label: <Link to="/ceo/hrs">Manage HRs</Link>,
                },
                {
                    key: 'attendance',
                    icon: <FileTextOutlined />,
                    label: <Link to="/hr/attendance">Attendance</Link>, // CEO sees all attendance too
                },
                {
                    key: 'shifts',
                    icon: <ScheduleOutlined />,
                    label: <Link to="/hr/shifts">Shifts</Link>, // CEO can manage shifts
                },
                {
                    key: 'analytics',
                    icon: <DashboardOutlined />,
                    label: <Link to="/ceo/analytics">Analytics</Link>,
                },
                {
                    key: 'reports',
                    icon: <FileTextOutlined />,
                    label: <Link to="/ceo/reports">Reports</Link>,
                }
            );
        } else {
            items.push(
                {
                    key: 'attendance',
                    icon: <FileTextOutlined />,
                    label: <Link to="/employee/attendance">My Attendance</Link>,
                },
                {
                    key: 'leaves',
                    icon: <ScheduleOutlined />,
                    label: <Link to="/employee/leaves">Leaves & Permissions</Link>,
                }
            );
        }

        // Add profile for all users
        items.push({
            key: 'profile',
            icon: <SettingOutlined />,
            label: <Link to={`/${user.role.toLowerCase()}/profile`}>Profile</Link>,
        });

        // Only add logout to bottom if NOT mobile (mobile has it in bottom nav or top right)
        // But for consistency let's keep it here for desktop sidebar
        items.push({
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
        });

        return items;
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
        }
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout} danger>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout className="min-h-screen">
            {/* Desktop Sidebar: Hidden on small screens */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                className="shadow-md z-10 hidden md:block" // Hidden on mobile
            >
                <div className="h-16 flex items-center justify-center border-b">
                    <Title level={4} className="m-0 text-blue-600">
                        {collapsed ? 'AMS' : 'Attendo'}
                    </Title>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={[location.pathname.split('/').pop() || 'dashboard']}
                    items={getMenuItems()}
                    onClick={handleMenuClick}
                    className="border-r-0"
                />
            </Sider>

            <Layout className="site-layout mb-16 md:mb-0">
                {/* Mobile Header */}
                <Header className="bg-white p-0 shadow-sm flex justify-between items-center px-4 md:hidden">
                    <Title level={4} className="m-0 text-blue-600">Attendo</Title>
                    <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                        <Avatar size="large" src={user?.profileImage ? `http://localhost:5000/${user.profileImage.replace(/\\/g, '/')}` : null} icon={<UserOutlined />} className="cursor-pointer bg-blue-100 text-blue-600" />
                    </Dropdown>
                </Header>

                {/* Desktop Header */}
                <Header className="bg-white p-0 shadow-sm flex justify-between items-center px-4 hidden md:flex" style={{ background: '#fff' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger text-xl cursor-pointer hover:text-blue-500 transition-colors',
                        onClick: () => setCollapsed(!collapsed),
                    })}

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <Text strong>{user?.name}</Text>
                            <Text type="secondary" className="text-xs">{user?.role}</Text>
                        </div>
                        <Dropdown overlay={userMenu} placement="bottomRight" arrow>
                            <Avatar size="large" src={user?.profileImage ? `http://localhost:5000/${user.profileImage.replace(/\\/g, '/')}` : null} icon={<UserOutlined />} className="cursor-pointer bg-blue-100 text-blue-600" />
                        </Dropdown>
                    </div>
                </Header>

                <Content
                    className="site-layout-background p-4 md:p-6 overflow-auto"
                    style={{
                        minHeight: 280,
                        background: '#f0f2f5',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t z-50 flex justify-around items-center h-16 shadow-lg">
                <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname.endsWith('dashboard') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <DashboardOutlined className="text-xl" />
                    <span className="text-xs">Home</span>
                </Link>

                {user?.role === 'HR' && (
                    <Link to="/hr/employees" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname.includes('employees') ? 'text-blue-600' : 'text-gray-500'}`}>
                        <TeamOutlined className="text-xl" />
                        <span className="text-xs">Team</span>
                    </Link>
                )}
                {user?.role === 'CEO' && (
                    <Link to="/ceo/hrs" className={`flex flex-col items-center justify-center w-full h-full ${location.pathname.includes('hrs') ? 'text-blue-600' : 'text-gray-500'}`}>
                        <TeamOutlined className="text-xl" />
                        <span className="text-xs">HRs</span>
                    </Link>
                )}

                {/* Shared Attendance Link for all */}
                <Link to={user?.role === 'Employee' ? "/employee/attendance" : "/hr/attendance"} className={`flex flex-col items-center justify-center w-full h-full ${location.pathname.includes('attendance') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <FileTextOutlined className="text-xl" />
                    <span className="text-xs">Attend</span>
                </Link>

                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500" onClick={logout}>
                    <LogoutOutlined className="text-xl" />
                    <span className="text-xs">Logout</span>
                </div>
            </div>
        </Layout>
    );
};

export default MainLayout;
