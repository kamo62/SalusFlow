import { createLogger, format, transports } from 'winston';

interface LoggerConfig {
  level: string;
  service: string;
}

const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  service: 'appointment-service'
};

const logger = createLogger({
  level: defaultConfig.level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: defaultConfig.service },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

// Add request context
export const addRequestContext = (context: Record<string, unknown>): void => {
  const existingMeta = logger.defaultMeta || {};
  logger.defaultMeta = { ...existingMeta, ...context };
};

// Remove sensitive data
const sanitizeError = (error: unknown): unknown => {
  if (error instanceof Error) {
    const { name, message, stack } = error;
    return { name, message, stack };
  }
  return error;
};

export const log = {
  error: (message: string, meta?: Record<string, unknown>): void => {
    logger.error(message, {
      ...meta,
      error: meta?.error ? sanitizeError(meta.error) : undefined
    });
  },
  warn: (message: string, meta?: Record<string, unknown>): void => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: Record<string, unknown>): void => {
    logger.info(message, meta);
  },
  debug: (message: string, meta?: Record<string, unknown>): void => {
    logger.debug(message, meta);
  }
};

export { logger }; 