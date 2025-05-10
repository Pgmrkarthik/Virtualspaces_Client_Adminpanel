import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import CustomizeTab from '../components/dashboard/CustomizeTab';
import UsersTab from '../components/dashboard/UsersTab';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/analytics" element={<AnalyticsTab />} />
        <Route path="/customize" element={<CustomizeTab />} />
        <Route path="/users" element={<UsersTab />} />
        <Route path="*" element={<Navigate to="/dashboard/analytics" />} />
      </Routes>
    </Layout>
  );
};

export default Dashboard;