import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const days = request.nextUrl.searchParams.get('days') || '30';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const result = await query(
      `SELECT id, user_id, metric_type, value, unit, composite_data, timestamp, created_at
       FROM health_metrics
       WHERE user_id = $1 AND timestamp > NOW() - INTERVAL '${days} days'
       ORDER BY timestamp DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, metricType, value, unit, compositeData } = await request.json();

    if (!userId || !metricType || value === undefined) {
      return NextResponse.json(
        { error: 'userId, metricType, and value are required' },
        { status: 400 }
      );
    }

    // Handle blood pressure composite data
    if (metricType === 'Blood Pressure' && compositeData) {
      const result = await query(
        `INSERT INTO health_metrics (user_id, metric_type, value, unit, composite_data, timestamp)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, user_id, metric_type, value, unit, composite_data, timestamp`,
        [userId, metricType, compositeData.systolic, unit || 'mmHg', JSON.stringify(compositeData)]
      );
      return NextResponse.json(result.rows[0], { status: 201 });
    }

    // Handle regular metrics
    const result = await query(
      `INSERT INTO health_metrics (user_id, metric_type, value, unit, timestamp)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_id, metric_type, value, unit, composite_data, timestamp`,
      [userId, metricType, value, unit || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
  }
}

