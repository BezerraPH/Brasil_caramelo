#!/bin/bash
# Configura HTTPS na LAN com mkcert + nginx (app, LiveKit WSS, Soketi WSS).
#
# Uso: bash scripts/setup-https-lan.sh
#      bash scripts/setup-https-lan.sh --force-80   # tenta liberar porta 80 (para default do nginx)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

FORCE_80=0
for arg in "$@"; do
  [ "$arg" = "--force-80" ] && FORCE_80=1
done

CERT_PEM="${CERT_PEM:-$ROOT/brasilcaramelo.com+1.pem}"
KEY_PEM="${KEY_PEM:-$ROOT/brasilcaramelo.com+1-key.pem}"

if [ ! -f "$CERT_PEM" ] || [ ! -f "$KEY_PEM" ]; then
  echo "ERRO: Certificados não encontrados."
  echo "  mkcert -install && mkcert brasilcaramelo.com 192.168.1.4"
  exit 1
fi

if command -v tailscale >/dev/null 2>&1 && tailscale serve status 2>/dev/null | grep -qE 'https://|proxy'; then
  echo ""
  echo "AVISO: tailscale serve está ativo. Este script configura modo LAN (mkcert/brasilcaramelo.com)."
  echo "       Se você usa Tailscale no celular, rode: sudo bash scripts/setup-tailscale.sh --serve"
  echo "       (não misture os dois modos no .env)"
  echo ""
fi

echo "==> Pacotes (nginx, libnss3-tools)..."
sudo apt-get update -qq
sudo apt-get install -y nginx libnss3-tools

if bc_port_in_use 80; then
  echo ""
  echo "AVISO: Porta 80 já está em uso:"
  bc_port_listener 80
  echo ""
  if [ "$FORCE_80" -eq 1 ]; then
    echo "Tentando parar nginx/apache conflitantes..."
    sudo systemctl stop apache2 2>/dev/null || true
    sudo systemctl disable apache2 2>/dev/null || true
  else
    echo "O redirect HTTP→HTTPS na porta 80 será OMITIDO."
    echo "Acesse diretamente: https://brasilcaramelo.com"
    echo "Para investigar: sudo ss -tlnp | grep ':80'"
    echo "Para tentar liberar a 80: bash scripts/setup-https-lan.sh --force-80"
    echo ""
  fi
fi

USE_PORT_80=1
if bc_port_in_use 80 && [ "$FORCE_80" -eq 0 ]; then
  USE_PORT_80=0
fi

echo "==> Copiando certificados..."
sudo cp "$CERT_PEM" /etc/ssl/certs/brasilcaramelo.pem
sudo cp "$KEY_PEM" /etc/ssl/private/brasilcaramelo.key
sudo chmod 644 /etc/ssl/certs/brasilcaramelo.pem
sudo chmod 600 /etc/ssl/private/brasilcaramelo.key

echo "==> Gerando config nginx..."
REDIRECT_BLOCK=""
if [ "$USE_PORT_80" -eq 1 ]; then
  REDIRECT_BLOCK='
server {
    listen 80;
    listen [::]:80;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;
    return 301 https://$host$request_uri;
}
'
fi

sudo tee /etc/nginx/sites-available/brasilcaramelo >/dev/null <<NGINX
# Gerado por scripts/setup-https-lan.sh

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;

    ssl_certificate     /etc/ssl/certs/brasilcaramelo.pem;
    ssl_certificate_key /etc/ssl/private/brasilcaramelo.key;
    client_max_body_size 32M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 7443 ssl;
    listen [::]:7443 ssl;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;

    ssl_certificate     /etc/ssl/certs/brasilcaramelo.pem;
    ssl_certificate_key /etc/ssl/private/brasilcaramelo.key;

    location / {
        proxy_pass http://127.0.0.1:7880;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}

server {
    listen 6443 ssl;
    listen [::]:6443 ssl;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;

    ssl_certificate     /etc/ssl/certs/brasilcaramelo.pem;
    ssl_certificate_key /etc/ssl/private/brasilcaramelo.key;

    location / {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
${REDIRECT_BLOCK}
NGINX

sudo ln -sf /etc/nginx/sites-available/brasilcaramelo /etc/nginx/sites-enabled/brasilcaramelo
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

echo "==> Testando e iniciando nginx..."
sudo nginx -t
sudo systemctl enable nginx
if systemctl is-active nginx >/dev/null 2>&1; then
  sudo systemctl reload nginx
else
  sudo systemctl start nginx
fi

if ! systemctl is-active nginx >/dev/null 2>&1; then
  echo "ERRO: nginx não subiu. Logs:"
  sudo journalctl -u nginx -n 20 --no-pager || true
  exit 1
fi

bc_ensure_server_hosts "$(bc_lan_ip)" "brasilcaramelo.com" || true

echo "==> Ajustando .env (backup .env.bak.https)..."
if [ -f .env ]; then
  cp .env .env.bak.https
  sed -i 's|^BC_HOST=.*|BC_HOST=brasilcaramelo.com|' .env
  sed -i 's|^APP_URL=.*|APP_URL=https://brasilcaramelo.com|' .env
  sed -i 's|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://brasilcaramelo.com|' .env
  sed -i 's|^COOKIE_SECURE=.*|COOKIE_SECURE=true|' .env
  sed -i 's|^NEXT_PUBLIC_LIVEKIT_URL=.*|NEXT_PUBLIC_LIVEKIT_URL=wss://brasilcaramelo.com:7443|' .env
  sed -i 's|^NEXT_PUBLIC_PUSHER_HOST=.*|NEXT_PUBLIC_PUSHER_HOST=brasilcaramelo.com|' .env
  sed -i 's|^NEXT_PUBLIC_PUSHER_PORT=.*|NEXT_PUBLIC_PUSHER_PORT=6443|' .env
  sed -i 's|^NEXT_PUBLIC_PUSHER_USE_TLS=.*|NEXT_PUBLIC_PUSHER_USE_TLS=true|' .env
  grep -q '^BC_LAN_IP=' .env || echo "BC_LAN_IP=$(bc_lan_ip)" >> .env
  sed -i "s|^BC_LAN_IP=.*|BC_LAN_IP=$(bc_lan_ip)|" .env
fi

echo "==> Verificando HTTPS..."
if curl -sS -m 5 -kI "https://127.0.0.1/" -H "Host: brasilcaramelo.com" | head -1 | grep -qE 'HTTP/'; then
  echo "OK: HTTPS responde na 443"
else
  echo "AVISO: curl HTTPS falhou — rode: bash scripts/server-audit.sh"
fi

CA_ROOT="$(mkcert -CAROOT)/rootCA.pem"
bc_hr
echo "  App:     https://brasilcaramelo.com"
echo "  LiveKit: wss://brasilcaramelo.com:7443"
echo "  Soketi:  wss://brasilcaramelo.com:6443"
[ "$USE_PORT_80" -eq 0 ] && echo "  (sem redirect :80 — use URL https diretamente)"
echo ""
echo "  Próximo: docker compose up -d --build && docker compose restart livekit coturn"
echo "  PC: hosts + instalar $CA_ROOT"
echo "  Auditoria: bash scripts/server-audit.sh"
bc_hr
