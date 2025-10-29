import { initializeDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Database initialization endpoint
 * Creates tables if they don't exist
 * Safe to call multiple times (uses CREATE TABLE IF NOT EXISTS)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add a simple auth check to prevent unauthorized initialization
    const authHeader = request.headers.get('authorization');
    const initSecret = process.env.INIT_SECRET;
    
    if (initSecret && authHeader !== `Bearer ${initSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting database initialization...');
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for initialization (alternative method)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

