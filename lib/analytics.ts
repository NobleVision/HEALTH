export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  pulse?: number;
}

export interface HealthMetric {
  id: number;
  user_id: number;
  metric_type: string;
  value: number;
  unit: string | null;
  composite_data?: BloodPressureData | null;
  timestamp: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface MetricAnalysis {
  metricType: string;
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'improving' | 'declining' | 'stable';
  projection7Days: number[];
  unit: string | null;
}

export function groupMetricsByType(metrics: HealthMetric[]): Record<string, HealthMetric[]> {
  return metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.metric_type]) {
        acc[metric.metric_type] = [];
      }
      acc[metric.metric_type].push(metric);
      return acc;
    },
    {} as Record<string, HealthMetric[]>
  );
}

export function getTrendData(metrics: HealthMetric[]): TrendData[] {
  return metrics
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((m) => ({
      date: new Date(m.timestamp).toLocaleDateString(),
      value: m.value,
    }));
}

export function calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
  if (values.length < 2) return 'stable';

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  // For metrics like weight, lower is better; for steps, higher is better
  // This is a simple heuristic - in production, you'd want metric-specific logic
  const change = secondAvg - firstAvg;
  if (Math.abs(change) < firstAvg * 0.05) return 'stable';
  return change < 0 ? 'improving' : 'declining';
}

export function projectNext7Days(values: number[]): number[] {
  if (values.length === 0) return [];

  // Simple linear regression for projection
  const n = Math.min(values.length, 14); // Use last 14 days
  const recentValues = values.slice(-n);

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < recentValues.length; i++) {
    sumX += i;
    sumY += recentValues[i];
    sumXY += i * recentValues[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const projections = [];
  for (let i = 1; i <= 7; i++) {
    projections.push(Math.round((intercept + slope * (recentValues.length + i)) * 100) / 100);
  }

  return projections;
}

export function analyzeMetrics(metrics: HealthMetric[]): MetricAnalysis[] {
  const grouped = groupMetricsByType(metrics);

  return Object.entries(grouped).map(([metricType, metricList]) => {
    const values = metricList.map((m) => m.value).sort((a, b) => a - b);
    const sortedByTime = metricList.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      metricType,
      current: sortedByTime[0].value,
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      min: values[0],
      max: values[values.length - 1],
      trend: calculateTrend(values),
      projection7Days: projectNext7Days(values),
      unit: sortedByTime[0].unit,
    };
  });
}

export function getHealthSummary(analysis: MetricAnalysis[]): string {
  const improving = analysis.filter((a) => a.trend === 'improving').length;
  const declining = analysis.filter((a) => a.trend === 'declining').length;

  return `You're tracking ${analysis.length} metrics. ${improving} are improving, ${declining} are declining.`;
}

/**
 * Format blood pressure data for display
 * Handles both legacy single values and new composite data
 */
export function formatBloodPressure(metric: HealthMetric): string {
  if (metric.composite_data) {
    const bp = metric.composite_data;
    if (bp.pulse) {
      return `${bp.systolic}/${bp.diastolic} mmHg (${bp.pulse} bpm)`;
    }
    return `${bp.systolic}/${bp.diastolic} mmHg`;
  }
  // Legacy format: single value (assume it's systolic)
  return `${metric.value} mmHg`;
}

/**
 * Get systolic value from blood pressure metric
 */
export function getBloodPressureSystolic(metric: HealthMetric): number {
  if (metric.composite_data) {
    return metric.composite_data.systolic;
  }
  // Legacy: assume single value is systolic
  return metric.value;
}

/**
 * Get diastolic value from blood pressure metric
 */
export function getBloodPressureDiastolic(metric: HealthMetric): number | null {
  if (metric.composite_data) {
    return metric.composite_data.diastolic;
  }
  // Legacy: no diastolic value
  return null;
}

