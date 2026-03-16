# 🖥️ Windows RDP Monitor

**Remote Desktop Protocol (RDP) Port Monitor for Windows**

Monitor Windows RDP port 3389 accessibility with state-change notifications via Telegram.

---

## 📋 Overview

A lightweight TypeScript/Node.js utility that monitors Windows RDP port 3389 accessibility and sends Telegram notifications only when the status changes (up → down or down → up).

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Port Monitoring** | Continuously checks RDP port 3389 accessibility |
| 📢 **Smart Notifications** | Only notifies on status changes (not every check) |
| 💬 **Telegram Alerts** | Instant notifications via Telegram Bot |
| 📝 **Configurable Logging** | Rotating logs with customizable retention |
| ⏰ **Task Scheduler** | Runs via Windows Task Scheduler |
| ⚙️ **Easy Configuration** | JSON config file with environment variable support |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Windows Task Scheduler                      │
│                   (runs every 5 minutes)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   rdp-monitor.ts                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Port Checker │→ │ State Manager│→ │  Notifier    │      │
│  │  (3389)      │  │ (change det.)│  │ (Telegram)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                              │                               │
│                              ▼                               │
│                     ┌──────────────┐                        │
│                     │ File Logger  │                        │
│                     │ (rotating)   │                        │
│                     └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
rdp-monitor/
├── README.md              # This file
├── docs/
│   ├── DESIGN.md          # System design
│   ├── CHANGELOG.md       # Changelog
│   └── USER_GUIDE.md      # User guide
├── src/
│   ├── index.ts           # Main entry point
│   ├── monitor.ts         # Port monitoring logic
│   ├── notifier.ts        # Telegram notification
│   ├── logger.ts          # Logging with rotation
│   └── state.ts           # State management
├── config/
│   └── config.example.json # Configuration template
├── logs/                   # Log files (auto-created)
├── .gitignore
├── package.json
├── tsconfig.json
└── .env.example           # Environment variables template
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 24+ ([Download](https://nodejs.org/))
- **Windows** 10/11 or Windows Server
- **Telegram Bot Token** ([Get one](https://t.me/BotFather))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/john-fb-agent/rdp-monitor.git
cd rdp-monitor

# 2. Install dependencies
npm install

# 3. Configure
copy config\config.example.json config\config.json
copy .env.example .env

# 4. Edit .env and config\config.json with your settings
```

### Configuration

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
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=190623454
```

### Run Manually

```bash
npm run start
```

### Install as Scheduled Task

```bash
npm run install-task
```

This will:
- Create a Windows Task Scheduler entry
- Run every 5 minutes
- Start automatically on login

---

## 📊 Usage

### Check RDP Status

```bash
npm run start
```

**Output**:
```
[2026-03-16 11:35:00] ℹ️  RDP Monitor started
[2026-03-16 11:35:01] ℹ️  Checking port 3389...
[2026-03-16 11:35:02] ✅ RDP is ACCESSIBLE
[2026-03-16 11:35:02] ℹ️  State: UP → UP (no change)
[2026-03-16 11:35:02] ℹ️  Monitor completed
```

### Status Change Detection

**When RDP goes DOWN**:
```
[2026-03-16 11:40:01] ❌ RDP is INACCESSIBLE
[2026-03-16 11:40:01] 📢 State changed: UP → DOWN
[2026-03-16 11:40:02] ✅ Telegram notification sent
```

**When RDP comes back UP**:
```
[2026-03-16 12:00:01] ✅ RDP is ACCESSIBLE
[2026-03-16 12:00:01] 📢 State changed: DOWN → UP
[2026-03-16 12:00:02] ✅ Telegram notification sent
```

---

## ⚙️ Configuration Options

### Monitor Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | string | `localhost` | Target host to monitor |
| `port` | number | `3389` | RDP port to check |
| `checkIntervalMinutes` | number | `5` | How often to check (for scheduled task) |
| `timeout` | number | `3000` | Connection timeout in ms |

### Telegram Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable notifications |
| `botToken` | string | **Required** | Telegram Bot Token |
| `chatId` | string | **Required** | Chat/User ID to notify |

### Logging Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | string | `info` | Log level (debug, info, warn, error) |
| `directory` | string | `logs` | Log file directory |
| `maxFiles` | number | `7` | Number of days to keep logs |
| `maxSize` | string | `10m` | Max log file size before rotation |

---

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Run monitor once |
| `npm run dev` | Run in development mode |
| `npm run build` | Compile TypeScript |
| `npm run install-task` | Install Windows Task Scheduler entry |
| `npm run uninstall-task` | Remove Task Scheduler entry |
| `npm run test` | Run tests |

---

## 📝 Logs

Log files are stored in `logs/` directory:

```
logs/
├── rdp-monitor-2026-03-16.log
├── rdp-monitor-2026-03-15.log
└── ...
```

**Log retention**: Configurable via `logging.maxFiles` (default: 7 days)

---

## 🔒 Security

### Sensitive Data

**DO NOT commit these files to Git**:

| File | Contains |
|------|----------|
| `config/config.json` | Your actual configuration |
| `.env` | Telegram tokens and chat IDs |
| `logs/*.log` | Log files |

These are already in `.gitignore`.

### Best Practices

1. Use environment variables for tokens
2. Keep `.env` file secure (600 permissions)
3. Use a dedicated Telegram bot for monitoring
4. Regularly rotate bot tokens

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📞 Support

- **Issues**: https://github.com/john-fb-agent/rdp-monitor/issues
- **Discussions**: https://github.com/john-fb-agent/rdp-monitor/discussions

---

## 🙏 Acknowledgments

- Inspired by the need for reliable RDP monitoring
- Built with Node.js and TypeScript

---

<div align="center">

**⭐ If this project helps you, please give it a star!**

Made with ❤️ for Windows administrators

</div>
