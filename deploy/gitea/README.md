# Gitea no ntek-servidor

## 1. Subir o Gitea (no Ubuntu)

```bash
# Confira seu UID (se não for 1000, edite USER_UID/GID no docker-compose.yml)
id -u
id -g

cd ~/brasil_caramelo/deploy/gitea
docker compose up -d
docker compose logs -f gitea   # Ctrl+C para sair
```

Acesse no navegador:

- Rede de casa: **http://192.168.1.4:3001**
- Tailscale (de qualquer lugar): **http://100.94.55.27:3001**

## 2. Configuração inicial (primeira vez)

1. **Database Type:** SQLite3 (mais simples em casa)
2. Crie usuário admin (ex.: `meksteel`) e senha forte
3. **Site Title:** Brasil Caramelo Git (ou o que quiser)
4. **Server Domain:** `192.168.1.4`
5. **SSH Server Port:** `2222`
6. **Gitea HTTP Listen Port:** `3000` (interno do container)
7. **Application URL:** `http://192.168.1.4:3001/`
8. Concluir instalação

## 3. Criar repositório na interface

1. Login → **+** → **New Repository**
2. Nome: `brasil_caramelo`
3. Marque **Private** se quiser
4. **Não** marque “Initialize repository” se já vai enviar código existente
5. Criar

## 4. Enviar código do servidor (primeira carga)

Se a pasta `~/brasil_caramelo` ainda não é um repo Git:

```bash
cd ~/brasil_caramelo
git init
git branch -M main
git add .
git commit -m "Versão inicial Brasil Caramelo"

# Troque meksteel pelo seu usuário Gitea
git remote add origin ssh://git@192.168.1.4:2222/meksteel/brasil_caramelo.git
git push -u origin main
```

Na primeira vez o Gitea pede para aceitar a chave SSH do host (digite `yes`).

## 5. Desktop Windows → servidor

### 5.1 Instalar Git

https://git-scm.com/download/win

### 5.2 Chave SSH (PowerShell)

```powershell
ssh-keygen -t ed25519 -C "desktop-brasil-caramelo"
# Enter para aceitar o caminho padrão

Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Copie a linha inteira.

### 5.3 Registrar chave no Gitea

1. Abra http://192.168.1.4:3001 (ou Tailscale)
2. **Settings** → **SSH / GPG Keys** → **Add Key**
3. Cole a chave pública → Salvar

### 5.4 Clonar ou conectar projeto existente

**Opção A — clone novo:**

```powershell
cd $env:USERPROFILE\Downloads\Projects
git clone ssh://git@192.168.1.4:2222/meksteel/brasil_caramelo.git
cd brasil_caramelo
```

**Opção B — pasta que você já tem:**

```powershell
cd C:\Users\pedro\Downloads\Projects\brasil_caramelo
git init
git remote add origin ssh://git@192.168.1.4:2222/meksteel/brasil_caramelo.git
git branch -M main
git add .
git commit -m "Sync do desktop"
git push -u origin main
```

Se o servidor já tiver commits, antes do push:

```powershell
git pull origin main --rebase
```

### 5.5 Fluxo do dia a dia

```powershell
# No desktop, após editar código:
git add .
git commit -m "Descreva a mudança"
git push
```

```bash
# No servidor, para atualizar e rebuildar o app:
cd ~/brasil_caramelo
git pull
docker compose up -d --build
```

## 6. Interface gráfica no Windows

- **Cursor / VS Code:** aba Source Control (já usa Git)
- **GitHub Desktop:** File → Add local repository
- **GitKraken**, **Sourcetree**, etc.

O remote continua sendo o Gitea (`ssh://git@192.168.1.4:2222/...`).

## 7. Tailscale (notebook fora de casa)

No desktop, se não estiver na mesma Wi‑Fi:

```powershell
git remote set-url origin ssh://git@100.94.55.27:2222/meksteel/brasil_caramelo.git
```

No Gitea, em **Settings → Application URL**, você pode usar o IP Tailscale se acessar só por lá.

## Portas no seu servidor

| Porta | Uso |
|-------|-----|
| 22 | SSH do Ubuntu (admin) |
| 80 | Outro serviço (já em uso) |
| 3000 | App Brasil Caramelo |
| 3001 | Interface web Gitea |
| 2222 | Git push/pull do Gitea |
| 5432 | Postgres (Docker) |

## Problemas comuns

**`Permission denied (publickey)`**  
→ Chave SSH não cadastrada no Gitea ou remote com usuário errado (`git@`, não `meksteel@`).

**`Connection refused` na 2222**  
→ `docker compose ps` em `deploy/gitea`; suba com `docker compose up -d`.

**Conflito ao push**  
→ `git pull --rebase` antes de `git push`.
