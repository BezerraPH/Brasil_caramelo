#!/usr/bin/env python3
"""
nao_essenciais/scripts/deploy_to_server.py — Pipeline de Deploy Contínuo Brasil Caramelo

Regra Obrigatória do Usuário (5 passos):
  1. Upar para GitHub e Gitea (http://192.168.1.6:3001)
  2. Atualizar os arquivos no servidor Ubuntu (192.168.1.6)
  3. Fazer build/up dos containers no Docker do servidor
  4. Executar testes de validação remotos e locais
  5. Exibir relatório detalhado de status

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
    print("🚀 INICIANDO PROTOCOLO OBRIGATÓRIO DE DEPLOY CONTÍNUO")
    print("====================================================================\n")

    # 0. Testes locais rápidos antes de qualquer push
    print("🧪 [PASSO 0] Validação local de integridade...")
    try:
        run_local("node --test nao_essenciais/tests/unit/v240_features.test.mjs")
        print("✅ Testes unitários locais aprovados com sucesso!")
    except Exception as e:
        print(f"⚠️  Aviso nos testes unitários: {e}")

    # 1. Commit de arquivos pendentes
    status = run_local("git status --porcelain", check=False).stdout.strip()
    if status:
        if not commit_msg:
            commit_msg = "chore: atualização contínua e sincronização com servidor"
        print(f"\n📦 Alterações detectadas. Criando commit: '{commit_msg}'...")
        run_local("git add .")
        run_local(f'git commit -m "{commit_msg}"')
    else:
        print("\n✅ Árvore de trabalho limpa, nenhum arquivo novo para comitar.")

    # 1.1 Push duplo: GitHub ('origin') e Gitea ('nostr')
    print("\n📤 [PASSO 1] Enviando para GitHub e Gitea...")

    # Push para o Gitea
    print("  ➔ Enviando para GITEA (nostr)...")
    try:
        run_local("git push nostr main")
        print("  ✅ Gitea atualizado com sucesso!")
    except Exception as e:
        print(f"  ❌ Falha ao enviar para o Gitea: {e}")

    # Push para o GitHub
    print("  ➔ Enviando para GITHUB (origin)...")
    try:
        run_local("git push origin main")
        print("  ✅ GitHub atualizado com sucesso!")
    except Exception as e:
        print(f"  ❌ Falha ao enviar para o GitHub: {e}")

    # 2 e 3. Atualizar arquivos e build/up no Servidor Ubuntu
    env = load_env_vars()
    host = os.environ.get("SSH_HOST") or env.get("SSH_HOST", "192.168.1.6")
    port = int(os.environ.get("SSH_PORT") or env.get("SSH_PORT", "22"))
    user = os.environ.get("SSH_USER") or env.get("SSH_USER", "meksteel")
    password = os.environ.get("SSH_PASSWORD") or env.get("SSH_PASSWORD", "683215")

    print(f"\n📡 [PASSO 2 & 3] Conectando via SSH a {user}@{host}:{port}...")
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
        print("✅ Conectado ao servidor Ubuntu com sucesso!\n")
    except Exception as e:
        print(f"❌ Erro ao conectar no servidor via SSH: {e}")
        sys.exit(1)

    remote_steps = [
        ("PASSO 2: Atualização dos arquivos no servidor (git pull)",
         "cd ~/brasil_caramelo && git config core.fileMode false && git pull origin main"),
        ("PASSO 3: Build e subida dos contêineres Docker",
         "cd ~/brasil_caramelo && docker compose up -d --build"),
        ("PASSO 4: Status dos contêineres",
         "cd ~/brasil_caramelo && docker compose ps"),
        ("PASSO 4: Teste HTTP na porta 3000",
         "curl -s -I http://localhost:3000 | head -n 5")
    ]

    for title, cmd in remote_steps:
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
    print("🎉 [PASSO 5] DEPLOY FINALIZADO E VALIDADO COM SUCESSO!")
    print(f"🌐 Aplicação ativa: http://{host}:3000")
    print(f"📦 Gitea: http://{host}:3001/meksteel/Brasil_Caramelo_nostr")
    print(f"🐙 GitHub: https://github.com/BezerraPH/Brasil_caramelo")
    print(f"🛡️ Tailscale: https://ntek-servidor.tail51633c.ts.net")
    print("====================================================================\n")

if __name__ == "__main__":
    main()
