import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import MainLayout from './components/layout/MainLayout';

import HRDashboard from './pages/hr/HRDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CEODashboard from './pages/ceo/CEODashboard';
import Employees from './pages/admin/Employees';
import HRs from './pages/admin/HRs';
import Shifts from './pages/admin/Shifts';
import HRAttendance from './pages/hr/Attendance';
import EmployeeAttendance from './pages/employee/Attendance';
import Leaves from './pages/employee/Leaves';
import EmployeeHolidays from './pages/employee/Holidays';
import Holidays from './pages/hr/Holidays';
import Reports from './pages/admin/Reports';
import Profile from './pages/common/Profile';
import Requests from './pages/common/Requests';
import PermissionAnalytics from './pages/common/PermissionAnalytics';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50">
    <Loader2 className="animate-spin text-blue-600" size={48} />
  </div>
);

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
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
  if (loading) return <LoadingSpinner />;

  if (user) {
    if (user.role === 'HR') return <Navigate to="/hr/dashboard" />;
    if (user.role === 'CEO') return <Navigate to="/ceo/dashboard" />;
    return <Navigate to="/employee/dashboard" />;
  }
  return <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
            <Route path="attendance" element={<HRAttendance />} />
            <Route path="employee/:userId/analytics" element={<PermissionAnalytics />} />
            <Route path="requests" element={<Requests />} />
            <Route path="holidays" element={<Holidays />} />
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
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="permissions/analytics" element={<PermissionAnalytics />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="holidays" element={<EmployeeHolidays />} />
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
            <Route path="shifts" element={<Shifts />} />
            <Route path="attendance" element={<HRAttendance />} />

            <Route path="employee/:userId/analytics" element={<PermissionAnalytics />} />
            <Route path="requests" element={<Requests />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="reports" element={<div>Reports (Coming Soon)</div>} />
            <Route path="hrs" element={<HRs />} />
            <Route path="profile" element={<Profile />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
