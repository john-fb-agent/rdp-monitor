# 🏗️ System Design Document

**Windows RDP Monitor - Technical Design**

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Module Design](#3-module-design)
4. [Data Flow](#4-data-flow)
5. [Technology Stack](#5-technology-stack)
6. [State Management](#6-state-management)
7. [Error Handling](#7-error-handling)
8. [Security](#8-security)
9. [Future Enhancements](#9-future-enhancements)

---

## 1. System Overview

### 1.1 Purpose

Monitor Windows RDP port 3389 accessibility and send Telegram notifications only when status changes occur.

### 1.2 Core Requirements

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Port Monitoring** | Check RDP port 3389 accessibility | P0 |
| **State Change Detection** | Only notify on status changes (not every check) | P0 |
| **Telegram Notifications** | Send alerts via Telegram Bot | P0 |
| **Configurable Logging** | Rotating logs with retention settings | P1 |
| **Task Scheduler Integration** | Run via Windows Task Scheduler | P1 |
| **Easy Configuration** | JSON config with environment variables | P2 |

### 1.3 Non-Functional Requirements

- **Performance**: Complete check in < 5 seconds
- **Reliability**: 99% uptime for monitoring
- **Maintainability**: Clear code structure, documented
- **Security**: No sensitive data in logs or git

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Windows Task Scheduler                          │
│         (triggers every 5 minutes)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Runtime                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              rdp-monitor (TypeScript)                 │  │
│  │                                                       │  │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐         │  │
│  │  │ Monitor  │ → │  State   │ → │ Notifier │         │  │
│  │  │ Module   │   │ Manager  │   │(Telegram)│         │  │
│  │  └──────────┘   └──────────┘   └──────────┘         │  │
│  │       │                │                │            │  │
│  │       ▼                ▼                ▼            │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │           Logger Module (File + Console)      │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   State File    │
                    │ (state.json)    │
                    └─────────────────┘
```

### 2.2 Deployment Architecture

```
┌─────────────────────────────────────┐
│     Windows Server / Workstation     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  rdp-monitor/                 │ │
│  │  ├── src/                     │ │
│  │  ├── config/config.json       │ │
│  │  ├── .env                     │ │
│  │  └── logs/                    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Task Scheduler               │ │
│  │  - Trigger: Every 5 min       │ │
│  │  - Action: node rdp-monitor   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 3. Module Design

### 3.1 Module Breakdown

```
src/
├── index.ts           # Main entry point
├── monitor.ts         # Port checking logic
├── state.ts           # State persistence & change detection
├── notifier.ts        # Telegram notification service
├── logger.ts          # Logging with rotation
└── config.ts          # Configuration loader
```

### 3.2 Module Responsibilities

#### **index.ts** - Main Entry Point

| Responsibility | Description |
|----------------|-------------|
| Initialize modules | Load config, logger, monitor |
| Execute workflow | Run monitoring cycle |
| Handle errors | Catch and log errors |
| Exit gracefully | Proper cleanup |

---

#### **monitor.ts** - Port Monitor

| Function | Description |
|----------|-------------|
| `checkPort(host, port, timeout)` | Attempt TCP connection to RDP port |
| `getRDPStatus()` | Return status: `UP` or `DOWN` |

**Implementation**:
```typescript
import * as net from 'net';

export async function checkPort(
  host: string,
  port: number,
  timeout: number = 3000
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let connected = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      connected = true;
      socket.destroy();
    });

    socket.on('error', () => {
      socket.destroy();
    });

    socket.on('timeout', () => {
      socket.destroy();
    });

    socket.on('close', () => {
      resolve(connected);
    });

    socket.connect(port, host);
  });
}
```

---

#### **state.ts** - State Manager

| Function | Description |
|----------|-------------|
| `loadState()` | Load previous state from file |
| `saveState(status)` | Save current state to file |
| `hasChanged(current, previous)` | Detect state change |
| `getStatus()` | Get current status |

**State File Format** (`state.json`):
```json
{
  "status": "UP",
  "lastCheck": "2026-03-16T11:35:00.000Z",
  "lastChange": "2026-03-16T09:20:00.000Z"
}
```

---

#### **notifier.ts** - Telegram Notifier

| Function | Description |
|----------|-------------|
| `sendNotification(message)` | Send Telegram message |
| `formatStatusMessage(status, changed)` | Format notification text |

**Message Format**:
```
🖥️ RDP Status Alert

Status: ✅ ACCESSIBLE / ❌ INACCESSIBLE
Host: localhost:3389
Time: 2026-03-16 11:35:00

Change: UP → DOWN
```

---

#### **logger.ts** - Logger

| Function | Description |
|----------|-------------|
| `info(message)` | Info level log |
| `warn(message)` | Warning level log |
| `error(message)` | Error level log |
| `debug(message)` | Debug level log |

**Features**:
- Console output
- File output with rotation
- Configurable retention (maxFiles)
- Configurable size (maxSize)

---

#### **config.ts** - Configuration Loader

| Function | Description |
|----------|-------------|
| `loadConfig()` | Load and validate config |
| `get(key)` | Get config value |
| `resolveEnvVariables()` | Replace ${VAR} with env values |

---

## 4. Data Flow

### 4.1 Main Workflow

```
┌──────────────────────────────────────────────────────────────┐
│  Start                                                        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  1. Load Configuration                                        │
│     - Read config/config.json                                │
│     - Resolve environment variables                          │
│     - Validate settings                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Initialize Logger                                         │
│     - Create logs/ directory                                 │
│     - Setup file rotation                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. Check RDP Port 3389                                       │
│     - Attempt TCP connection                                 │
│     - Record success/failure                                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Load Previous State                                       │
│     - Read state.json                                        │
│     - Get previous status (UP/DOWN)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────┐
                    │  Changed?   │
                    └─────────────┘
                       │        │
                     Yes│        │No
                       │        │
                       ▼        │
┌────────────────────────────────────────┐   │
│  5. Send Telegram Notification          │   │
│     - Format message                    │   │
│     - Call Telegram Bot API             │   │
│     - Log result                        │   │
└────────────────────────────────────────┘   │
                       │                    │
                       ▼                    │
┌────────────────────────────────────────┐   │
│  6. Save Current State                 │   │
│     - Update state.json                │   │
│     - Record timestamp                 │   │
└────────────────────────────────────────┘   │
                       │                    │
                       ▼                    │
                  ┌─────────┐              │
                  │  End    │◄─────────────┘
                  └─────────┘
```

### 4.2 State Change Detection

```
Previous State    Current State     Action
─────────────────────────────────────────────────
UP                UP               No notification
DOWN              DOWN             No notification
UP                DOWN             Send notification (DOWN alert)
DOWN              UP               Send notification (UP alert)
```

---

## 5. Technology Stack

### 5.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 24+ | Runtime |
| **TypeScript** | 5.x | Language |
| **Windows Task Scheduler** | - | Scheduling |

### 5.2 Dependencies

| Package | Purpose |
|---------|---------|
| `dotenv` | Environment variable loading |
| `winston` | Logging with rotation |
| `node-cron` | (Optional) Internal scheduling |
| `axios` | HTTP client for Telegram API |

### 5.3 Development Dependencies

| Package | Purpose |
|---------|---------|
| `@types/node` | TypeScript definitions |
| `typescript` | Compiler |
| `ts-node` | TypeScript execution |
| `jest` | Testing framework |

---

## 6. State Management

### 6.1 State Storage

**Location**: `state.json` (in project root)

**Format**:
```json
{
  "status": "UP",
  "lastCheck": "2026-03-16T11:35:00.000Z",
  "lastChange": "2026-03-16T09:20:00.000Z",
  "consecutiveFailures": 0
}
```

### 6.2 State Transitions

```
┌──────────────────────────────────────────┐
│            Initial State                  │
│            (status: null)                 │
└──────────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ First Check   │
        └───────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   ┌─────────┐     ┌─────────┐
   │ UP      │     │ DOWN    │
   │ State   │     │ State   │
   └─────────┘     └─────────┘
        │               │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ Subsequent    │
        │ Checks        │
        └───────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
   Status          Status
   Unchanged       Changed
        │               │
        │               ▼
        │        ┌──────────────┐
        │        │ Send Alert   │
        │        │ Update State │
        │        └──────────────┘
        │
        ▼
   ┌──────────────┐
   │ Log Only     │
   │ No Alert     │
   └──────────────┘
```

---

## 7. Error Handling

### 7.1 Error Types

| Error Type | Handling |
|------------|----------|
| **Config Error** | Exit with error message |
| **Network Error** | Log error, mark as DOWN |
| **Telegram API Error** | Log error, retry next cycle |
| **File System Error** | Log error, continue without state |

### 7.2 Error Recovery

```typescript
try {
  await checkPort();
} catch (error) {
  logger.error(`Port check failed: ${error.message}`);
  // Treat as DOWN status
  await handleStatus('DOWN');
}
```

### 7.3 Retry Logic

For Telegram notifications:
- Retry 3 times with exponential backoff
- Log failure after all retries exhausted
- Continue monitoring even if notification fails

---

## 8. Security

### 8.1 Sensitive Data Protection

| Data | Protection Method |
|------|-------------------|
| Telegram Bot Token | Environment variable (.env) |
| Chat ID | Environment variable (.env) |
| Config file | Added to .gitignore |
| Log files | Added to .gitignore |

### 8.2 File Permissions

Recommended permissions:
```bash
# .env file
icacls .env /grant %USERNAME%:R
```

### 8.3 Network Security

- Only outbound connections (to Telegram API)
- No inbound connections required
- RDP check is read-only (TCP SYN)

---

## 9. Future Enhancements

### 9.1 Short-term (1-3 months)

| Feature | Priority |
|---------|----------|
| Multiple host monitoring | P1 |
| Email notifications | P2 |
| Web dashboard | P2 |

### 9.2 Mid-term (3-6 months)

| Feature | Priority |
|---------|----------|
| Historical statistics | P3 |
| Custom port monitoring | P2 |
| Alert escalation rules | P3 |

### 9.3 Long-term (6-12 months)

| Feature | Priority |
|---------|----------|
| Centralized monitoring server | P3 |
| Mobile app | P3 |
| Integration with ITSM tools | P3 |

---

## 📝 Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-16 | john-fb-agent | Initial version |

---

<div align="center">

**This document evolves with the project**

</div>
