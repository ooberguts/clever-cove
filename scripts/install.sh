#!/bin/sh
set -eu

REPOSITORY="ooberguts/clever-cove"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64|aarch64) PATTERN='aarch64.*\.dmg$' ;;
  x86_64|amd64) PATTERN='x64.*\.dmg$|x86_64.*\.dmg$' ;;
  *) echo "Unsupported Mac architecture: $ARCH" >&2; exit 1 ;;
esac

ASSET_URL="$(curl -fsSL "https://api.github.com/repos/$REPOSITORY/releases/latest" | grep -Eo 'https://[^\"]+\.dmg' | grep -Ei "$PATTERN" | head -1)"
if [ -z "$ASSET_URL" ]; then
  echo "No compatible macOS installer was found in the latest release." >&2
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
curl -fL "$ASSET_URL" -o "$TEMP_DIR/CleverCove.dmg"
hdiutil attach "$TEMP_DIR/CleverCove.dmg" -nobrowse -quiet
VOLUME="$(find /Volumes -maxdepth 1 -type d -name 'CleverCove*' | head -1)"
cp -R "$VOLUME/CleverCove.app" /Applications/
hdiutil detach "$VOLUME" -quiet
echo "CleverCove was installed in /Applications."
