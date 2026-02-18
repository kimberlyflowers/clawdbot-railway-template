/**
 * Error Handler — Standardized error handling and recovery
 */

const { logError } = require('./logger');

class GHLBrowserError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'GHLBrowserError';
    this.code = code;
    this.details = details;
  }
}

const ERROR_CODES = {
  BROWSER_LAUNCH_FAILED: 'BROWSER_LAUNCH_FAILED',
  BROWSER_CLOSED: 'BROWSER_CLOSED',
  PAGE_NOT_FOUND: 'PAGE_NOT_FOUND',
  ELEMENT_NOT_FOUND: 'ELEMENT_NOT_FOUND',
  NAVIGATION_FAILED: 'NAVIGATION_FAILED',
  TIMEOUT: 'TIMEOUT',
  AUTH_FAILED: 'AUTH_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TWO_FA_REQUIRED: 'TWO_FA_REQUIRED',
  ANTI_BOT_DETECTED: 'ANTI_BOT_DETECTED',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Parse error and determine if it's recoverable
 */
function analyzeError(error) {
  const errorString = error.message || error.toString();

  if (errorString.includes('Target page, context or browser has been closed')) {
    return {
      code: ERROR_CODES.BROWSER_CLOSED,
      recoverable: true,
      action: 'restart_browser',
    };
  }

  if (errorString.includes('Timeout')) {
    return {
      code: ERROR_CODES.TIMEOUT,
      recoverable: true,
      action: 'retry',
    };
  }

  if (errorString.includes('not found') || errorString.includes('No element matches')) {
    return {
      code: ERROR_CODES.ELEMENT_NOT_FOUND,
      recoverable: false,
      action: 'verify_selectors',
    };
  }

  if (errorString.includes('net::ERR_')) {
    return {
      code: ERROR_CODES.NAVIGATION_FAILED,
      recoverable: true,
      action: 'retry',
    };
  }

  if (errorString.includes('Authentication') || errorString.includes('login')) {
    return {
      code: ERROR_CODES.AUTH_FAILED,
      recoverable: false,
      action: 'check_credentials',
    };
  }

  return {
    code: ERROR_CODES.UNKNOWN,
    recoverable: true,
    action: 'retry',
  };
}

/**
 * Handle error with retry logic
 */
async function handleErrorWithRetry(error, retryFn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const delayMs = options.delayMs || 1000;
  const exponentialBackoff = options.exponentialBackoff !== false;

  const analysis = analyzeError(error);

  if (!analysis.recoverable) {
    logError(`Non-recoverable error: ${analysis.code}`, error);
    throw new GHLBrowserError(analysis.code, error.message, { analysis });
  }

  logError(`Recoverable error: ${analysis.code}. Retrying...`, error);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const delay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      console.log(`⏳ Retry attempt ${attempt}/${maxRetries} (waiting ${delay}ms)...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return await retryFn();
    } catch (retryError) {
      if (attempt === maxRetries) {
        throw new GHLBrowserError(analysis.code, `Failed after ${maxRetries} retries`, {
          originalError: error.message,
          lastRetryError: retryError.message,
        });
      }
    }
  }
}

/**
 * Create a safe wrapper for async operations
 */
async function safeExecute(fn, options = {}) {
  try {
    return await fn();
  } catch (error) {
    const analysis = analyzeError(error);
    logError(`Operation failed: ${analysis.code}`, error);

    if (options.throwOnError !== false) {
      throw new GHLBrowserError(analysis.code, error.message, { analysis });
    }

    return {
      success: false,
      error: error.message,
      code: analysis.code,
      recoverable: analysis.recoverable,
    };
  }
}

module.exports = {
  GHLBrowserError,
  ERROR_CODES,
  analyzeError,
  handleErrorWithRetry,
  safeExecute,
};
