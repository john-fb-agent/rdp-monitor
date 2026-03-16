/**
 * Uninstall Windows Task Scheduler entry for RDP Monitor
 */

const { execSync } = require('child_process');

const TASK_NAME = 'RDP-Monitor';

function main() {
  console.log('Uninstalling RDP Monitor Task Scheduler entry...\n');

  try {
    execSync(`schtasks /delete /tn "${TASK_NAME}" /f`, { stdio: 'inherit' });
    console.log('\n✅ Task uninstalled successfully!');
  } catch (error) {
    if (error.message.includes('ERROR: The specified task name does not exist')) {
      console.log('\n⚠️  Task does not exist.');
    } else {
      console.error('\n❌ Failed to uninstall task:', error.message);
      console.error('\nMake sure you are running as Administrator.');
      process.exit(1);
    }
  }
}

main();
