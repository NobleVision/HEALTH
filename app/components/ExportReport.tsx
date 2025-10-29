'use client';

import { useState } from 'react';

interface ExportReportProps {
  userId: number;
  userName: string;
}

type ExportFormat = 'csv' | 'markdown' | 'html' | 'text';

export default function ExportReport({ userId, userName }: ExportReportProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/export?userId=${userId}&format=${format}&days=${days}`);

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const ext = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : format;
      a.download = `health-report-${userName}-${new Date().toISOString().split('T')[0]}.${ext}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">📥 Export Report</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="csv">CSV (Spreadsheet)</option>
            <option value="markdown">Markdown (Documentation)</option>
            <option value="html">HTML (Web Page)</option>
            <option value="text">Plain Text</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period (Days)
          </label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Exporting...' : '⬇️ Download Report'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Export your data regularly for backup and to share with your healthcare provider.
        </p>
      </div>
    </div>
  );
}

