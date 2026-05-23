# coturn — chamadas WebRTC

Roda no container **coturn** do `docker-compose.yml` (porta **3478**).

## Configuração no `.env`

```env
NEXT_PUBLIC_STUN_URL=stun:192.168.1.4:3478
NEXT_PUBLIC_TURN_URL=turn:192.168.1.4:3478
NEXT_PUBLIC_TURN_USERNAME=caramelo
NEXT_PUBLIC_TURN_CREDENTIAL=caramelo_turn_secret
```

Credenciais padrão batem com `TURN_USERNAME` / `TURN_PASSWORD` no compose.

## Subir

```bash
docker compose up -d --build
```

## Mesma Wi‑Fi vs 4G

| Cenário | TURN necessário? |
|---------|------------------|
| Dois dispositivos na LAN | Often não |
| Celular 4G ↔ Wi‑Fi | Sim |

Veja **CONFIGURACAO.md**.
