# TURN / coturn — chamadas WebRTC fora da LAN

O Brasil Caramelo usa STUN público (Google) por padrão. Para chamadas entre redes diferentes (4G ↔ Wi‑Fi, outra casa), configure um servidor **TURN**.

## 1. Instalar coturn (Ubuntu)

```bash
sudo apt install coturn
sudo systemctl enable coturn
```

## 2. `/etc/turnserver.conf` (exemplo)

```
listening-port=3478
fingerprint
lt-cred-mech
user=caramelo:SEU_SEGREDO_FORTE
realm=brasilcaramelo.com
```

## 3. Variáveis no `.env` do app

```env
NEXT_PUBLIC_TURN_URL=turn:brasilcaramelo.com:3478
NEXT_PUBLIC_TURN_USERNAME=caramelo
NEXT_PUBLIC_TURN_CREDENTIAL=SEU_SEGREDO_FORTE
```

Reinicie o container/app após alterar.

## 4. Firewall

Libere UDP/TCP **3478** (e faixa RTP se usar relay amplo).

## 5. Teste

Abra `/mensagens`, inicie chamada com um amigo em outra rede. No overlay, o app indica se TURN está configurado (`src/lib/webrtc-ice.ts`).
