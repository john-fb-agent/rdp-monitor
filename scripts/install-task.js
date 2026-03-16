/**
 * Install Windows Task Scheduler entry for RDP Monitor
 * Runs every 5 minutes
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TASK_NAME = 'RDP-Monitor';
const NODE_PATH = 'node';
const SCRIPT_PATH = path.join(__dirname, '..', 'dist', 'index.js');
const WORKING_DIR = path.join(__dirname, '..');

function main() {
  console.log('Installing RDP Monitor Task Scheduler entry...\n');

  // Check if dist exists
  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error('Error: dist/index.js not found. Please run `npm run build` first.');
    process.exit(1);
  }

  // Check if config exists
  const configPath = path.join(WORKING_DIR, 'config', 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: config/config.json not found. Please copy config.example.json to config.json and configure it.');
    process.exit(1);
  }

  // Check if .env exists
  const envPath = path.join(WORKING_DIR, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env not found. Please copy .env.example to .env and configure it.');
    process.exit(1);
  }

  try {
    // Delete existing task if exists
    console.log('Removing existing task (if any)...');
    try {
      execSync(`schtasks /delete /tn "${TASK_NAME}" /f`, { stdio: 'ignore' });
    } catch (e) {
      // Task doesn't exist, that's fine
    }

    // Create task
    console.log('Creating new task...');
    const command = `schtasks /create /tn "${TASK_NAME}" /tr "${NODE_PATH} ${SCRIPT_PATH}" /sc minute /mo 5 /sd "${WORKING_DIR}" /ru SYSTEM /rl HIGHEST /f`;
    
    execSync(command, { stdio: 'inherit' });

    console.log('\n✅ Task installed successfully!');
    console.log('\nTask Details:');
    console.log(`  Name: ${TASK_NAME}`);
    console.log(`  Schedule: Every 5 minutes`);
    console.log(`  Command: ${NODE_PATH} ${SCRIPT_PATH}`);
    console.log(`  Working Directory: ${WORKING_DIR}`);
    console.log('\nTo view task:');
    console.log(`  schtasks /query /tn "${TASK_NAME}"`);
    console.log('\nTo run task manually:');
    console.log(`  schtasks /run /tn "${TASK_NAME}"`);
    console.log('\nTo uninstall:');
    console.log(`  npm run uninstall-task`);

  } catch (error) {
    console.error('\n❌ Failed to install task:', error.message);
    console.error('\nMake sure you are running as Administrator.');
    process.exit(1);
  }
}

main();
