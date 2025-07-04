import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AnalyticsChartProps = {
  fetchChartData: (params: { filter: string, startDate?: Date, endDate?: Date }) => Promise<any>;
};

const FILTERS = [
  { label: 'By Day', value: 'day' },
  { label: 'By Week', value: 'week' },
  { label: 'By Month', value: 'month' },
  { label: 'Custom Range', value: 'custom' },
];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ fetchChartData }) => {
  const [filter, setFilter] = useState('day');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const params: any = { filter };
      if (filter === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const data = await fetchChartData(params);
      setChartData(data);
      setLoading(false);
    };
    if (filter !== 'custom' || (startDate && endDate)) {
      loadData();
    }
  }, [filter, startDate, endDate, fetchChartData]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-8">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.value}
            className={`px-4 py-2 rounded ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        {filter === 'custom' && (
          <>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="border rounded px-2 py-1"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
             
              placeholderText="End Date"
              className="border rounded px-2 py-1"
            />
          </>
        )}
      </div>
      {loading ? (
        <div className="text-center py-8">Loading chart...</div>
      ) : chartData ? (
        <Bar
          data={{
            labels: chartData.labels,
            datasets: [
              {
                label: 'Total Users',
                data: chartData.totalUsers,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
              },
              {
                label: 'Total Visits',
                data: chartData.totalVisits,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
              },
              {
                label: 'Total Time Spent (hrs)',
                data: chartData.totalTimeSpent.map((ms: number) => (ms / 3600000).toFixed(2)),
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' as const },
              tooltip: { mode: 'index', intersect: false },
            },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      ) : (
        <div className="text-center py-8">No data available.</div>
      )}
    </div>
  );
};

export default AnalyticsChart;