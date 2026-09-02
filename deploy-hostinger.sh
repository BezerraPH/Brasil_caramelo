#!/usr/bin/env bash
# ==============================================================================
# BRASIL CARAMELO (NOSTR) — SCRIPT DE DEPLOY AUTOMATIZADO PARA HOSTINGER VPS
# ==============================================================================
# Requisitos: Ubuntu 22.04 / 24.04 LTS na Hostinger VPS (2GB+ RAM)
# Uso: chmod +x deploy-hostinger.sh && ./deploy-hostinger.sh
# ==============================================================================

set -e

echo "🚀 [1/6] Atualizando pacotes do sistema e instalando Docker..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# Instalar Docker se não existir
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "🛡️ [2/6] Configurando Firewall UFW (Portas 80, 443, 22)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "📦 [3/6] Verificando arquivo de ambiente .env..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️ Arquivo .env criado a partir de .env.example. Ajuste suas chaves secretas se necessário!"
    else
        echo "DATABASE_URL=\"postgresql://caramelo:caramelo_secret@postgres:5432/brasil_caramelo?schema=public\"" > .env
        echo "SESSION_SECRET=\"$(openssl rand -hex 32)\"" >> .env
        echo "NEXT_PUBLIC_APP_URL=\"https://seu-dominio.com\"" >> .env
    fi
fi

echo "🐘 [4/6] Executando migrações do banco de dados Prisma..."
if command -v npx &> /dev/null; then
    npx prisma migrate deploy || true
fi

echo "🐳 [5/6] Subindo containers Docker Compose (Caddy, Web, Postgres, MinIO, Soketi)..."
docker compose down || true
docker compose up -d --build

echo "✅ [6/6] DEPLOY CONCLUÍDO COM SUCESSO!"
echo "------------------------------------------------------------------"
echo "O Brasil Caramelo está rodando na Hostinger VPS."
echo "Certificado SSL Let's Encrypt é emitido automaticamente pelo Caddy."
echo "Para verificar status: docker compose ps"
echo "Para ver logs em tempo real: docker compose logs -f web"
echo "------------------------------------------------------------------"
