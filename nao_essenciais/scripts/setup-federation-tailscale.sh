#!/bin/bash
# Gera FEDERATION_EXPORT_SECRET e mostra checklist Tailscale para Caramelo-Sync.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ] && ! grep -qE '^FEDERATION_EXPORT_SECRET=.+' .env 2>/dev/null; then
  if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -hex 32)"
    if grep -q '^FEDERATION_EXPORT_SECRET=' .env; then
      sed -i.bak "s/^FEDERATION_EXPORT_SECRET=.*/FEDERATION_EXPORT_SECRET=$SECRET/" .env 2>/dev/null || \
        sed -i '' "s/^FEDERATION_EXPORT_SECRET=.*/FEDERATION_EXPORT_SECRET=$SECRET/" .env
    else
      printf '\nFEDERATION_EXPORT_SECRET=%s\n' "$SECRET" >> .env
    fi
    echo "FEDERATION_EXPORT_SECRET gerado no .env"
  fi
fi

echo ""
echo "=== Caramelo-Sync via Tailscale ==="
echo "1. Nos dois servidores: mesmo FEDERATION_EXPORT_SECRET no .env"
echo "2. tailscale serve https / http://127.0.0.1:3000"
echo "3. Em /configuracoes → aba Tailscale → URL https://outro-host.tailXXXX.ts.net"
echo "4. Testar peer → Sincronizar peers"
echo ""
echo "LAN continua funcionando com IP:3000 na aba LAN."
