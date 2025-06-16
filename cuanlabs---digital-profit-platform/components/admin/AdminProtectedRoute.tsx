
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTE_PATHS } from '../../constants';

const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-3 text-darktext">Memeriksa akses admin...</p>
      </div>
    );
  }
  
  // If authenticated and is an admin, render the child routes (Outlet)
  // Otherwise, redirect to login or home page
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to={isAuthenticated ? ROUTE_PATHS.HOME : ROUTE_PATHS.LOGIN} replace />;
};

export default AdminProtectedRoute;
