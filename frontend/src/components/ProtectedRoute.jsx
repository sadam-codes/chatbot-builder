import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user) return <Navigate to="/auth" />;

  if (role) {
    const allowedRoles = role.split('|');
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />; 
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
