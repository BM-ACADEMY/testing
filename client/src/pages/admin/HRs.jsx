import React from 'react';
import UserManagement from '../../components/UserManagement';

const HRs = () => {
    return (
        <div>
            <UserManagement title="HR Managers" allowedRoles={['HR']} />
        </div>
    );
};

export default HRs;
