# DNS local — `brasilcaramelo.com` na sua rede

Sim: na mesma rede Wi‑Fi/LAN você pode acessar o app por um nome (ex. **brasilcaramelo.com**) em vez do IP `192.168.1.4`. O DNS só aponta o nome para o IP do servidor; o app continua na porta **3000** (ou **80** se usar nginx).

## Opção 1 — Arquivo hosts (mais rápido, por aparelho)

### Windows

1. Abra o Bloco de notas **como administrador**.
2. Edite: `C:\Windows\System32\drivers\etc\hosts`
3. Adicione no final:

```
192.168.1.4    brasilcaramelo.com
192.168.1.4    www.brasilcaramelo.com
```

4. Salve e no navegador acesse: **http://brasilcaramelo.com:3000**

Repita em cada PC/celular que for usar (no celular Android costuma exigir root; iOS também é limitado — veja opção 3).

### Linux / macOS

```bash
sudo nano /etc/hosts
```

Mesmas linhas acima. Depois: `http://brasilcaramelo.com:3000`

---

## Opção 2 — DNS no roteador (toda a rede)

Se o roteador tiver **DNS local** / **Static DNS** / **Local domain**:

| Nome | IP |
|------|-----|
| `brasilcaramelo.com` | `192.168.1.4` |

Cada fabricante chama de um jeito (TP-Link, Intelbras, Ubiquiti, etc.). Vale para todos os dispositivos da Wi‑Fi sem editar hosts.

---

## Opção 3 — dnsmasq no Ubuntu (servidor 192.168.1.4)

No servidor onde roda o Docker:

```bash
sudo apt install dnsmasq
```

Em `/etc/dnsmasq.d/brasilcaramelo.conf`:

```
address=/brasilcaramelo.com/192.168.1.4
address=/www.brasilcaramelo.com/192.168.1.4
```

```bash
sudo systemctl restart dnsmasq
```

No roteador, defina o **DNS primário** dos clientes como `192.168.1.4` (ou o IP do dnsmasq). Assim celulares e TVs também resolvem o nome.

---

## Opção 4 — Sem `:3000` (porta 80)

Use o nginx de exemplo em `deploy/nginx/brasilcaramelo.conf`:

```bash
sudo cp deploy/nginx/brasilcaramelo.conf /etc/nginx/sites-available/brasilcaramelo
sudo ln -s /etc/nginx/sites-available/brasilcaramelo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Acesso: **http://brasilcaramelo.com** (com hosts ou DNS apontando para o servidor).

---

## Configurar o app (.env)

No servidor, em `.env`:

```env
APP_URL=http://brasilcaramelo.com:3000
# ou, com nginx na porta 80:
# APP_URL=http://brasilcaramelo.com

COOKIE_SECURE=false
```

`COOKIE_SECURE=false` em HTTP local (rede interna). Se um dia usar HTTPS com certificado local, mude para `true`.

Reinicie o container:

```bash
docker compose up -d --build
```

---

## Pusher (chat / chamadas ao vivo)

No painel [Pusher](https://dashboard.pusher.com), em **App Keys → Authorized origins**, inclua:

- `http://brasilcaramelo.com:3000`
- `http://brasilcaramelo.com` (se usar nginx na 80)

Sem isso, o tempo real pode falhar ao abrir pelo novo domínio.

---

## Tailscale (opcional)

Pelo Tailscale você pode usar o IP `100.94.55.27` ou configurar **MagicDNS** com um nome na tailnet. O procedimento de hosts/DNS é o mesmo, trocando o IP pelo da máquina na tailnet.

---

## Resumo

| Método | Quem configura | Melhor para |
|--------|----------------|-------------|
| hosts | Cada PC | Teste rápido no seu notebook |
| Roteador | Uma vez na rede | Casa/escritório inteiro |
| dnsmasq | Servidor Ubuntu | Controle total + celulares |
| nginx :80 | Servidor | URL limpa sem porta |

O domínio **brasilcaramelo.com** na internet pública só funcionaria se você registrar o domínio e apontar DNS público — na LAN basta o truque acima (nome “falso” que só existe na sua rede).
