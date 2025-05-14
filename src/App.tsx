import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Show loading indicator while checking localStorage
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Routes>
      <Route path="/auth/*" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />} />
    </Routes>
  );
};

export default App;