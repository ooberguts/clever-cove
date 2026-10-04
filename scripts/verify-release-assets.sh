#!/bin/sh
set -eu

if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "Usage: $0 <asset-name-file>" >&2
  exit 2
fi

ASSET_FILE="$1"

require_asset() {
  LABEL="$1"
  PATTERN="$2"
  if ! grep -Eiq "$PATTERN" "$ASSET_FILE"; then
    echo "Missing required release asset: $LABEL" >&2
    echo "Assets found:" >&2
    sed 's/^/  - /' "$ASSET_FILE" >&2
    exit 1
  fi
}

require_asset "Apple Silicon DMG" 'aarch64.*\.dmg$'
require_asset "Intel Mac DMG" '(x64|x86_64).*\.dmg$'
require_asset "Windows MSI" '\.msi$'
require_asset "Windows setup EXE" '\.exe$'
require_asset "macOS installer script" '^install\.sh$'
require_asset "Windows installer script" '^install\.ps1$'
require_asset "in-app updater manifest" '^latest\.json$'

echo "All required CleverCove release assets are present."
