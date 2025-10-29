'use client';

import { useEffect, useState } from 'react';

interface AIInsightsProps {
  userId: number;
  refreshTrigger: number;
}

interface InsightsData {
  insights: string;
  recommendations: string[];
  anomalies: string[];
}

export default function AIInsights({ userId, refreshTrigger }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, [userId, refreshTrigger]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Analyzing your health data...</p>
          </div>
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

  if (!insights) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        No insights available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 border border-indigo-200">
        <h3 className="text-2xl font-bold text-indigo-900 mb-4">🤖 AI Health Insights</h3>
        <p className="text-indigo-800 text-lg leading-relaxed">{insights.insights}</p>
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Personalized Recommendations</h3>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="text-2xl">✨</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anomalies */}
      {insights.anomalies && insights.anomalies.length > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow-md p-6 border border-yellow-200">
          <h3 className="text-xl font-bold text-yellow-900 mb-4">⚠️ Alerts & Anomalies</h3>
          <ul className="space-y-3">
            {insights.anomalies.map((anomaly, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="text-2xl">🔔</span>
                <span className="text-yellow-800">{anomaly}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={fetchInsights}
        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
      >
        🔄 Refresh Insights
      </button>
    </div>
  );
}

