#!/usr/bin/env python3
"""
nao_essenciais/scripts/deploy_to_server.py — Automação de Deploy Contínuo via Gitea + SSH

Fluxo automatizado:
  1. Commit local de arquivos pendentes (opcional, com mensagem customizada)
  2. Envio das alterações para o Gitea (git push nostr main)
  3. Conexão remota SSH com o servidor Ubuntu (192.168.1.6)
  4. Atualização do repositório no servidor (git pull origin main)
  5. Reconstrução e reinicialização dos containers (docker compose up -d --build)
  6. Checagem de integridade e status dos containers

Uso:
  python nao_essenciais/scripts/deploy_to_server.py
  python nao_essenciais/scripts/deploy_to_server.py "mensagem do commit"
  npm run deploy:server
"""

import os
import sys
import subprocess
from pathlib import Path
import paramiko

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

def load_env_vars():
    """Lê credenciais do .env ou .env.local."""
    env = {}
    root_dir = Path(__file__).resolve().parent.parent.parent
    for ef in [root_dir / ".env.local", root_dir / ".env", root_dir / ".env.example"]:
        if ef.exists():
            with open(ef, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in env:
                            env[k] = v
    return env

def run_local(cmd, check=True):
    print(f"⚙️  [LOCAL] {cmd}")
    res = subprocess.run(cmd, shell=True, text=True, capture_output=True, encoding="utf-8", errors="replace")
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr and res.returncode != 0:
        print(f"⚠️  [ERRO] {res.stderr.strip()}")
    if check and res.returncode != 0:
        raise RuntimeError(f"Comando falhou com código {res.returncode}: {cmd}")
    return res

def main():
    commit_msg = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None

    print("\n====================================================================")
    print("🚀 INICIANDO DEPLOY AUTOMATIZADO: DESKTOP ➔ GITEA ➔ UBUNTU SERVER")
    print("====================================================================\n")

    # 1. Checa status do git local
    status = run_local("git status --porcelain", check=False).stdout.strip()
    if status:
        if not commit_msg:
            commit_msg = "chore: deploy automático e sincronização com servidor"
        print(f"📦 Detectadas alterações locais não comitadas. Criando commit...")
        run_local("git add .")
        run_local(f'git commit -m "{commit_msg}"')
    else:
        print("✅ Nenhuma alteração pendente no repositório local.")

    # 2. Push para o Gitea (remote 'nostr')
    print("\n📤 Enviando commits para o servidor Gitea local...")
    try:
        run_local("git push nostr main")
    except Exception as e:
        print(f"⚠️  Falha no push para 'nostr'. Tentando 'origin'...")
        run_local("git push origin main")

    # 3. Conexão SSH com o servidor Ubuntu
    env = load_env_vars()
    host = os.environ.get("SSH_HOST") or env.get("SSH_HOST", "192.168.1.6")
    port = int(os.environ.get("SSH_PORT") or env.get("SSH_PORT", "22"))
    user = os.environ.get("SSH_USER") or env.get("SSH_USER", "meksteel")
    password = os.environ.get("SSH_PASSWORD") or env.get("SSH_PASSWORD", "683215")

    print(f"\n📡 Conectando via SSH a {user}@{host}:{port}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(
            hostname=host,
            port=port,
            username=user,
            password=password,
            timeout=10,
            auth_timeout=10
        )
        print("✅ Conectado com sucesso ao servidor Ubuntu!\n")
    except Exception as e:
        print(f"❌ Erro ao conectar no servidor Ubuntu via SSH: {e}")
        sys.exit(1)

    remote_commands = [
        ("Sincronizando com Gitea", "cd ~/brasil_caramelo && git config core.fileMode false && git pull origin main"),
        ("Reconstruindo e iniciando Docker Compose", "cd ~/brasil_caramelo && docker compose up -d --build"),
        ("Verificando status dos containers", "cd ~/brasil_caramelo && docker compose ps")
    ]

    for title, cmd in remote_commands:
        print(f"💻 [SERVIDOR] {title}...")
        print(f"   $ {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        for line in iter(stdout.readline, ""):
            print(f"   │ {line}", end="")
        exit_code = stdout.channel.recv_exit_status()
        if exit_code != 0:
            print(f"   ⚠️ Comando finalizou com código {exit_code}")
        print()

    client.close()

    print("====================================================================")
    print("🎉 DEPLOY CONCLUÍDO COM SUCESSO!")
    print(f"🌐 Aplicação disponível em: http://{host}:3000")
    print("🌐 Via Tailscale: https://ntek-servidor.tail51633c.ts.net")
    print("====================================================================\n")

if __name__ == "__main__":
    main()
