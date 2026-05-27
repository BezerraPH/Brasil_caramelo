#!/bin/bash
# Prepara projeto Capacitor (Android/iOS) apontando para servidor self-hosted.
# Uso: CAPACITOR_SERVER_URL=https://servidor.tailXXXX.ts.net ./scripts/setup-capacitor.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

URL="${CAPACITOR_SERVER_URL:-${NEXT_PUBLIC_APP_URL:-http://127.0.0.1:3000}}"
export CAPACITOR_SERVER_URL="$URL"

echo "==> Capacitor — servidor: $URL"

if ! npm ls @capacitor/core >/dev/null 2>&1; then
  echo "==> Instalando pacotes Capacitor..."
  npm install -D @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/splash-screen
fi

if [ ! -d android ]; then
  echo "==> npx cap add android"
  npx cap add android
fi

echo "==> npx cap sync"
npx cap sync

echo ""
echo "Pronto. Abra o Android Studio:"
echo "  npm run cap:open:android"
echo ""
echo "Para iOS (somente macOS): npx cap add ios && npx cap open ios"
