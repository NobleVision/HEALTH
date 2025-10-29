/**
 * Input validation utilities for API routes
 * Prevents SQL injection, invalid data, and security issues
 */

/**
 * Validate and sanitize userId parameter
 */
export function validateUserId(userId: any): number {
  const id = parseInt(userId, 10);
  if (isNaN(id) || id < 1) {
    throw new Error('Invalid userId: must be a positive integer');
  }
  return id;
}

/**
 * Validate and sanitize days parameter
 * Only allows specific values to prevent SQL injection
 */
export function validateDays(days: any): string {
  const validDays = ['7', '30', '90', '365'];
  const daysStr = String(days || '30').trim();

  if (!validDays.includes(daysStr)) {
    console.warn(`Invalid days parameter: ${daysStr}, using default 30`);
    return '30';
  }

  return daysStr;
}

/**
 * Validate metric type
 */
export function validateMetricType(metricType: any): string {
  const validMetrics = [
    'Blood Pressure',
    'Weight',
    'Steps',
    'Heart Rate',
    'Sleep',
    'Water',
    'Exercise',
    'Mood',
  ];

  const type = String(metricType || '').trim();

  if (!validMetrics.includes(type)) {
    throw new Error(
      `Invalid metric type: ${type}. Valid types: ${validMetrics.join(', ')}`
    );
  }

  return type;
}

/**
 * Validate metric value
 */
export function validateMetricValue(value: any, metricType: string): number {
  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    throw new Error('Invalid value: must be a number');
  }

  // Metric-specific validation
  const constraints: Record<string, { min: number; max: number }> = {
    'Blood Pressure': { min: 0, max: 300 },
    Weight: { min: 50, max: 500 },
    Steps: { min: 0, max: 100000 },
    'Heart Rate': { min: 30, max: 200 },
    Sleep: { min: 0, max: 24 },
    Water: { min: 0, max: 500 },
    Exercise: { min: 0, max: 1440 },
    Mood: { min: 1, max: 10 },
  };

  const constraint = constraints[metricType];
  if (constraint) {
    if (numValue < constraint.min || numValue > constraint.max) {
      throw new Error(
        `Invalid value for ${metricType}: must be between ${constraint.min} and ${constraint.max}`
      );
    }
  }

  return numValue;
}

/**
 * Validate user name
 */
export function validateUserName(name: any): string {
  const trimmed = String(name || '').trim();

  if (trimmed.length === 0) {
    throw new Error('Name is required');
  }

  if (trimmed.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  if (trimmed.length > 255) {
    throw new Error('Name must be less than 255 characters');
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmed)) {
    throw new Error('Name contains invalid characters');
  }

  return trimmed;
}

/**
 * Validate export format
 */
export function validateExportFormat(format: any): string {
  const validFormats = ['csv', 'markdown', 'html', 'text'];
  const fmt = String(format || 'csv').toLowerCase().trim();

  if (!validFormats.includes(fmt)) {
    console.warn(`Invalid format: ${fmt}, using default csv`);
    return 'csv';
  }

  return fmt;
}

/**
 * Validate request body has required fields
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate query parameter exists and is not empty
 */
export function validateQueryParam(
  params: URLSearchParams,
  paramName: string,
  required: boolean = true
): string | null {
  const value = params.get(paramName);

  if (required && (!value || value.trim().length === 0)) {
    throw new Error(`Missing required query parameter: ${paramName}`);
  }

  return value;
}

/**
 * Create validation error response
 */
export function createValidationError(message: string) {
  return {
    error: message,
    code: 'VALIDATION_ERROR',
    timestamp: new Date().toISOString(),
  };
}

export default {
  validateUserId,
  validateDays,
  validateMetricType,
  validateMetricValue,
  validateUserName,
  validateExportFormat,
  validateRequiredFields,
  sanitizeString,
  validateQueryParam,
  createValidationError,
};

