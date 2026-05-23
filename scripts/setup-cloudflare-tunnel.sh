#!/bin/bash
# Cloudflare Quick Tunnel — HTTPS público sem domínio próprio, sem mkcert no celular.
#
# O que funciona bem pelo túnel: app, login, feed, chat (Soketi), chamadas via Pusher.
# Latidos (LiveKit): sinalização pode passar; áudio/vídeo UDP em geral NÃO — veja CONFIGURACAO.md § 9.
#
# Uso:
#   bash scripts/setup-cloudflare-tunnel.sh
#   bash scripts/setup-cloudflare-tunnel.sh --env-only https://xxx.trycloudflare.com
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

ENV_ONLY=0
TUNNEL_URL=""

for arg in "$@"; do
  case "$arg" in
    --env-only)
      ENV_ONLY=1
      ;;
    --help|-h)
      echo "Uso: $0 [--env-only URL_HTTPS]"
      echo "  Sem args: nginx origem única (8780) + instruções cloudflared"
      echo "  --env-only https://xxx.trycloudflare.com  — aplica .env"
      exit 0
      ;;
    http*)
      TUNNEL_URL="${arg%/}"
      ;;
  esac
done

if [ $# -eq 1 ] && [[ "${1:-}" == http* ]]; then
  ENV_ONLY=1
  TUNNEL_URL="${1%/}"
fi

bc_apply_tunnel_env() {
  local base="$1"
  local host
  host="$(echo "$base" | sed -E 's#^https?://##; s#/.*##; s#:.*##')"

  if [ -z "$host" ]; then
    echo "ERRO: URL inválida: $base"
    exit 1
  fi

  echo "==> Atualizando .env para túnel: $base"
  if [ -f .env ]; then
    cp .env ".env.bak.tunnel.$(date +%Y%m%d%H%M%S)"
  fi
  touch .env

  for key in BC_HOST APP_URL NEXT_PUBLIC_APP_URL; do
    if grep -q "^${key}=" .env; then
      sed -i "s|^${key}=.*|${key}=${base}|" .env
    else
      echo "${key}=${base}" >> .env
    fi
  done

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
  echo "Próximo passo (obrigatório após mudar URLs públicas):"
  echo "  docker compose up -d --build"
  echo ""
}

bc_install_tunnel_nginx() {
  echo "==> Nginx origem única (porta 8780) para cloudflared..."
  sudo cp "$ROOT/deploy/nginx/brasilcaramelo-tunnel.conf" /etc/nginx/sites-available/brasilcaramelo-tunnel
  sudo ln -sf /etc/nginx/sites-available/brasilcaramelo-tunnel /etc/nginx/sites-enabled/brasilcaramelo-tunnel
  sudo nginx -t
  sudo systemctl reload nginx 2>/dev/null || sudo systemctl start nginx
  if ! bc_port_in_use 8780 | grep -q .; then
    echo "ERRO: nginx não está na porta 8780"
    exit 1
  fi
  echo "OK: http://127.0.0.1:8780 (app + /app Soketi + /rtc LiveKit)"
}

bc_install_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    return 0
  fi
  echo "==> Instalando cloudflared..."
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list >/dev/null
    sudo apt-get update -qq
    sudo apt-get install -y cloudflared
  else
    echo "Instale cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    exit 1
  fi
}

if [ "$ENV_ONLY" -eq 1 ] || [ -n "$TUNNEL_URL" ]; then
  if [ -z "$TUNNEL_URL" ]; then
    echo "ERRO: passe a URL: bash $0 --env-only https://xxxx.trycloudflare.com"
    exit 1
  fi
  bc_apply_tunnel_env "$TUNNEL_URL"
  exit 0
fi

bc_install_tunnel_nginx
bc_install_cloudflared

bc_hr
echo "  Cloudflare Quick Tunnel"
echo ""
echo "  Em OUTRO terminal (deixe rodando):"
echo "    cloudflared tunnel --url http://127.0.0.1:8780"
echo ""
echo "  Copie a URL https://....trycloudflare.com e rode:"
echo "    bash scripts/setup-cloudflare-tunnel.sh --env-only https://SUA-URL.trycloudflare.com"
echo "    docker compose up -d --build"
echo ""
echo "  Limitações (Latidos/WebRTC): CONFIGURACAO.md § 9"
bc_hr
