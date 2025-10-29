/**
 * Timeout utilities for serverless functions
 * Prevents long-running operations from exceeding Vercel's 30-second limit
 */

/**
 * Wrap a promise with a timeout
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds
 * @param label Label for error message
 * @returns Promise that rejects if timeout is exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string = 'Operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`${label} timeout after ${ms}ms`)),
      ms
    )
  );

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Wrap a fetch request with timeout using AbortController
 * @param url URL to fetch
 * @param options Fetch options
 * @param ms Timeout in milliseconds
 * @returns Fetch response
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  ms: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);

    if (error.name === 'AbortError') {
      throw new Error(`Fetch timeout after ${ms}ms: ${url}`);
    }

    throw error;
  }
}

/**
 * Create a timeout promise that rejects after specified time
 * Useful for Promise.race() patterns
 */
export function createTimeoutPromise<T>(
  ms: number,
  label: string = 'Operation'
): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`${label} timeout after ${ms}ms`)),
      ms
    )
  );
}

/**
 * Execute function with timeout
 * @param fn Async function to execute
 * @param ms Timeout in milliseconds
 * @param label Label for error message
 */
export async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  label: string = 'Operation'
): Promise<T> {
  return withTimeout(fn(), ms, label);
}

/**
 * Retry a function with exponential backoff and timeout
 * @param fn Async function to retry
 * @param maxRetries Maximum number of retries
 * @param timeoutMs Timeout per attempt in milliseconds
 * @param backoffMs Initial backoff in milliseconds
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  timeoutMs: number = 5000,
  backoffMs: number = 100
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), timeoutMs, `Attempt ${attempt}`);
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ETIMEDOUT');

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = backoffMs * Math.pow(2, attempt - 1);
      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms:`,
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Get remaining time in serverless function
 * Useful for checking if there's enough time for an operation
 * @param startTime Function start time (Date.now())
 * @param maxDuration Maximum function duration in milliseconds
 * @returns Remaining time in milliseconds
 */
export function getRemainingTime(
  startTime: number,
  maxDuration: number = 30000
): number {
  const elapsed = Date.now() - startTime;
  return Math.max(0, maxDuration - elapsed);
}

/**
 * Check if there's enough time for an operation
 * @param startTime Function start time (Date.now())
 * @param requiredMs Time required for operation in milliseconds
 * @param maxDuration Maximum function duration in milliseconds
 * @returns true if there's enough time, false otherwise
 */
export function hasEnoughTime(
  startTime: number,
  requiredMs: number,
  maxDuration: number = 30000
): boolean {
  return getRemainingTime(startTime, maxDuration) > requiredMs;
}

/**
 * Create a deadline for an operation
 * @param ms Milliseconds until deadline
 * @returns Deadline timestamp
 */
export function createDeadline(ms: number): number {
  return Date.now() + ms;
}

/**
 * Check if deadline has passed
 * @param deadline Deadline timestamp
 * @returns true if deadline has passed, false otherwise
 */
export function isDeadlinePassed(deadline: number): boolean {
  return Date.now() > deadline;
}

/**
 * Get time until deadline
 * @param deadline Deadline timestamp
 * @returns Milliseconds until deadline (0 if passed)
 */
export function getTimeUntilDeadline(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}

export default {
  withTimeout,
  fetchWithTimeout,
  createTimeoutPromise,
  executeWithTimeout,
  retryWithTimeout,
  getRemainingTime,
  hasEnoughTime,
  createDeadline,
  isDeadlinePassed,
  getTimeUntilDeadline,
};

