# 🖥️ Windows Port Monitor

**Monitor TCP port accessibility with Telegram notifications**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24+
- **Windows** 10/11 or Server
- **Telegram Bot Token** (from [@BotFather](https://t.me/BotFather))

### Installation

```bash
# Clone
git clone https://github.com/john-fb-agent/rdp-monitor.git
cd rdp-monitor

# Install
npm install

# Configure
copy config\config.example.json config\config.json
copy .env.example .env

# Edit config\config.json and .env with your settings
```

### Build & Run

```bash
npm run build
npm run start
```

### Install as Scheduled Task

```bash
npm run install-task
```

Runs every 5 minutes automatically.

---

## ⚙️ Configuration

**config/config.json**:
```json
{
  "monitor": {
    "host": "localhost",
    "port": 3389,
    "checkIntervalMinutes": 5,
    "timeout": 3000
  },
  "telegram": {
    "enabled": true,
    "botToken": "${TELEGRAM_BOT_TOKEN}",
    "chatId": "${TELEGRAM_CHAT_ID}"
  },
  "logging": {
    "level": "info",
    "directory": "logs",
    "maxFiles": 7,
    "maxSize": "10m"
  }
}
```

**.env**:
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Common Ports

| Service | Port |
|---------|------|
| RDP | 3389 |
| SSH | 22 |
| HTTP | 80 |
| HTTPS | 443 |
| MSSQL | 1433 |
| MySQL | 3306 |

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run start` | Run monitor once |
| `npm run test-notification` | Test Telegram config |
| `npm run install-task` | Install Task Scheduler |
| `npm run uninstall-task` | Remove Task Scheduler |

---

## 📊 How It Works

**Monitors port** → **Detects changes** → **Sends alert** → **Logs result**

**Notifications** (only on status change):
- UP → DOWN: ❌ Port inaccessible alert
- DOWN → UP: ✅ Port restored alert
- No change: No notification

**Example Log**:
```
[2026-03-16 15:13:00] [INFO ] Port Monitor started
[2026-03-16 15:13:01] [INFO ] Checking localhost:3389...
[2026-03-16 15:13:02] [INFO ] Port 3389 is ACCESSIBLE
[2026-03-16 15:13:02] [INFO ] Monitor completed
```

---

## 🔧 Troubleshooting

### Test fails
1. Check Bot Token from @BotFather
2. Get Chat ID from @userinfobot
3. Start a chat with your bot
4. Check network/firewall

### Task not running
1. Open Task Scheduler
2. Find "RDP-Monitor" task
3. Check "Last Run Result"
4. Run manually to test

### No notifications
1. Run `npm run test-notification`
2. Verify Telegram config
3. Check logs in `logs/` folder

---

## 📁 Project Structure

```
rdp-monitor/
├── src/           # TypeScript source
├── dist/          # Compiled code
├── config/        # Configuration
├── logs/          # Log files
├── scripts/       # Install scripts
└── docs/          # Documentation
```

---

## 🔒 Security

- ✅ No sensitive data in git (`.env` ignored)
- ✅ Environment variables for tokens
- ✅ Outbound connections only

---

## 📄 License

MIT License

---

## 🔗 Links

- **GitHub**: https://github.com/john-fb-agent/rdp-monitor
- **Issues**: https://github.com/john-fb-agent/rdp-monitor/issues

---

<div align="center">

**Made with ❤️ for Windows administrators**

</div>
