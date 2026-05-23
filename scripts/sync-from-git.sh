#!/bin/bash
# Atualiza o repo descartando alteração local só em scripts/deploy-brasil-caramelo.sh
# (evita conflito comum após deploy manual no servidor).
set -euo pipefail
cd "$(dirname "$0")/.."

if git diff --quiet scripts/deploy-brasil-caramelo.sh 2>/dev/null; then
  git pull origin main
else
  echo "==> Alteração local em scripts/deploy-brasil-caramelo.sh — descartando e puxando main..."
  git checkout -- scripts/deploy-brasil-caramelo.sh
  git pull origin main
fi

chmod +x scripts/*.sh 2>/dev/null || true
echo "OK. Versão: $(grep '"version"' package.json | head -1)"
