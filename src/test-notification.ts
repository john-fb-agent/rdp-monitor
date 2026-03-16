/**
 * Test Telegram Notification
 * 
 * Usage: npm run test-notification
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { sendTestMessage } from './notifier';

// Load environment variables
dotenv.config();

interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

/**
 * Load and resolve configuration
 */
function loadConfig(): TelegramConfig {
  const configPath = path.join(process.cwd(), 'config', 'config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  let config: any = JSON.parse(configContent);

  // Resolve environment variables
  config = resolveEnvVariables(config);

  return config.telegram as TelegramConfig;
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
 * Main test function
 */
async function testNotification(): Promise<void> {
  console.log('🧪 Testing Telegram Notification...\n');

  try {
    // Load configuration
    const config = loadConfig();

    console.log('Configuration loaded:');
    console.log(`  Enabled: ${config.enabled}`);
    console.log(`  Bot Token: ${config.botToken ? '***' + config.botToken.slice(-5) : 'NOT SET'}`);
    console.log(`  Chat ID: ${config.chatId || 'NOT SET'}`);
    console.log();

    // Check if config is valid
    if (!config.botToken || config.botToken.includes('${')) {
      console.error('❌ Error: Telegram Bot Token is not configured!');
      console.error('   Please edit config/config.json and .env file');
      process.exit(1);
    }

    if (!config.chatId || config.chatId.includes('${')) {
      console.error('❌ Error: Telegram Chat ID is not configured!');
      console.error('   Please edit config/config.json and .env file');
      process.exit(1);
    }

    // Send test notification
    console.log('📤 Sending test notification...');
    const result = await sendTestMessage(config);

    if (result.success) {
      console.log('\n✅ Success! Test notification sent!');
      console.log('   Check your Telegram for the test message.');
    } else {
      console.log('\n❌ Failed to send test notification!');
      console.log(`   Error: ${result.error}`);
      console.log('\nTroubleshooting tips:');
      console.log('   1. Check if Bot Token is correct');
      console.log('   2. Check if Chat ID is correct');
      console.log('   3. Make sure you have started a chat with the bot');
      console.log('   4. Check your network connection');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error('\nPlease make sure:');
    console.error('   1. config/config.json exists and is properly configured');
    console.error('   2. .env file exists with correct credentials');
    process.exit(1);
  }
}

// Run the test
testNotification();
