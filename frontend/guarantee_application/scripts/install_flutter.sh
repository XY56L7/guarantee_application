#!/usr/bin/env bash
# Install Flutter (stable) and build web. Used by Vercel / CI.
# Requires: git, curl, unzip, xz-utils (for tar.xz). On Vercel these are available.

set -e

FLUTTER_VERSION="${FLUTTER_VERSION:-stable}"
FLUTTER_INSTALL_DIR="${FLUTTER_INSTALL_DIR:-$HOME/flutter}"
# API_BASE_URL can be set in Vercel env and passed to --dart-define

echo "Installing Flutter ($FLUTTER_VERSION) into $FLUTTER_INSTALL_DIR ..."
git clone https://github.com/flutter/flutter.git -b "$FLUTTER_VERSION" --depth 1 "$FLUTTER_INSTALL_DIR"
export PATH="$FLUTTER_INSTALL_DIR/bin:$PATH"
flutter --version
flutter config --enable-web --no-analytics

echo "Getting dependencies and building web ..."
flutter pub get

DART_DEFINES=""
if [ -n "$API_BASE_URL" ]; then
  echo "Using API_BASE_URL for build (length ${#API_BASE_URL} chars)"
  DART_DEFINES="--dart-define=API_BASE_URL=$API_BASE_URL"
else
  echo "WARNING: API_BASE_URL not set - app will use default (localhost:3000)"
fi
flutter build web $DART_DEFINES

echo "Build finished. Output: build/web"
