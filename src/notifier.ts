import axios from 'axios';
import { RDPStatus, formatTimestamp } from './state';

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Send Telegram notification
 */
export async function sendNotification(
  config: TelegramConfig,
  status: RDPStatus,
  changed: boolean,
  host: string,
  port: number
): Promise<NotificationResult> {
  if (!config.enabled) {
    return { success: false, error: 'Notifications disabled' };
  }

  if (!config.botToken || !config.chatId) {
    return { success: false, error: 'Missing bot token or chat ID' };
  }

  const message = formatMessage(status, changed, host, port);
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: config.chatId,
      text: message,
      parse_mode: 'Markdown'
    }, {
      timeout: 10000
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Format notification message
 */
function formatMessage(
  status: RDPStatus,
  changed: boolean,
  host: string,
  port: number
): string {
  const statusIcon = status === 'UP' ? '✅' : '❌';
  const statusText = status === 'UP' ? 'ACCESSIBLE' : 'INACCESSIBLE';
  const changeText = changed
    ? '\n\n*Change Detected!*'
    : '\n\n*Status: No Change*';

  const message =
    '🖥️ *RDP Status Alert*\n\n' +
    '*Status:* ' + statusIcon + ' ' + statusText + '\n' +
    '*Host:* ' + host + ':' + port + '\n' +
    '*Time:* ' + formatTimestamp(new Date().toISOString()) + '\n' +
    changeText;

  return message;
}

/**
 * Send test notification
 */
export async function sendTestNotification(config: TelegramConfig): Promise<NotificationResult> {
  return sendNotification(config, 'UP', false, 'localhost', 3389);
}
