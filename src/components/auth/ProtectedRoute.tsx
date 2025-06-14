
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading authentication status...</div>; // Or a spinner component
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
