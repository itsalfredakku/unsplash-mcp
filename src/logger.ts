import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'unsplash-mcp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Log API calls for monitoring
export function logApiCall(method: string, url: string, status?: number, duration?: number) {
  logger.info('API Call', {
    method,
    url,
    status,
    duration: duration ? `${duration}ms` : undefined,
    timestamp: new Date().toISOString()
  });
}

// Log scraping activities
export function logScrapeActivity(action: string, target: string, result?: any) {
  logger.info('Scraping Activity', {
    action,
    target,
    result: result ? (typeof result === 'object' ? JSON.stringify(result).substring(0, 200) : result) : undefined,
    timestamp: new Date().toISOString()
  });
}

// Log errors with context
export function logError(error: Error, context?: any) {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}

// Log cache operations
export function logCacheOperation(operation: string, key: string, hit?: boolean) {
  logger.debug('Cache Operation', {
    operation,
    key,
    hit,
    timestamp: new Date().toISOString()
  });
}
