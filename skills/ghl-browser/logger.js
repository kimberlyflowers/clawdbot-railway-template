/**
 * Logger — Centralized logging for GHL browser automation
 */

const fs = require('fs');
const config = require('./config');

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel() {
  return LOG_LEVELS[config.logging.logLevel] || LOG_LEVELS.info;
}

function formatTimestamp() {
  return new Date().toISOString();
}

function writeLog(level, message, data = null) {
  if (!config.logging.enabled) return;

  const logEntry = {
    timestamp: formatTimestamp(),
    level: level.toUpperCase(),
    message,
    data: data || undefined,
  };

  const logLine = JSON.stringify(logEntry);

  // Console output
  if (LOG_LEVELS[level] >= getLogLevel()) {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';
    console.log(`${color}[${level.toUpperCase()}]${reset} ${message}${data ? ' ' + JSON.stringify(data) : ''}`);
  }

  // File output
  try {
    fs.appendFileSync(config.logging.logPath, logLine + '\n');
  } catch (error) {
    console.error('Failed to write log file:', error.message);
  }
}

/**
 * Log at info level
 */
function log(level, message, data = null) {
  writeLog(level, message, data);
}

/**
 * Log error with stack trace
 */
function logError(message, error) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };
  writeLog('error', message, errorData);
}

/**
 * Clear log file
 */
function clearLog() {
  try {
    fs.writeFileSync(config.logging.logPath, '');
  } catch (error) {
    console.error('Failed to clear log file:', error.message);
  }
}

/**
 * Read log file
 */
function readLog(lines = 100) {
  try {
    const content = fs.readFileSync(config.logging.logPath, 'utf-8');
    return content.split('\n').slice(-lines).filter(l => l);
  } catch (error) {
    return [];
  }
}

module.exports = {
  log,
  logError,
  clearLog,
  readLog,
};
