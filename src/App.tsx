import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth/*" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route 
        path="/dashboard/*" 
        element={user ? <Dashboard /> : <Navigate to="/auth/login" />} 
      />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/login"} />} />
    </Routes>
  );
};

export default App;