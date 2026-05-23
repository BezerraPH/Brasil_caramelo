# Deploy — Brasil Caramelo (self-hosted)

Tudo que o app precisa roda com **um único** `docker-compose.yml` na raiz do projeto.

## Stack (docker compose)

| Serviço | Porta | Função |
|---------|-------|--------|
| **app** | 3000 | Next.js — site inteiro |
| **db** | 5432 (localhost) | PostgreSQL |
| **soketi** | 6001 | Chat, notificações, typing (tempo real) |
| **coturn** | 3478 | STUN/TURN — chamadas vídeo |
| **livekit** | 7880 | Latidos ao Vivo (áudio) |

Rede interna Docker: `bc`. O app fala com `soketi` pelo nome do container.

## Arquivos nesta pasta

| Caminho | Uso |
|---------|-----|
| `livekit/livekit.yaml` | Chaves do LiveKit (altere o secret) |
| `nginx/brasilcaramelo.conf` | Opcional — proxy na porta 80 |
| `gitea/` | Git separado (opcional, porta 3001) |

## Comandos

```bash
cd ~/brasil_caramelo
cp .env.example .env          # ou: ./scripts/setup-env.sh
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

Ou: `./scripts/deploy-ubuntu.sh`

## Gitea (Git)

Não faz parte do compose principal — sobe à parte se quiser:

```bash
cd deploy/gitea && docker compose up -d
```

Ver `gitea/README.md`.
