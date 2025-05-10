import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import AnalyticsTab from '../dashboard/AnalyticsTab';
import CustomizeTab from '../dashboard/CustomizeTab';
import UsersTab from '../dashboard/UsersTab';

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