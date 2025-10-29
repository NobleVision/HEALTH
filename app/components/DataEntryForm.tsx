'use client';

import { useState } from 'react';

interface MetricInput {
  type: string;
  value: string;
  unit: string;
}

interface DataEntryFormProps {
  userId: number;
  onSuccess: () => void;
}

const METRIC_TEMPLATES = [
  { type: 'Blood Pressure Systolic', unit: 'mmHg', placeholder: '120' },
  { type: 'Blood Pressure Diastolic', unit: 'mmHg', placeholder: '80' },
  { type: 'Weight', unit: 'lbs', placeholder: '180' },
  { type: 'Steps', unit: 'steps', placeholder: '8000' },
  { type: 'Heart Rate', unit: 'bpm', placeholder: '72' },
  { type: 'Sleep', unit: 'hours', placeholder: '7.5' },
  { type: 'Water Intake', unit: 'oz', placeholder: '64' },
  { type: 'Exercise Duration', unit: 'minutes', placeholder: '30' },
  { type: 'Mood', unit: '1-10', placeholder: '7' },
];

export default function DataEntryForm({ userId, onSuccess }: DataEntryFormProps) {
  const [metrics, setMetrics] = useState<MetricInput[]>([
    { type: 'Blood Pressure Systolic', value: '', unit: 'mmHg' },
    { type: 'Weight', value: '', unit: 'lbs' },
    { type: 'Steps', value: '', unit: 'steps' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMetricChange = (index: number, value: string) => {
    const newMetrics = [...metrics];
    newMetrics[index].value = value;
    setMetrics(newMetrics);
  };

  const handleAddMetric = () => {
    setMetrics([...metrics, { type: 'Heart Rate', value: '', unit: 'bpm' }]);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const filledMetrics = metrics.filter((m) => m.value.trim());

      if (filledMetrics.length === 0) {
        setError('Please enter at least one metric');
        setLoading(false);
        return;
      }

      for (const metric of filledMetrics) {
        const response = await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            metricType: metric.type,
            value: parseFloat(metric.value),
            unit: metric.unit,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save ${metric.type}`);
        }
      }

      setSuccess(`Successfully saved ${filledMetrics.length} metric(s)!`);
      setMetrics([
        { type: 'Blood Pressure Systolic', value: '', unit: 'mmHg' },
        { type: 'Weight', value: '', unit: 'lbs' },
        { type: 'Steps', value: '', unit: 'steps' },
      ]);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Quick Entry</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {metric.type}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={metric.value}
                  onChange={(e) => handleMetricChange(index, e.target.value)}
                  placeholder={METRIC_TEMPLATES.find((t) => t.type === metric.type)?.placeholder}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-lg"
                />
                <span className="px-3 py-3 bg-gray-100 rounded-lg text-gray-700 font-medium min-w-fit">
                  {metric.unit}
                </span>
              </div>
            </div>
            {metrics.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMetric(index)}
                className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={handleAddMetric}
          className="flex-1 px-4 py-3 border-2 border-indigo-300 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
        >
          + Add Metric
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
      >
        {loading ? 'Saving...' : '✓ Save Metrics'}
      </button>
    </form>
  );
}

