#!/bin/bash
# Atualiza o repo descartando alterações locais comuns após setup-tailscale / deploy.
set -euo pipefail
cd "$(dirname "$0")/.."

RESET_PATHS=(
  scripts/
  deploy/livekit/livekit.yaml
)

needs_reset=0
for p in "${RESET_PATHS[@]}"; do
  if [ -e "$p" ] && ! git diff --quiet -- "$p" 2>/dev/null; then
    needs_reset=1
    break
  fi
done

if [ "$needs_reset" -eq 1 ]; then
  echo "==> Descartando alterações locais em scripts/ e livekit.yaml..."
  git checkout -- scripts/ deploy/livekit/livekit.yaml 2>/dev/null || true
fi

git pull origin main

chmod +x scripts/*.sh 2>/dev/null || true
echo "OK. Versão: $(grep '"version"' package.json | head -1)"
echo "Deploy: sudo bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full"
