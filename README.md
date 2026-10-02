# CleverCove

A private, local-first educational desktop app built with React, TypeScript, Vite, and Tauri 2. The first production game helps a learner practice entering a student ID on the exact school-style keypad layout:

```text
7      8      9
4      5      6
1      2      3
CLEAR  0      ENTER
```

Learner profiles, parent settings, private values, and progress stay in the operating system's application-data directory. There is no cloud backend or telemetry.

## Features

- Multiple local learner profiles for grades K–12
- PIN-protected Parent Mode
- Generic private-value and game-requirement system
- Guided Student ID Practice with matching-digit colors, keypad sounds, success chimes, and mouse, touch, or keyboard controls
- Aggregate-only progress history
- Allow-listed anonymous JSON export
- Schema migration backups
- Signed GitHub release updater foundation
- macOS Apple Silicon, macOS Intel, and Windows x64 release workflow

## Develop locally

Prerequisites: Node.js 22+, npm, and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system.

```bash
npm install
npm run dev
```

Run in the native Tauri window:

```bash
npm run tauri dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Install from GitHub Releases

After the first desktop release is published, use these one-line installers.

### macOS (Apple Silicon or Intel)

```bash
curl -fsSL https://github.com/ooberguts/clever-cove/releases/latest/download/install.sh | bash
```

Until an installer script is added, open the latest release in a browser and download the `.dmg` matching your Mac. Apple Silicon builds use `aarch64`; Intel builds use `x64`.

### Windows x64 (PowerShell)

```powershell
irm https://github.com/ooberguts/clever-cove/releases/latest/download/install.ps1 | iex
```

Until an installer script is added, download the `.msi` or `-setup.exe` from the latest release and run it.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Adding a minigame](docs/ADDING_A_MINIGAME.md)
