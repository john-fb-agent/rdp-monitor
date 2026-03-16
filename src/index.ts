import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { getRDPStatus } from './monitor';
import { loadState, updateState, RDPStatus } from './state';
import { sendNotification } from './notifier';
import { initializeLogger, getLogger, cleanupOldLogs } from './logger';

// Load environment variables
dotenv.config();

// Configuration interface
interface Config {
  monitor: {
    host: string;
    port: number;
    checkIntervalMinutes: number;
    timeout: number;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  logging: {
    level: string;
    directory: string;
    maxFiles: number;
    maxSize: string;
  };
}

/**
 * Load and resolve configuration
 */
function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config', 'config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  let config: any = JSON.parse(configContent);

  // Resolve environment variables
  config = resolveEnvVariables(config);

  return config as Config;
}

/**
 * Resolve environment variables in config
 */
function resolveEnvVariables(obj: any): any {
  if (typeof obj === 'string') {
    const match = obj.match(/^\$\{(.+)\}$/);
    if (match) {
      const envVar = match[1];
      return process.env[envVar] || obj;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveEnvVariables(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      result[key] = resolveEnvVariables(obj[key]);
    }
    return result;
  }

  return obj;
}

/**
 * Main monitoring function
 */
async function runMonitor(): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig();

    // Initialize logger
    const logger = initializeLogger(config.logging);
    
    // Cleanup old logs
    cleanupOldLogs(config.logging.directory, config.logging.maxFiles);

    logger.info('RDP Monitor started');
    logger.info(`Checking ${config.monitor.host}:${config.monitor.port}...`);

    // Check RDP status
    const status = await getRDPStatus(
      config.monitor.host,
      config.monitor.port,
      config.monitor.timeout
    );

    logger.info(`RDP is ${status === 'UP' ? 'ACCESSIBLE' : 'INACCESSIBLE'}`);

    // Load previous state
    const previousState = loadState();

    // Update state and check for changes
    const { state, changed } = updateState(status, previousState);

    if (changed) {
      logger.info(`State changed: ${previousState?.status || 'UNKNOWN'} → ${status}`);
      
      // Send notification
      const result = await sendNotification(
        config.telegram,
        status,
        changed,
        config.monitor.host,
        config.monitor.port
      );

      if (result.success) {
        logger.info('Telegram notification sent');
      } else {
        logger.warn(`Failed to send notification: ${result.error}`);
      }
    } else {
      logger.info(`State: ${previousState?.status || 'UNKNOWN'} → ${status} (no change)`);
    }

    logger.info('Monitor completed');

  } catch (error) {
    const logger = getLogger();
    logger.error(`Monitor failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the monitor
runMonitor();
