#!/usr/bin/env python3
"""
scripts/remote_ssh.py — Execução remota automatizada no servidor Ubuntu via SSH
Lê as credenciais do arquivo .env ou .env.local na raiz do projeto.
Uso:
  python scripts/remote_ssh.py "docker ps"
  python scripts/remote_ssh.py "docker compose logs --tail 50"
"""

import os
import sys
from pathlib import Path
import paramiko

def load_env_vars():
    """Lê variáveis do .env ou .env.local sem dependência externa."""
    env = {}
    root_dir = Path(__file__).resolve().parent.parent
    env_files = [root_dir / ".env.local", root_dir / ".env"]

    for ef in env_files:
        if ef.exists():
            with open(ef, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startsWith("#") if hasattr(line, "startsWith") else (not line or line.startswith("#")):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in env:
                            env[k] = v
    return env

def execute_remote(commands):
    env = load_env_vars()
    host = os.environ.get("SSH_HOST") or env.get("SSH_HOST", "192.168.1.6")
    port = int(os.environ.get("SSH_PORT") or env.get("SSH_PORT", "22"))
    user = os.environ.get("SSH_USER") or env.get("SSH_USER", "meksteel")
    password = os.environ.get("SSH_PASSWORD") or env.get("SSH_PASSWORD")
    key_path = os.environ.get("SSH_KEY_PATH") or env.get("SSH_KEY_PATH")

    if not host or not user:
        print("[SSH ERROR] SSH_HOST e SSH_USER devem estar configurados no .env ou nas variáveis de ambiente.")
        sys.exit(1)

    print(f"📡 Conectando via SSH a {user}@{host}:{port}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        connect_kwargs = {
            "hostname": host,
            "port": port,
            "username": user,
            "timeout": 10,
            "allow_agent": True,
            "look_for_keys": True,
            "auth_timeout": 10
        }
        if password:
            connect_kwargs["password"] = password
        if key_path and os.path.exists(os.path.expanduser(key_path)):
            connect_kwargs["key_filename"] = os.path.expanduser(key_path)

        client.connect(**connect_kwargs)
        print("✅ Conectado com sucesso ao servidor Ubuntu!\n")
    except Exception as e:
        print(f"❌ Falha de autenticação/conexão SSH: {e}")
        print("💡 Dica: Verifique se SSH_PASSWORD ou SSH_KEY_PATH está preenchido no seu arquivo .env")
        sys.exit(1)

    for cmd in commands:
        print(f"--------------------------------------------------")
        print(f"💻 EXECUTANDO: {cmd}")
        print(f"--------------------------------------------------")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        if out:
            print(out)
        if err:
            print(f"[STDERR] {err}")

    client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmds = [" ".join(sys.argv[1:])]
    else:
        cmds = [
            "uname -a && uptime",
            "docker ps",
            "cd ~/brasil_caramelo 2>/dev/null || cd ~/Brasil_Caramelo_nostr 2>/dev/null && docker compose ps"
        ]
    execute_remote(cmds)
