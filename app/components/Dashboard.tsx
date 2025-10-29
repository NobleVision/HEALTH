'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthMetric, MetricAnalysis, analyzeMetrics, getTrendData, formatBloodPressure, getBloodPressureSystolic } from '@/lib/analytics';

interface DashboardProps {
  userId: number;
  refreshTrigger: number;
}

export default function Dashboard({ userId, refreshTrigger }: DashboardProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [analysis, setAnalysis] = useState<MetricAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, [userId, refreshTrigger]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics?userId=${userId}&days=30`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setAnalysis(analyzeMetrics(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
        No health data yet. Start by entering your first metrics!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis.map((metric) => {
          // Get the most recent metric for blood pressure formatting
          const recentMetric = metrics.find((m) => m.metric_type === metric.metricType);
          const isBloodPressure = metric.metricType === 'Blood Pressure';

          return (
            <div key={metric.metricType} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{metric.metricType}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current:</span>
                  <span className="font-bold text-indigo-600">
                    {isBloodPressure && recentMetric
                      ? formatBloodPressure(recentMetric)
                      : `${metric.current} ${metric.unit}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="text-gray-800">
                    {isBloodPressure ? `${metric.average} ${metric.unit}` : `${metric.average} ${metric.unit}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Range:</span>
                  <span className="text-gray-800">
                    {metric.min} - {metric.max} {metric.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Trend:</span>
                  <span
                    className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      metric.trend === 'improving'
                        ? 'bg-green-100 text-green-800'
                        : metric.trend === 'declining'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {metric.trend === 'improving' ? '📈 Improving' : metric.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Trends (Last 30 Days)</h3>
        <div className="space-y-8">
          {analysis.map((metric) => {
            const trendData = getTrendData(
              metrics.filter((m) => m.metric_type === metric.metricType)
            );

            return (
              <div key={metric.metricType}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">{metric.metricType}</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      dot={false}
                      name={metric.metricType}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Projections */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🔮 7-Day Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis.map((metric) => (
            <div key={metric.metricType} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">{metric.metricType}</h4>
              <div className="space-y-2">
                {metric.projection7Days.map((value, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">Day {idx + 1}:</span>
                    <span className="font-medium text-indigo-600">
                      {value} {metric.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

