#!/bin/bash
# Cria .env a partir do exemplo, substituindo BC_HOST pelo IP detectado.
set -euo pipefail
cd "$(dirname "$0")/.."

HOST="${1:-$(hostname -I | awk '{print $1}')}"
if [ -z "$HOST" ]; then
  echo "Não foi possível detectar IP. Use: ./scripts/setup-env.sh 192.168.1.4"
  exit 1
fi

if [ -f .env ]; then
  echo "Arquivo .env já existe. Renomeie ou apague antes de rodar setup-env."
  exit 1
fi

cp .env.example .env

# Linux sed
if sed --version >/dev/null 2>&1; then
  sed -i "s/BC_HOST=.*/BC_HOST=$HOST/" .env
  sed -i "s|192.168.1.4|$HOST|g" .env
else
  sed -i '' "s/BC_HOST=.*/BC_HOST=$HOST/" .env
  sed -i '' "s|192.168.1.4|$HOST|g" .env
fi

echo "Criado .env com BC_HOST=$HOST"
echo "Próximo passo: docker compose up -d --build"
