import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MainLayout from './components/layout/MainLayout';
import HRDashboard from './pages/dashboard/HRDashboard';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import CEODashboard from './pages/dashboard/CEODashboard';
import Employees from './pages/admin/Employees';
import HRs from './pages/admin/HRs';
import Shifts from './pages/admin/Shifts';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import Profile from './pages/common/Profile';
import { Spin } from 'antd';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;

  if (user) {
    if (user.role === 'HR') return <Navigate to="/hr/dashboard" />;
    if (user.role === 'CEO') return <Navigate to="/ceo/dashboard" />;
    return <Navigate to="/employee/dashboard" />;
  }
  return <Navigate to="/login" />;
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> Register removed */}

          <Route path="/" element={<DashboardRedirect />} />

          {/* HR Routes */}
          <Route path="/hr" element={
            <PrivateRoute roles={['HR']}>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="shifts" element={<Shifts />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={
            <PrivateRoute roles={['Employee', 'Intern']}>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* CEO Routes */}
          <Route path="/ceo" element={
            <PrivateRoute roles={['CEO']}>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<CEODashboard />} />
            <Route path="analytics" element={<CEODashboard />} />
            <Route path="reports" element={<div>Reports (Coming Soon)</div>} />
            <Route path="hrs" element={<HRs />} />
            <Route path="profile" element={<Profile />} />
            {/* Note: I need to add 'hrs' to CEO sidebar menu as well */}
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
