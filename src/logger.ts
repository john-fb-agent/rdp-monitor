import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export interface LoggerConfig {
  level: string;
  directory: string;
  maxFiles: number;
  maxSize: string;
}

let logger: winston.Logger | null = null;

/**
 * Initialize logger
 */
export function initializeLogger(config: LoggerConfig): winston.Logger {
  // Create logs directory
  if (!fs.existsSync(config.directory)) {
    fs.mkdirSync(config.directory, { recursive: true });
  }

  const logFile = path.join(
    config.directory,
    `rdp-monitor-${new Date().toISOString().split('T')[0]}.log`
  );

  logger = winston.createLogger({
    level: config.level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => {
        // Format: [TIMESTAMP] [LEVEL] Message
        return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}`;
      })
    ),
    transports: [
      // Console output
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message }) => {
            const levelColors: any = {
              error: '\x1b[31m',  // Red
              warn: '\x1b[33m',   // Yellow
              info: '\x1b[36m',   // Cyan
              debug: '\x1b[35m'   // Magenta
            };
            const reset = '\x1b[0m';
            const color = levelColors[level] || reset;
            return `[${timestamp}] [${color}${level.toUpperCase().padEnd(5)}${reset}] ${message}`;
          })
        )
      }),
      // File output with rotation
      new winston.transports.File({
        filename: logFile,
        maxFiles: config.maxFiles,
        maxsize: parseSize(config.maxSize),
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}`;
          })
        )
      })
    ]
  });

  return logger;
}

/**
 * Get logger instance
 */
export function getLogger(): winston.Logger {
  if (!logger) {
    throw new Error('Logger not initialized. Call initializeLogger() first.');
  }
  return logger;
}

/**
 * Parse size string (e.g., '10m' -> 10485760)
 */
function parseSize(sizeStr: string): number {
  const match = sizeStr.match(/^(\d+)([km]?)$/i);
  if (!match) {
    return 10 * 1024 * 1024; // Default 10MB
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'k':
      return value * 1024;
    case 'm':
      return value * 1024 * 1024;
    default:
      return value;
  }
}

/**
 * Clean up old log files
 */
export function cleanupOldLogs(directory: string, maxFiles: number): void {
  try {
    const files = fs.readdirSync(directory)
      .filter(file => file.startsWith('rdp-monitor-') && file.endsWith('.log'))
      .sort()
      .reverse();

    if (files.length > maxFiles) {
      const toDelete = files.slice(maxFiles);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(directory, file));
      });
    }
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
}
