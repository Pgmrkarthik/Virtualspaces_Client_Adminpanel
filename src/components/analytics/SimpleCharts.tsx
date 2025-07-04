import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import type { UserAnalytics } from '../../types/user';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// type SimpleChartsProps = {
//   analytics: {
//     totalUsers: number[];
//     totalVisits: number[];
//     labels: string[];
//     countryData: { [country: string]: number };
//   };
// };

const SimpleCharts: React.FC<{ analytics: UserAnalytics }> = ({ analytics }) => {
  const { totalUsers, totalVisits, locationData } = analytics;
  if (!totalUsers || !totalVisits || !locationData) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const labels = locationData.map(loc => loc.location);
  // Bar chart for Total Users
  const usersData = {
    labels,
    datasets: [
      {
        label: 'Total Users',
        data: totalUsers,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  // Bar chart for Total Visits
  const visitsData = {
    labels,
    datasets: [
      {
        label: 'Total Visits',
        data: totalVisits,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };

  // Pie chart for Country-wise Users
  const pieData = {
    labels: Object.keys(locationData).length > 0 ? Object.keys(locationData) : ['Unknown'],
    datasets: [
      {
        label: 'Users by Country',
        data: Object.values(locationData),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#34d399'
        ],
      },
    ],
  };

  const animation = {
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <h3 className="text-center font-semibold mb-2">Total Users</h3>
        <Bar data={usersData} options={{ ...animation, responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <h3 className="text-center font-semibold mb-2">Total Visits</h3>
        <Bar data={visitsData} options={{ ...animation, responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <h3 className="text-center font-semibold mb-2">Users by Country</h3>
        <Pie data={pieData} options={{ ...animation, responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
};

export default SimpleCharts;

// In your AnalyticsTab or any parent component
