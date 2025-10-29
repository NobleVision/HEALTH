import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const format = request.nextUrl.searchParams.get('format') || 'csv';
    const days = request.nextUrl.searchParams.get('days') || '30';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch user and metrics
    const userResult = await query('SELECT name FROM users WHERE id = $1', [userId]);
    const metricsResult = await query(
      `SELECT metric_type, value, unit, composite_data, timestamp
       FROM health_metrics
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '${days} days'
       ORDER BY timestamp DESC`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = userResult.rows[0].name;
    const metrics = metricsResult.rows;

    // Helper function to format metric value
    const formatMetricValue = (metric: any): string => {
      if (metric.metric_type === 'Blood Pressure' && metric.composite_data) {
        const bp = metric.composite_data;
        if (bp.pulse) {
          return `${bp.systolic}/${bp.diastolic} (${bp.pulse} bpm)`;
        }
        return `${bp.systolic}/${bp.diastolic}`;
      }
      return metric.value;
    };

    let content = '';
    let contentType = 'text/plain';
    let filename = `health-report-${userName}-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      contentType = 'text/csv';
      filename += '.csv';
      content = 'Metric Type,Value,Unit,Timestamp\n';
      metrics.forEach((m) => {
        const value = formatMetricValue(m);
        content += `"${m.metric_type}","${value}","${m.unit || ''}","${m.timestamp}"\n`;
      });
    } else if (format === 'markdown') {
      contentType = 'text/markdown';
      filename += '.md';
      content = `# Health Report for ${userName}\n\n`;
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Period: Last ${days} days\n\n`;
      content += `## Metrics\n\n`;
      content += `| Metric Type | Value | Unit | Timestamp |\n`;
      content += `|---|---|---|---|\n`;
      metrics.forEach((m) => {
        const value = formatMetricValue(m);
        content += `| ${m.metric_type} | ${value} | ${m.unit || '-'} | ${new Date(m.timestamp).toLocaleString()} |\n`;
      });
    } else if (format === 'html') {
      contentType = 'text/html';
      filename += '.html';
      content = `<!DOCTYPE html>
<html>
<head>
  <title>Health Report - ${userName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <h1>Health Report for ${userName}</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Period: Last ${days} days</p>
  <table>
    <tr><th>Metric Type</th><th>Value</th><th>Unit</th><th>Timestamp</th></tr>
    ${metrics.map((m) => `<tr><td>${m.metric_type}</td><td>${formatMetricValue(m)}</td><td>${m.unit || '-'}</td><td>${new Date(m.timestamp).toLocaleString()}</td></tr>`).join('')}
  </table>
</body>
</html>`;
    } else {
      // Plain text
      filename += '.txt';
      content = `HEALTH REPORT FOR ${userName.toUpperCase()}\n`;
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Period: Last ${days} days\n\n`;
      metrics.forEach((m) => {
        const value = formatMetricValue(m);
        content += `${m.metric_type}: ${value} ${m.unit || ''} - ${new Date(m.timestamp).toLocaleString()}\n`;
      });
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

