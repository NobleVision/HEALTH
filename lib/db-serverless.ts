/**
 * Serverless-optimized database module for Vercel deployment
 * Uses Neon serverless driver instead of pg Pool
 *
 * Key differences from lib/db.ts:
 * - No global connection pool (incompatible with serverless)
 * - Per-request connections with automatic cleanup
 * - HTTP-based connections (no TCP overhead)
 * - Built-in timeout handling
 * - Automatic retry logic
 */

import { Pool } from '@neondatabase/serverless';

// Configuration
const DB_TIMEOUT = parseInt(process.env.DATABASE_TIMEOUT || '10000');
const MAX_RETRIES = parseInt(process.env.DATABASE_MAX_RETRIES || '3');

// Create a serverless-optimized pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // Serverless-specific configuration
  max: 1, // Single connection per function invocation
  idleTimeoutMillis: 0, // Close idle connections immediately
  connectionTimeoutMillis: 5000,
});

/**
 * Execute a database query with timeout and retry logic
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Query timeout after ${DB_TIMEOUT}ms`)),
          DB_TIMEOUT
        )
      );

      // Execute query with timeout
      const queryPromise = pool.query(text, params);
      const result = await Promise.race([queryPromise, timeoutPromise]);

      const duration = Date.now() - start;
      console.log('Executed query', {
        text: text.substring(0, 100),
        duration,
        rows: (result as any).rowCount,
        attempt,
      });

      return result;
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('connection');

      if (isRetryable && attempt < MAX_RETRIES) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = Math.pow(2, attempt - 1) * 100;
        console.warn(`Query failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms`, {
          error: error.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries reached
      console.error('Database error:', {
        error: error.message,
        code: error.code,
        attempt,
        query: text.substring(0, 100),
      });

      throw error;
    }
  }

  // Should not reach here, but just in case
  throw lastError || new Error('Query failed after all retries');
}

/**
 * Initialize database schema
 * Safe to call multiple times (uses CREATE TABLE IF NOT EXISTS)
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database schema...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create health_metrics table
    await query(`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20),
        composite_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create index for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id_timestamp
      ON health_metrics(user_id, timestamp DESC);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Health check for database connectivity
 * Useful for monitoring and debugging
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health');
    return (result as any).rowCount === 1;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Get database connection info for debugging
 */
export function getConnectionInfo() {
  return {
    timeout: DB_TIMEOUT,
    maxRetries: MAX_RETRIES,
    driver: '@neondatabase/serverless',
    environment: process.env.VERCEL_ENV || 'development',
  };
}

export default { query, initializeDatabase, healthCheck, getConnectionInfo };

