# CleverCove

A private, local-first educational desktop app built with React, TypeScript, Vite, and Tauri 2. It includes a Kindergarten learning pack plus guided Student ID practice on the exact school-style keypad layout:

```text
7      8      9
4      5      6
1      2      3
CLEAR  0      ENTER
```

Learner profiles, parent settings, private values, and progress stay in the operating system's application-data directory. There is no cloud backend or telemetry.

## Features

- Multiple local learner profiles for grades K–12
- Parent editing for learner names, grades, and per-learner practice settings
- Parent progress reports for each learner, including most-played games, accuracy, focus areas, and seven-day improvement trends
- PIN-protected Parent Mode
- Generic private-value and game-requirement system
- Kindergarten Counting Practice with 1–25, 1–50, and 1–100 modes
- A–Z Letter Sound Match, What Sound? letter-name-versus-sound practice, and four-term Tricky Word Match
- A saved ten-correct celebration bar in every game, followed by a choice to keep playing or pick another game
- Sound-aware answer choices that keep equivalent phonemes and spoken homophones out of the same question
- Bundled offline spoken audio addressed by stable curriculum IDs
- Development-time content validation and macOS audio generation
- Guided Student ID Practice with matching-digit colors, keypad sounds, success chimes, and mouse, touch, or keyboard controls
- Parent-only update checking with signed download, install, and restart support on macOS and Windows
- Aggregate-only daily progress history with no stored answers
- Allow-listed anonymous JSON export
- Schema migration backups
- Cryptographically signed GitHub release updater
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
npm run content:validate
```

## Install from GitHub Releases

The repository is private, so first install [GitHub CLI](https://cli.github.com/) and sign in with `gh auth login`. These commands then download the installer through your authenticated GitHub account.

### macOS (Apple Silicon or Intel)

```bash
temp_dir="$(mktemp -d)" && gh release download --repo ooberguts/clever-cove --pattern install.sh --dir "$temp_dir" && sh "$temp_dir/install.sh"
```

Or open the latest release in a browser and download the `.dmg` matching your Mac. Apple Silicon builds use `aarch64`; Intel builds use `x64`.

### Windows x64 (PowerShell)

```powershell
$tempDir = Join-Path $env:TEMP "CleverCoveInstall"; New-Item -ItemType Directory -Force $tempDir | Out-Null; gh release download --repo ooberguts/clever-cove --pattern install.ps1 --dir $tempDir --clobber; powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $tempDir "install.ps1")
```

Or download the `.msi` or `-setup.exe` from the latest release and run it.

If the repository is later made public, the installer scripts also support unauthenticated downloads.

After installation, a parent can open **Parent Mode → App updates** to check, install, and restart into a newer signed version.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Adding a minigame](docs/ADDING_A_MINIGAME.md)
- [Learning content](docs/LEARNING_CONTENT.md)
- [Local audio assets](docs/AUDIO_ASSETS.md)
- [Complete audio recording handoff](docs/AUDIO_RECORDING_HANDOFF.md)
- [Learner profile schema](docs/PROFILE_SCHEMA.md)
- [Privacy model](docs/PRIVACY.md)
