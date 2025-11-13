/**
 * Simple logging service for the mobile app
 */

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Current log level (can be adjusted for different environments)
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

/**
 * Format log message with timestamp and level
 */
function formatMessage(level, message, metadata = null) {
  const timestamp = new Date().toISOString();
  let formatted = `[${timestamp}] [${level}] ${message}`;
  
  if (metadata) {
    formatted += ` | Metadata: ${JSON.stringify(metadata)}`;
  }
  
  return formatted;
}

/**
 * Send log to backend server
 */
async function sendLogToServer(level, message, metadata = null) {
  try {
    // In a real implementation, you would send logs to your backend
    // For now, we'll just console log them
    console.log(`[REMOTE LOG] ${formatMessage(level, message, metadata)}`);
  } catch (error) {
    console.error('Failed to send log to server:', error);
  }
}

/**
 * Debug level logging
 */
export function debug(message, metadata = null) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
    console.debug(formatMessage('DEBUG', message, metadata));
    sendLogToServer('DEBUG', message, metadata);
  }
}

/**
 * Info level logging
 */
export function log(message, metadata = null) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
    console.log(formatMessage('INFO', message, metadata));
    sendLogToServer('INFO', message, metadata);
  }
}

/**
 * Warning level logging
 */
export function warn(message, metadata = null) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
    console.warn(formatMessage('WARN', message, metadata));
    sendLogToServer('WARN', message, metadata);
  }
}

/**
 * Error level logging
 */
export function error(message, metadata = null) {
  if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
    console.error(formatMessage('ERROR', message, metadata));
    sendLogToServer('ERROR', message, metadata);
  }
}

/**
 * Log an emergency event
 */
export function logEmergency(emergencyData) {
  log(`Emergency reported: ${emergencyData.emergencyType}`, {
    emergencyId: emergencyData.emergencyId,
    location: {
      latitude: emergencyData.latitude,
      longitude: emergencyData.longitude
    },
    userId: emergencyData.userId
  });
}

export default {
  debug,
  log,
  warn,
  error,
  logEmergency
};