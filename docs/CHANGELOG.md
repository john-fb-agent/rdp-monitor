# 📝 Changelog

**All notable changes to this project will be documented in this file.**

---

## [Unreleased]

### Added
- Initial project structure
- README.md with comprehensive documentation
- docs/DESIGN.md with system architecture
- TypeScript source files (monitor, state, notifier, logger, index)
- Windows Task Scheduler installation scripts
- Configuration management with environment variables
- Rotating log files with configurable retention
- State change detection (only notify on status changes)
- Telegram bot integration

### Changed
- N/A

### Fixed
- N/A

---

## [1.0.0] - 2026-03-16

### Added
- **Initial Release**
  - RDP port 3389 monitoring
  - State change detection
  - Telegram notifications
  - Configurable logging with rotation
  - Windows Task Scheduler integration
  - TypeScript implementation
  - Complete documentation

### Features
- Monitor Windows RDP port accessibility
- Send Telegram alerts only on status changes (UP→DOWN, DOWN→UP)
- Configurable check intervals via Task Scheduler
- Log file rotation with configurable retention (default: 7 days)
- Easy configuration via JSON and environment variables
- State persistence across runs

### Technical Stack
- Node.js 18+
- TypeScript 5.x
- Winston for logging
- Axios for Telegram API
- Windows Task Scheduler for automation

---

## Version History

| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-16 | ✅ Released | Initial release with core features |

---

## Upcoming Features

### Planned (Next Release)
- [ ] Multiple host monitoring
- [ ] Email notifications
- [ ] Web dashboard
- [ ] Historical statistics

### Under Consideration
- [ ] Custom port monitoring (not just 3389)
- [ ] Alert escalation rules
- [ ] Integration with ITSM tools
- [ ] Mobile app

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

<div align="center">

**Keep this changelog up to date with every release!**

</div>
