import React from 'react';
import UserManagement from '../../components/UserManagement';

const Employees = () => {
    return (
        <div>
            <UserManagement title="Employees & Interns" allowedRoles={['Employee', 'Intern']} />
        </div>
    );
};

export default Employees;
