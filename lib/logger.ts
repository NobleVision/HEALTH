/**
 * Structured logging utility for serverless functions
 * Provides consistent logging format for debugging and monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isVercel = !!process.env.VERCEL;

  /**
   * Format log entry as JSON for structured logging
   */
  private formatEntry(entry: LogEntry): string {
    if (this.isVercel) {
      // Vercel expects JSON format for structured logging
      return JSON.stringify(entry);
    }
    // Development: human-readable format
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${
      entry.context ? ' ' + JSON.stringify(entry.context) : ''
    }`;
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.isDevelopment) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
    };

    console.log(this.formatEntry(entry));
  }

  /**
   * Log at info level
   */
  info(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };

    console.log(this.formatEntry(entry));
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    };

    console.warn(this.formatEntry(entry));
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error: error
        ? {
            message: error.message,
            code: error.code,
            stack: this.isDevelopment ? error.stack : undefined,
          }
        : undefined,
    };

    console.error(this.formatEntry(entry));
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, context?: Record<string, any>): void {
    this.info(`${method} ${path}`, {
      type: 'request',
      ...context,
    });
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    this.info(`${method} ${path} ${status}`, {
      type: 'response',
      status,
      duration,
      ...context,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, rowCount?: number): void {
    this.debug('Database query', {
      type: 'query',
      query: query.substring(0, 100),
      duration,
      rowCount,
    });
  }

  /**
   * Log external API call
   */
  logExternalCall(
    service: string,
    method: string,
    url: string,
    duration: number,
    status?: number
  ): void {
    this.info(`${service} ${method} ${url}`, {
      type: 'external_call',
      service,
      method,
      duration,
      status,
    });
  }

  /**
   * Log performance metric
   */
  logMetric(name: string, value: number, unit: string = 'ms'): void {
    this.info(`Metric: ${name}`, {
      type: 'metric',
      name,
      value,
      unit,
    });
  }

  /**
   * Log function execution
   */
  logFunctionExecution(
    functionName: string,
    duration: number,
    success: boolean,
    error?: Error
  ): void {
    if (success) {
      this.info(`Function executed: ${functionName}`, {
        type: 'function_execution',
        function: functionName,
        duration,
        success: true,
      });
    } else {
      this.error(`Function failed: ${functionName}`, error, {
        type: 'function_execution',
        function: functionName,
        duration,
        success: false,
      });
    }
  }

  /**
   * Create a timer for measuring duration
   */
  createTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Middleware for logging API requests/responses
 */
export function createLoggingMiddleware() {
  return (method: string, path: string) => {
    const start = Date.now();
    logger.logRequest(method, path);

    return (status: number, context?: Record<string, any>) => {
      const duration = Date.now() - start;
      logger.logResponse(method, path, status, duration, context);
    };
  };
}

export default logger;

