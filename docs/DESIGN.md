# 🏗️ System Design Document

**Windows Port Monitor - Technical Design**

---

## 📋 Overview

Monitor Windows TCP port accessibility (configurable) with Telegram notifications on status changes.

---

## 🏛️ Architecture

```
┌─────────────────────────────────────┐
│     Windows Task Scheduler          │
│     (triggers every 5 minutes)      │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│         Node.js Runtime             │
│  ┌──────────────────────────────┐  │
│  │   Port Monitor (TypeScript)  │  │
│  │  Monitor → State → Notifier  │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │  State File     │
          │  (state.json)   │
          └─────────────────┘
```

---

## 📦 Modules

| Module | File | Purpose |
|--------|------|---------|
| **Monitor** | `src/monitor.ts` | Check TCP port accessibility |
| **State** | `src/state.ts` | Track status changes (UP/DOWN) |
| **Notifier** | `src/notifier.ts` | Send Telegram notifications |
| **Logger** | `src/logger.ts` | File + console logging |
| **Main** | `src/index.ts` | Entry point, orchestration |

---

## 🔄 Data Flow

```
Start → Load Config → Check Port → Compare State → Notify (if changed) → Save State → End
```

**State Change Detection**:
- UP → UP: No notification
- DOWN → DOWN: No notification
- UP → DOWN: Send alert
- DOWN → UP: Send alert

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24+ | Runtime |
| TypeScript | 5.x | Language |
| Winston | 3.x | Logging |
| Axios | 1.x | HTTP client (Telegram API) |
| Windows Task Scheduler | - | Automation |

---

## 📁 Project Structure

```
rdp-monitor/
├── src/                    # TypeScript source
├── dist/                   # Compiled JavaScript
├── config/                 # Configuration
├── logs/                   # Log files (auto-created)
├── scripts/                # Installation scripts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security

- **No sensitive data in git** - `.env` and `config.json` ignored
- **Environment variables** - Store tokens securely
- **Outbound connections only** - No inbound ports required

---

## 📝 Revision

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-03-16 | Initial design |

---

<div align="center">

**For full documentation, see [README.md](../README.md)**

</div>
