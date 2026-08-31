import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allow: ('government' | 'ngo')[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allow }) => {
  const role = useStore((state) => state.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) {
      navigate('/login');
    } else if (allow && !allow.includes(role)) {
      navigate('/login');
    }
  }, [role, allow, navigate]);

  if (!role || (allow && !allow.includes(role))) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
