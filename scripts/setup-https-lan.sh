#!/bin/bash
# Configura HTTPS na LAN com mkcert + nginx (app, LiveKit WSS, Soketi WSS).
# Rode no servidor Ubuntu, na pasta do projeto, DEPOIS de:
#   mkcert -install
#   mkcert brasilcaramelo.com 192.168.1.4
#
# Uso: bash scripts/setup-https-lan.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CERT_PEM="${CERT_PEM:-$ROOT/brasilcaramelo.com+1.pem}"
KEY_PEM="${KEY_PEM:-$ROOT/brasilcaramelo.com+1-key.pem}"

if [ ! -f "$CERT_PEM" ] || [ ! -f "$KEY_PEM" ]; then
  echo "ERRO: Certificados não encontrados."
  echo "  Rode na pasta do projeto:"
  echo "    mkcert -install"
  echo "    mkcert brasilcaramelo.com 192.168.1.4"
  exit 1
fi

echo "==> Instalando nginx e libnss3-tools (certutil para Chrome no servidor)..."
sudo apt-get update -qq
sudo apt-get install -y nginx libnss3-tools

echo "==> Copiando certificados..."
sudo cp "$CERT_PEM" /etc/ssl/certs/brasilcaramelo.pem
sudo cp "$KEY_PEM" /etc/ssl/private/brasilcaramelo.key
sudo chmod 644 /etc/ssl/certs/brasilcaramelo.pem
sudo chmod 600 /etc/ssl/private/brasilcaramelo.key

echo "==> Configurando nginx..."
sudo tee /etc/nginx/sites-available/brasilcaramelo >/dev/null <<'NGINX'
# Gerado por scripts/setup-https-lan.sh — HTTPS LAN Brasil Caramelo

# App Next.js
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# LiveKit WebSocket (evita mixed content: página HTTPS + ws:// bloqueado)
server {
    listen 7443 ssl;
    listen [::]:7443 ssl;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;

    ssl_certificate     /etc/ssl/certs/brasilcaramelo.pem;
    ssl_certificate_key /etc/ssl/private/brasilcaramelo.key;

    location / {
        proxy_pass http://127.0.0.1:7880;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}

# Soketi / Pusher (chat e chamadas em tempo real)
server {
    listen 6443 ssl;
    listen [::]:6443 ssl;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;

    ssl_certificate     /etc/ssl/certs/brasilcaramelo.pem;
    ssl_certificate_key /etc/ssl/private/brasilcaramelo.key;

    location / {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name brasilcaramelo.com www.brasilcaramelo.com 192.168.1.4;
    return 301 https://$host$request_uri;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/brasilcaramelo /etc/nginx/sites-enabled/brasilcaramelo
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx

echo "==> Ajustando .env (backup em .env.bak.https)..."
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
  grep -q '^BC_HOST=' .env || echo 'BC_HOST=brasilcaramelo.com' >> .env
  grep -q '^COOKIE_SECURE=' .env || echo 'COOKIE_SECURE=true' >> .env
else
  echo "AVISO: .env não encontrado — rode bash scripts/setup-env.sh antes."
fi

CA_ROOT="$(mkcert -CAROOT)/rootCA.pem"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HTTPS configurado no servidor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  App:     https://brasilcaramelo.com"
echo "  LiveKit: wss://brasilcaramelo.com:7443"
echo "  Soketi:  wss://brasilcaramelo.com:6443"
echo ""
echo "  PRÓXIMO PASSO — em CADA PC/celular que for usar:"
echo ""
echo "  1) DNS local — arquivo hosts (Windows como Admin):"
echo "     C:\\Windows\\System32\\drivers\\etc\\hosts"
echo "     192.168.1.4    brasilcaramelo.com"
echo "     192.168.1.4    www.brasilcaramelo.com"
echo ""
echo "  2) Confiar no certificado mkcert (PC):"
echo "     Instale o arquivo: $CA_ROOT"
echo "     (duplo clique → Instalar → Autoridades de certificação confiáveis)"
echo ""
echo "  3) Celular Android: copie rootCA.pem e instale como certificado CA."
echo ""
echo "  4) Rebuild do app (NEXT_PUBLIC_* mudou):"
echo "     docker compose up -d --build"
echo "     docker compose restart livekit coturn"
echo ""
echo "  Teste no servidor: curl -kI https://127.0.0.1 -H 'Host: brasilcaramelo.com'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
