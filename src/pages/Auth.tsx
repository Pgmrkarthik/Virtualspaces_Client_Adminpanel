import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default Auth;