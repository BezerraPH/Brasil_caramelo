#!/bin/bash
# Corrige nginx para modo Tailscale (só porta 8780; sem vhosts 80/443).
# Rode no servidor quando deploy falhar em "Job for nginx.service failed".
#
#   sudo bash scripts/fix-nginx-tailscale.sh
#   sudo bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

echo "==> Diagnóstico (portas 80 / 443 / 8780)"
for p in 80 443 8780; do
  echo "--- :${p} ---"
  bc_port_listener "$p" | sed 's/^/  /' || echo "  (livre)"
done

echo ""
echo "==> sites-enabled"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true

echo ""
bc_install_tunnel_origin_nginx "$ROOT"

if command -v tailscale >/dev/null 2>&1; then
  echo ""
  echo "==> Reaplicando tailscale serve (443 → 8780)..."
  sudo tailscale serve reset 2>/dev/null || true
  sudo tailscale serve --bg --https=443 "http://127.0.0.1:8780"
  DNS="$(tailscale status 2>/dev/null | awk '/^100\./{print $2; exit}')"
  if [ -n "$DNS" ]; then
    echo "Teste: curl -sI https://${DNS}/api/health | head -3"
  fi
fi

echo ""
echo "OK. Se o app ainda não subiu: docker compose up -d --build"
