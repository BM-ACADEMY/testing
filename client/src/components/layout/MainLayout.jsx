import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut,
    Settings,
    Menu,
    X,
    Bell,
    User,
    ChevronDown,
    Briefcase,
    CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const getMenuItems = () => {
        const role = user?.role;
        const items = [];

        // Dashboard (Common)
        items.push({
            key: 'dashboard',
            icon: <LayoutDashboard size={20} />,
            label: 'Dashboard',
            path: `/${role?.toLowerCase()}/dashboard`
        });

        if (role === 'HR') {
            items.push(
                { key: 'requests', icon: <CheckSquare size={20} />, label: 'Requests', path: '/hr/requests' },
                { key: 'employees', icon: <Users size={20} />, label: 'Employees & Interns', path: '/hr/employees' },
                { key: 'shifts', icon: <Calendar size={20} />, label: 'Shifts', path: '/hr/shifts' },
                { key: 'holidays', icon: <Calendar size={20} />, label: 'Holidays', path: '/hr/holidays' },
                { key: 'attendance', icon: <FileText size={20} />, label: 'Attendance', path: '/hr/attendance' },
                { key: 'reports', icon: <FileText size={20} />, label: 'Reports', path: '/hr/reports' }
            );
        } else if (role === 'CEO') {
            items.push(
                { key: 'requests', icon: <CheckSquare size={20} />, label: 'Requests', path: '/ceo/requests' },
                { key: 'hrs', icon: <Users size={20} />, label: 'Manage HRs', path: '/ceo/hrs' },
                { key: 'holidays', icon: <Calendar size={20} />, label: 'Holidays', path: '/hr/holidays' },
                { key: 'attendance', icon: <FileText size={20} />, label: 'Attendance', path: '/hr/attendance' },
                { key: 'analytics', icon: <LayoutDashboard size={20} />, label: 'Analytics', path: '/ceo/analytics' },
            );
        } else {
            // Employee
            items.push(
                { key: 'attendance', icon: <FileText size={20} />, label: 'My Attendance', path: '/employee/attendance' },
                { key: 'leaves', icon: <Calendar size={20} />, label: 'Leaves & Permissions', path: '/employee/leaves' },
                { key: 'holidays', icon: <Calendar size={20} />, label: 'Holidays', path: '/employee/holidays' }
            );
        }

        // Profile link (Last)
        items.push({
            key: 'profile',
            icon: <Settings size={20} />,
            label: 'Profile',
            path: `/${role?.toLowerCase()}/profile`
        });

        return items;
    };

    const menuItems = getMenuItems();

    // Helper to check active state
    const isLinkActive = (path) => {
        if (path === '/' || path.endsWith('/dashboard')) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    // Construct image URL safely
    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it sends full path with backslashes
        const normalizedPath = imagePath.replace(/\\/g, '/');
        // If it doesn't start with http, prepend API URL
        if (normalizedPath.startsWith('http')) return normalizedPath;
        return `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 pb-16 md:pb-0">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop Hidden on Mobile if you want purely bottom nav,
                but usually sidebar is still accessible via hamburger on mobile.
                However, user requested bottom nav. Let's keep sidebar for tablet/desktop) */}
            <motion.aside
                className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 flex-col hidden md:flex transition-transform duration-300 ease-in-out`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                            <Briefcase size={20} strokeWidth={2.5} />
                        </div>
                        <span>Attendo</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = isLinkActive(item.path);
                        return (
                            <Link
                                key={item.key}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
                    {/* Hamburger (Mobile Only) - If using bottom nav, maybe we don't need this, but good for redundancy or drawer */}
                    <div className="md:hidden flex items-center gap-2 font-bold text-gray-800">
                        <Briefcase size={20} className="text-blue-600" />
                        <span>Attendo</span>
                    </div>

                    {/* Page Title */}
                    <div className="hidden md:block text-gray-500 text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 ml-auto">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-full transition-colors focus:outline-none"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-md overflow-hidden">
                                    {user?.profileImage ? (
                                        <img src={getProfileImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0) || <User size={16} />
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col items-start mr-1">
                                    <span className="text-sm font-semibold text-gray-700 leading-none">{user?.name}</span>
                                    <span className="text-xs text-gray-500 mt-1">{user?.role}</span>
                                </div>
                                <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden origin-top-right focus:outline-none z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            to={`/${user?.role?.toLowerCase()}/profile`}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User size={16} />
                                            Your Profile
                                        </Link>
                                        <div className="border-t border-gray-50 my-1"></div>
                                        <button
                                            onClick={logout}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Click outside to close profile dropdown */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setIsProfileOpen(false)}></div>
            )}

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around h-16 md:hidden z-40 px-2 safe-area-pb">
                {/* 3 Key Items: Dashboard, Requests (if HR/CEO), Profile */}
                <Link
                    to={`/${user?.role?.toLowerCase()}/dashboard`}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLinkActive(`/${user?.role?.toLowerCase()}/dashboard`) ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-medium mt-1">Home</span>
                </Link>

                {(user?.role === 'HR' || user?.role === 'CEO') && (
                    <Link
                        to={`/${user?.role?.toLowerCase()}/requests`}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLinkActive(`/${user?.role?.toLowerCase()}/requests`) ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                        <CheckSquare size={24} />
                        <span className="text-[10px] font-medium mt-1">Requests</span>
                    </Link>
                )}

                <Link
                    to={`/${user?.role?.toLowerCase()}/profile`}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${isLinkActive(`/${user?.role?.toLowerCase()}/profile`) ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <User size={24} />
                    <span className="text-[10px] font-medium mt-1">Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default MainLayout;
