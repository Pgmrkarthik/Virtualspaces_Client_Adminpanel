// src/components/dashboard/AnalyticsTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getInteractionCountAnalytics, getTotalTimeSpendingByElement, getUserAnalytics } from '../../services/user';
import type { ElementInteractionCount, ElementTimeSpent, FilterOptions, UserAnalytics } from '../../types/user';
import Card from '../ui/Card';

import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  PieController, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  BarController,
  type ChartOptions 
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, PieController, BarElement, CategoryScale, LinearScale, BarController);

const AnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState<ElementTimeSpent[] | null>(null);
  const [totalInteractionCount, setTotalInteractionCount] = useState<ElementInteractionCount[] | null>(null);
  const [interactionFilter, setInteractionFilter] = useState<'today' | 'lastWeek' | 'lastMonth' | 'alltime'>('alltime');
  const [chartsLoading, setChartsLoading] = useState<boolean>(true);
  const [interactionLoading, setInteractionLoading] = useState<boolean>(false);

  // Refs for chart instances
  const pieRef = useRef<HTMLCanvasElement | null>(null);
  const timeSpentRef = useRef<HTMLCanvasElement | null>(null);
  const interactionCountRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const timeSpentChartInstance = useRef<Chart | null>(null);
  const interactionCountChartInstance = useRef<Chart | null>(null);

  // Fetch all initial data
  useEffect(() => {
    const fetchAllInitialData = async () => {
      try {
        setLoading(true);
        setChartsLoading(true);
        
        // Fetch all data in parallel
        const [analyticsData, timeSpentData, interactionData] = await Promise.all([
          getUserAnalytics(),
          getTotalTimeSpendingByElement(),
          getInteractionCountAnalytics({
            period: 'alltime',
            startDate: null,
            endDate: null,
          })
        ]);

        // Set all data at once to prevent multiple re-renders
        setAnalytics(analyticsData);
        setTotalTimeSpent(timeSpentData);
        setTotalInteractionCount(interactionData);
        setChartsLoading(false);
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load analytics data');
        setChartsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAllInitialData();
  }, []);

  // Fetch interaction count analytics when filter changes (skip initial alltime load)
  useEffect(() => {
    // Skip if initial load or charts still loading
    
    const fetchInteractionCountAnalytics = async () => {
      try {
        setInteractionLoading(true);
        const filterOptions: FilterOptions = {
          period: interactionFilter,
          startDate: null,
          endDate: null,
        };
        const data = await getInteractionCountAnalytics(filterOptions);
        setTotalInteractionCount(data);
      } catch (err) {
        console.error('Error fetching interaction count data:', err);
        setError('Failed to load interaction count data');
      } finally {
        setInteractionLoading(false);
      }
    };

    fetchInteractionCountAnalytics();
  }, [interactionFilter, chartsLoading]);

  // Location Data Pie Chart
  useEffect(() => {
    if (!pieRef.current || !analytics?.locationData || chartsLoading) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Destroy previous chart instance if exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const ctx = pieRef.current?.getContext('2d');
      if (!ctx) return;

      try {
        const labels = analytics.locationData.map(loc => loc.location || 'Unknown');
        const data = analytics.locationData.map(loc => loc.count);
        const backgroundColor = [
          '#3b82f6', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#34d399',
          '#6366f1', '#fbbf24', '#e11d48', '#14b8a6'
        ];

        chartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                label: 'Visits',
                data,
                backgroundColor: backgroundColor,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
            },
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 800,
            },
          } as ChartOptions<'pie'>,
        });
      } catch (err) {
        console.error('Error creating location pie chart:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [analytics?.locationData, chartsLoading]);

  // Total Time Spent Donut Chart
  useEffect(() => {
    if (!timeSpentRef.current || !totalTimeSpent || chartsLoading) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Destroy previous chart if exists
      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy();
        timeSpentChartInstance.current = null;
      }

      const ctx = timeSpentRef.current?.getContext('2d');
      if (!ctx) return;

      try {
        // Filter out items where elementType is 'space' (case-insensitive)
        const filteredTimeSpent = totalTimeSpent.filter(
          item => (item.elementType || '').toLowerCase() !== 'space'
        );

        if (filteredTimeSpent.length === 0) return;

        const labels = filteredTimeSpent.map(item => item.elementType || 'Unknown');
        const data = filteredTimeSpent.map(item => Math.round((item.totalTimeSpent || 0) / 60000)); // Convert to minutes
        
        const backgroundColor = [
          '#6366f1', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#34d399',
          '#3b82f6', '#fbbf24', '#e11d48', '#14b8a6'
        ];

        timeSpentChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              label: 'Time Spent (min)',
              data,
              backgroundColor: backgroundColor.slice(0, data.length),
              borderWidth: 2,
              borderColor: '#ffffff',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                display: true,
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: { 
                enabled: true,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value} min (${percentage}%)`;
                  }
                }
              },
            },
            animation: {
              duration: 800,
              easing: 'easeOutQuart',
            },
            cutout: '60%',
          },
        });
      } catch (err) {
        console.error('Error creating time spent donut chart:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy();
        timeSpentChartInstance.current = null;
      }
    };
  }, [totalTimeSpent, chartsLoading]);

  // Total Interaction Count Chart
  useEffect(() => {
    if (!interactionCountRef.current || !totalInteractionCount || interactionLoading) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Destroy previous chart if exists
      if (interactionCountChartInstance.current) {
        interactionCountChartInstance.current.destroy();
        interactionCountChartInstance.current = null;
      }

      const ctx = interactionCountRef.current?.getContext('2d');
      if (!ctx) return;

      try {
        const labels = totalInteractionCount.map(item => item.element || 'Unknown');
        const data = totalInteractionCount.map(item => item.count || 0);

        interactionCountChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Total Interactions',
              data,
              backgroundColor: labels.map((_, idx) =>
                [
                  '#10b981', '#6366f1', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#34d399',
                  '#3b82f6', '#fbbf24', '#e11d48', '#14b8a6'
                ][idx % 12]
              ),
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
            },
            animation: {
              duration: 800,
              easing: 'easeOutQuart',
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      } catch (err) {
        console.error('Error creating interaction count chart:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (interactionCountChartInstance.current) {
        interactionCountChartInstance.current.destroy();
        interactionCountChartInstance.current = null;
      }
    };
  }, [totalInteractionCount, interactionLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      if (timeSpentChartInstance.current) {
        timeSpentChartInstance.current.destroy();
        timeSpentChartInstance.current = null;
      }
      if (interactionCountChartInstance.current) {
        interactionCountChartInstance.current.destroy();
        interactionCountChartInstance.current = null;
      }
    };
  }, []);

  const handleFilterChange = (filter: 'today' | 'lastWeek' | 'lastMonth' | 'alltime') => {
    setInteractionFilter(filter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-600 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase">Total Users</p>
              <p className="text-3xl font-bold">{analytics?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>
        
        {/* Total Visits Card */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-600 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase">Total Visits</p>
              <p className="text-3xl font-bold">{analytics?.totalVisits || 0}</p>
            </div>
          </div>
        </Card>
        
        {/* Total Time Spent Card */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-600 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase">Total Watch Hours</p>
              <p className="text-3xl font-bold">
                {totalTimeSpent ? 
                  Math.round(totalTimeSpent.reduce((acc, item) => acc + (item.totalTimeSpent || 0), 0) / 3600000).toLocaleString() + ' hr' 
                  : '0 hr'
                }
              </p>
            </div>
          </div>
        </Card>
        
        {/* Average Visits Per User Card */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-600 bg-opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium uppercase">Avg. Visits Per User</p>
              <p className="text-3xl font-bold">
                {analytics ? (analytics.totalUsers > 0 ? (analytics.totalVisits / analytics.totalUsers).toFixed(2) : '0.00') : '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Location Data Pie Chart */}
        <Card title="Global Reach" className="lg:col-span-1">
          <div className="flex flex-col items-center py-6">
            {chartsLoading ? (
              <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : analytics?.locationData && analytics.locationData.length > 0 ? (
              <>
                <div className="w-full h-64 mb-4">
                  <canvas ref={pieRef} />
                </div>
                <div className="w-full">
                  <h3 className="font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Country List</h3>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-32 overflow-y-auto">
                    {analytics.locationData.map((loc, idx) => (
                      <li key={loc.location || idx} className="flex items-center justify-between py-2">
                        <span className="flex items-center">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: [
                              '#3b82f6', '#10b981', '#f59e42', '#ef4444', '#a78bfa', '#f472b6', '#facc15', '#34d399',
                              '#6366f1', '#fbbf24', '#e11d48', '#14b8a6'
                            ][idx % 12] }}
                          ></span>
                          <span className="text-sm">{loc.location || 'Unknown'}</span>
                        </span>
                        <span className="font-medium text-sm">{loc.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-300 w-full h-64 flex items-center justify-center">
                No location data available
              </div>
            )}
          </div>
        </Card>

        {/* Total Time Spent Donut Chart */}
        <Card title="Time Spent" className="lg:col-span-1">
          <div className="py-6">
            {chartsLoading ? (
              <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : totalTimeSpent && totalTimeSpent.filter(item => (item.elementType || '').toLowerCase() !== 'space').length > 0 ? (
              <div className="w-full h-full">
                <canvas ref={timeSpentRef} />
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-300 w-full h-64 flex items-center justify-center">
                No time spent data available
              </div>
            )}
          </div>
        </Card>

        {/* Total Interaction Count Chart */}
        <Card className="lg:col-span-1 xl:col-span-1">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Total Interaction Count</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded text-sm ${interactionFilter === 'alltime' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => handleFilterChange('alltime')}
                disabled={interactionLoading}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${interactionFilter === 'lastMonth' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => handleFilterChange('lastMonth')}
                disabled={interactionLoading}
              >
                Last Month
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${interactionFilter === 'lastWeek' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => handleFilterChange('lastWeek')}
                disabled={interactionLoading}
              >
                Last Week
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${interactionFilter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => handleFilterChange('today')}
                disabled={interactionLoading}
              >
                Today
              </button>
            </div>
          </div>
          <div className="py-6">
            {interactionLoading ? (
              <div className="flex justify-center items-center h-64 w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : totalInteractionCount && totalInteractionCount.length > 0 ? (
              <div className="w-full h-64">
                <canvas ref={interactionCountRef} />
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-300 w-full h-64 flex items-center justify-center">
                {interactionFilter === 'today' ? 'No interactions have been made today' : 'No interaction data available'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;