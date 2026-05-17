#!/bin/bash
set -euo pipefail

COMPOSE_DIR="$(cd "$(dirname "$0")/../deploy/gitea" && pwd)"
UID_NUM="$(id -u)"
GID_NUM="$(id -g)"

echo "==> UID/GID: $UID_NUM / $GID_NUM"
if [ "$UID_NUM" != "1000" ] || [ "$GID_NUM" != "1000" ]; then
  echo "    Se o Gitea der erro de permissão, edite USER_UID/USER_GID em:"
  echo "    $COMPOSE_DIR/docker-compose.yml"
fi

cd "$COMPOSE_DIR"
docker compose up -d

echo ""
echo "Gitea disponível em:"
echo "  LAN:       http://192.168.1.4:3001"
echo "  Tailscale: http://100.94.55.27:3001"
echo ""
echo "Próximo passo: abra no navegador e conclua o assistente de instalação."
echo "Guia completo: deploy/gitea/README.md"
