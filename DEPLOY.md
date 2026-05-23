# Deploy no Ubuntu

Stack **completa** com um comando — ver **CONFIGURACAO.md** para o `.env`.

## Instalação

```bash
cd ~/brasil_caramelo
chmod +x scripts/*.sh
./scripts/deploy-ubuntu.sh
```

Ou passo a passo:

```bash
cp .env.example .env
nano .env                    # BC_HOST=192.168.1.4
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

## Atualizar

```bash
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

## URLs (padrão LAN)

| Serviço | URL |
|---------|-----|
| App | http://192.168.1.4:3000 |
| Soketi | ws://192.168.1.4:6001 |
| LiveKit | ws://192.168.1.4:7880 |
| TURN | turn:192.168.1.4:3478 |

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| **CONFIGURACAO.md** | Guia do `.env` |
| **deploy/README.md** | Estrutura da stack |
| DNS-LOCAL.md | Nome na rede |
| Versions.txt | Histórico |

## Git (Gitea — opcional)

```bash
cd deploy/gitea && docker compose up -d
```

http://192.168.1.4:3001
