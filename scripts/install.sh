#!/bin/sh
set -eu

REPOSITORY="ooberguts/clever-cove"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64|aarch64) MATCH_PATTERN='aarch64.*\.dmg$' ;;
  x86_64|amd64) MATCH_PATTERN='(x64|x86_64).*\.dmg$' ;;
  *) echo "Unsupported Mac architecture: $ARCH" >&2; exit 1 ;;
esac

TEMP_DIR="$(mktemp -d)"
MOUNT_POINT="$TEMP_DIR/mount"
DMG_PATH="$TEMP_DIR/CleverCove.dmg"
MOUNTED=0

cleanup() {
  if [ "$MOUNTED" -eq 1 ]; then
    hdiutil detach "$MOUNT_POINT" -quiet >/dev/null 2>&1 || true
  fi
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$MOUNT_POINT"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  ASSET_NAME="$(gh release view --repo "$REPOSITORY" --json assets --jq '.assets[].name' | grep -Ei "$MATCH_PATTERN" | head -1 || true)"
  if [ -z "$ASSET_NAME" ]; then
    echo "No compatible macOS DMG was found in the latest GitHub release." >&2
    exit 1
  fi
  gh release download --repo "$REPOSITORY" --pattern "$ASSET_NAME" --dir "$TEMP_DIR"
  mv "$TEMP_DIR/$ASSET_NAME" "$DMG_PATH"
else
  RELEASE_JSON="$(curl -fsSL "https://api.github.com/repos/$REPOSITORY/releases/latest" 2>/dev/null || true)"
  ASSET_URL="$(printf '%s' "$RELEASE_JSON" | grep -Eo 'https://[^\"]+\.dmg' | grep -Ei "$MATCH_PATTERN" | head -1 || true)"
  if [ -z "$ASSET_URL" ]; then
    echo "The release could not be downloaded. If this repository is private, install GitHub CLI, run 'gh auth login', and rerun this script." >&2
    exit 1
  fi
  curl -fL "$ASSET_URL" -o "$DMG_PATH"
fi

hdiutil attach "$DMG_PATH" -nobrowse -readonly -mountpoint "$MOUNT_POINT" -quiet
MOUNTED=1

if [ ! -d "$MOUNT_POINT/CleverCove.app" ]; then
  echo "The DMG did not contain CleverCove.app." >&2
  exit 1
fi

if ! codesign --verify --deep --strict "$MOUNT_POINT/CleverCove.app"; then
  echo "The downloaded app failed macOS signature verification and was not installed." >&2
  exit 1
fi

if [ -w /Applications ] || { [ -d /Applications/CleverCove.app ] && [ -w /Applications/CleverCove.app ]; }; then
  ditto "$MOUNT_POINT/CleverCove.app" /Applications/CleverCove.app
else
  sudo ditto "$MOUNT_POINT/CleverCove.app" /Applications/CleverCove.app
fi

hdiutil detach "$MOUNT_POINT" -quiet
MOUNTED=0
echo "CleverCove was installed in /Applications."
