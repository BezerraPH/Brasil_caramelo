#!/bin/bash
# Brasil Caramelo — acesso via Tailscale (você já tem o agente rodando).
# HTTPS confiável na tailnet com "tailscale serve" — sem hosts, sem mkcert, sem Cloudflare.
#
# Uso:
#   bash scripts/setup-tailscale.sh              # detecta IP/DNS e configura nginx 8780 + .env
#   bash scripts/setup-tailscale.sh --serve      # idem + tailscale serve --bg na 443
#   bash scripts/setup-tailscale.sh --env-only https://ntek-servidor.tailxxxxx.ts.net
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

DO_SERVE=0
ENV_ONLY=0
BASE_URL=""

for arg in "$@"; do
  case "$arg" in
    --serve) DO_SERVE=1 ;;
    --env-only) ENV_ONLY=1 ;;
    --help|-h)
      echo "Uso: $0 [--serve] [--env-only URL]"
      exit 0
      ;;
    http*)
      BASE_URL="${arg%/}"
      ENV_ONLY=1
      ;;
  esac
done

if [ $# -eq 1 ] && [[ "${1:-}" == http* ]]; then
  ENV_ONLY=1
  BASE_URL="${1%/}"
fi

bc_tailscale_ipv4() {
  if ! command -v tailscale >/dev/null 2>&1; then
    echo ""
    return
  fi
  tailscale ip -4 2>/dev/null | head -1 || true
}

bc_tailscale_dns() {
  if ! command -v tailscale >/dev/null 2>&1; then
    echo ""
    return
  fi
  local name=""
  if command -v python3 >/dev/null 2>&1; then
    name="$(tailscale status --json 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('Self', {}).get('DNSName', '').rstrip('.'))
except Exception:
    pass
" 2>/dev/null || true)"
  fi
  if [ -z "$name" ]; then
    name="$(tailscale status --json 2>/dev/null | sed -n 's/.*"DNSName": *"\([^"]*\)".*/\1/p' | head -1 | sed 's/\.$//' || true)"
  fi
  if [ -n "$name" ]; then
    echo "$name"
    return
  fi
  tailscale status 2>/dev/null | awk '/^100\./{print $2; exit}' || true
}

bc_install_origin_nginx() {
  if [ ! -f "$ROOT/deploy/nginx/brasilcaramelo-tunnel.conf" ]; then
    echo "ERRO: falta deploy/nginx/brasilcaramelo-tunnel.conf"
    exit 1
  fi
  echo "==> Nginx origem única (8780): app + Soketi + LiveKit..."
  sudo cp "$ROOT/deploy/nginx/brasilcaramelo-tunnel.conf" /etc/nginx/sites-available/brasilcaramelo-tailscale
  sudo ln -sf /etc/nginx/sites-available/brasilcaramelo-tailscale /etc/nginx/sites-enabled/brasilcaramelo-tailscale
  sudo nginx -t
  sudo systemctl reload nginx 2>/dev/null || sudo systemctl start nginx
  echo "OK: http://127.0.0.1:8780"
}

bc_apply_tailscale_env() {
  local base="$1"
  local host ts_ip
  host="$(echo "$base" | sed -E 's#^https?://##; s#/.*##; s#:.*##')"
  ts_ip="$(bc_tailscale_ipv4)"

  echo "==> .env para Tailscale: $base"
  if [ -f .env ]; then
    cp .env ".env.bak.tailscale.$(date +%Y%m%d%H%M%S)"
  fi
  touch .env

  for key in BC_HOST APP_URL NEXT_PUBLIC_APP_URL; do
    if grep -q "^${key}=" .env; then
      sed -i "s|^${key}=.*|${key}=${base}|" .env
    else
      echo "${key}=${base}" >> .env
    fi
  done

  if [ -n "$ts_ip" ]; then
    if grep -q '^BC_LAN_IP=' .env; then
      sed -i "s|^BC_LAN_IP=.*|BC_LAN_IP=${ts_ip}|" .env
    else
      echo "BC_LAN_IP=${ts_ip}" >> .env
    fi
    if grep -q '^NEXT_PUBLIC_TURN_URL=' .env; then
      sed -i "s|^NEXT_PUBLIC_TURN_URL=.*|NEXT_PUBLIC_TURN_URL=turn:${ts_ip}:3478|" .env
    else
      echo "NEXT_PUBLIC_TURN_URL=turn:${ts_ip}:3478" >> .env
    fi
    if grep -q '^NEXT_PUBLIC_STUN_URL=' .env; then
      sed -i "s|^NEXT_PUBLIC_STUN_URL=.*|NEXT_PUBLIC_STUN_URL=stun:${ts_ip}:3478|" .env
    else
      echo "NEXT_PUBLIC_STUN_URL=stun:${ts_ip}:3478" >> .env
    fi
  fi

  if grep -q '^COOKIE_SECURE=' .env; then
    sed -i 's|^COOKIE_SECURE=.*|COOKIE_SECURE=true|' .env
  else
    echo 'COOKIE_SECURE=true' >> .env
  fi

  if grep -q '^NEXT_PUBLIC_PUSHER_HOST=' .env; then
    sed -i "s|^NEXT_PUBLIC_PUSHER_HOST=.*|NEXT_PUBLIC_PUSHER_HOST=${host}|" .env
  else
    echo "NEXT_PUBLIC_PUSHER_HOST=${host}" >> .env
  fi

  for kv in \
    "NEXT_PUBLIC_PUSHER_PORT=443" \
    "NEXT_PUBLIC_PUSHER_USE_TLS=true" \
    "NEXT_PUBLIC_LIVEKIT_URL=wss://${host}" \
    "PUSHER_USE_TLS=false"; do
    k="${kv%%=*}"
    v="${kv#*=}"
    if grep -q "^${k}=" .env; then
      sed -i "s|^${k}=.*|${k}=${v}|" .env
    else
      echo "${k}=${v}" >> .env
    fi
  done

  echo ""
  echo "==> LiveKit: ajuste node_ip em deploy/livekit/livekit.yaml para o IP Tailscale:"
  echo "    rtc.node_ip: ${ts_ip:-<tailscale ip -4>}"
  echo "    Depois: docker compose restart livekit coturn"
  echo ""
  echo "==> Rebuild obrigatório:"
  echo "    docker compose up -d --build"
  echo ""
}

bc_tailscale_serve() {
  if ! command -v tailscale >/dev/null 2>&1; then
    echo "ERRO: tailscale não encontrado"
    exit 1
  fi
  echo "==> tailscale serve (HTTPS na tailnet, porta 443)..."
  sudo tailscale serve reset 2>/dev/null || true
  sudo tailscale serve --bg --https=443 "http://127.0.0.1:8780"
  echo "OK: tailscale serve ativo. Teste de outro aparelho na tailnet:"
  echo "    curl -sI https://$(bc_tailscale_dns)/api/health | head -3"
}

if [ "$ENV_ONLY" -eq 1 ]; then
  if [ -z "$BASE_URL" ]; then
    echo "ERRO: bash $0 --env-only https://SEU-HOSTNAME.ts.net"
    exit 1
  fi
  bc_apply_tailscale_env "$BASE_URL"
  exit 0
fi

TS_IP="$(bc_tailscale_ipv4)"
TS_DNS="$(bc_tailscale_dns)"

if [ -z "$TS_IP" ]; then
  echo "ERRO: Tailscale não retornou IP. Rode: sudo tailscale up"
  exit 1
fi

bc_hr
echo "  Tailscale detectado"
echo "  IP:      ${TS_IP}"
echo "  DNS:     ${TS_DNS:-(ative MagicDNS no admin Tailscale)}"
echo "  LAN:     $(bc_lan_ip) (Wi‑Fi local — opcional)"
bc_hr

bc_install_origin_nginx

if [ -n "$TS_DNS" ]; then
  BASE_URL="https://${TS_DNS}"
else
  echo ""
  echo "AVISO: MagicDNS não encontrado. Use o IP (certificado serve na tailnet):"
  echo "  https://${TS_IP}"
  BASE_URL="https://${TS_IP}"
fi

bc_apply_tailscale_env "$BASE_URL"

if [ "$DO_SERVE" -eq 1 ]; then
  bc_tailscale_serve
else
  echo "Para HTTPS automático na tailnet (sem mkcert no celular):"
  echo "  sudo bash $0 --serve"
  echo ""
  echo "Ou manualmente:"
  echo "  sudo tailscale serve --bg --https=443 http://127.0.0.1:8780"
fi

bc_hr
echo "  No celular/PC: app Tailscale ligado → abra ${BASE_URL}"
echo "  Guia: CONFIGURACAO.md § 8"
bc_hr
