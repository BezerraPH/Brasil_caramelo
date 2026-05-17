# Como testar o Brasil Caramelo

## Corrigir Git no Windows (erro “untracked working tree files”)

Você fez `git init` numa pasta que **já tinha arquivos**. O Git não sabe se são iguais ao servidor.

**Opção A — Igualar ao servidor (recomendado se o PC e o servidor têm o mesmo código):**

```powershell
cd C:\Users\pedro\Downloads\Projects\brasil_caramelo
git fetch origin
git reset --hard origin/main
git branch -M main
```

**Opção B — Enviar arquivos extras do PC (ex.: pasta `deploy/gitea`) para o Gitea:**

```powershell
cd C:\Users\pedro\Downloads\Projects\brasil_caramelo
git add -A
git commit -m "Melhorias e deploy gitea"
git branch -M main
git push -u origin main
```

Se o push pedir pull antes, use:

```powershell
git pull origin main --rebase
git push
```

**Conferir que está certo:**

```powershell
git status
git log -1 --oneline
```

Deve mostrar `On branch main` e `nothing to commit` (ou só mudanças que você fez depois).

---

## O que vale guardar (anote num bloco de notas)

| Item | Exemplo seu |
|------|-------------|
| Gitea (web) | http://192.168.1.4:3001 |
| Gitea (Tailscale) | http://100.94.55.27:3001 |
| App Brasil Caramelo | http://192.168.1.4:3000 |
| Git remote | `ssh://git@192.168.1.4:2222/meksteel/brasil_caramelo.git` |
| Usuário Gitea | `meksteel` |
| Senha Gitea | (a que você criou na instalação) |

**Não compartilhe:** senhas, conteúdo de `~/.ssh/id_ed25519` (chave **privada**).  
**Pode cadastrar no Gitea:** só o `.pub` (chave **pública**).

Os avisos *post-quantum* do SSH podem ser ignorados em rede de casa.

---

## Teste no servidor (produção Docker)

### 1. Atualizar código

```bash
cd ~/brasil_caramelo
git pull
```

### 2. Ambiente

```bash
cp -n .env.example .env   # só se .env não existir
```

### 3. Subir app + banco

```bash
docker compose up -d --build
```

Aguarde 1–2 minutos na primeira vez.

### 4. Saúde da API

```bash
curl -s http://localhost:3000/api/health
```

Resposta esperada: `{"ok":true,"database":"connected"}`

### 5. No navegador (PC ou celular na mesma rede)

1. Abra **http://192.168.1.4:3000**
2. **Criar conta** — use usuário só com minúsculas, ex.: `pedro_teste`
3. Você deve ir para o **Feed**
4. Escreva um **recado** e publique
5. Menu **Meu perfil** — veja sua página
6. Abra outra conta (outro navegador ou aba anônima), cadastre `amigo_teste`
7. No perfil do primeiro usuário, clique nos emojis de **reputação canina**
8. Volte ao perfil — a barra de reputação deve atualizar
9. No feed, clique em **Legal** num recado (curtida)

---

## Teste no Windows (desenvolvimento local)

### 1. Banco só do Postgres

```powershell
cd C:\Users\pedro\Downloads\Projects\brasil_caramelo
docker compose up db -d
copy .env.example .env
npm install
npx prisma generate
npm run db:deploy
```

### 2. Rodar app

```powershell
npm run dev
```

Abra **http://localhost:3000** e repita os passos do navegador acima.

---

## Checklist rápido

- [ ] `git status` limpo no PC e no servidor
- [ ] `curl http://localhost:3000/api/health` → `ok: true` no servidor
- [ ] Cadastro e login funcionam
- [ ] Recado aparece no feed
- [ ] Curtida muda contador
- [ ] Reputação no perfil de outro usuário funciona
- [ ] Gitea mostra commits em http://192.168.1.4:3001

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Página não abre | `docker compose ps` — app deve estar `running` |
| Erro de banco | `docker compose logs db` e confira `DATABASE_URL` no `.env` |
| 503 em `/api/health` | Banco ainda subindo; espere e `docker compose restart app` |
| Push Git falha | Chave SSH do PC cadastrada no Gitea? |
| Porta 5432 no browser | Não use; só HTTP na 3000 e 3001 |
