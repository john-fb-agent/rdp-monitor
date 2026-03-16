# 🖥️ Windows Port Monitor

**TCP Port Monitor with Telegram Notifications**

---

## ⚡ Quick Resume

**Project Status**: ✅ Complete & Production Ready

**GitHub**: https://github.com/john-fb-agent/rdp-monitor

---

## 🚀 When You Return

### First Time Setup (After Clone)

```bash
# Install dependencies
npm install

# Configure
copy config\config.example.json config\config.json
copy .env.example .env

# Edit config\config.json and .env

# Build
npm run build

# Test
npm run test-notification

# Run
npm run start

# Install as Task (optional)
npm run install-task
```

### If Already Configured

```bash
# Just rebuild and run
npm install
npm run build
npm run start
```

---

## 📋 What This Does

- Monitors any TCP port (default: 3389 for RDP)
- Sends Telegram alerts on status changes (UP→DOWN, DOWN→UP)
- Runs via Windows Task Scheduler (every 5 minutes)
- Rotating logs with configurable retention

---

## 📁 What's Here

```
rdp-monitor/
├── src/           # TypeScript source code
├── config/        # Configuration templates
├── scripts/       # Installation scripts
├── docs/          # Documentation
├── package.json   # Dependencies
└── README.md      # This file
```

**Not in git** (local only):
- `node_modules/` - Dependencies
- `dist/` - Compiled code
- `logs/` - Log files
- `config/config.json` - Your config
- `.env` - Your credentials
- `state.json` - Status tracking

---

## 🔧 Common Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run start        # Run once
npm run test-notification  # Test Telegram
npm run install-task # Install Task Scheduler
```

---

## 📖 Full Documentation

- **Quick Start**: See GitHub README
- **System Design**: `docs/DESIGN.md`
- **Changelog**: `docs/CHANGELOG.md`

---

## 🔗 Links

- **GitHub Repo**: https://github.com/john-fb-agent/rdp-monitor
- **Issues**: https://github.com/john-fb-agent/rdp-monitor/issues

---

<div align="center">

**Ready to deploy! Just `npm install` and `npm run build`**

Made with ❤️ | 2026-03-16

</div>
