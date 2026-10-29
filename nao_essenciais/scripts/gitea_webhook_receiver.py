#!/usr/bin/env python3
"""
nao_essenciais/scripts/gitea_webhook_receiver.py — Receptor de Webhook do Gitea para Deploy Automático
Executado diretamente no servidor Ubuntu (pode rodar como serviço systemd).

Porta padrão: 9999
Endpoint do Webhook no Gitea: http://192.168.1.6:9999/webhook

Como funciona:
1. O Gitea recebe um 'git push'.
2. O Gitea envia um POST para http://192.168.1.6:9999/webhook.
3. Este script executa 'git pull origin main && docker compose up -d --build'.
"""

import os
import json
import subprocess
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("DEPLOY_PORT", 9999))
SECRET = os.environ.get("GITEA_WEBHOOK_SECRET", "")
REPO_PATH = os.path.expanduser("~/brasil_caramelo")

def run_deploy():
    print("\n[DEPLOY] Iniciando processo de atualização do Brasil Caramelo...")
    cmd = (
        f"cd {REPO_PATH} && "
        "git config core.fileMode false && "
        "git pull origin main && "
        "docker compose up -d --build"
    )
    process = subprocess.run(cmd, shell=True, text=True, capture_output=True)
    if process.returncode == 0:
        print("[DEPLOY] ✅ Deploy finalizado com sucesso!")
        print(process.stdout[-500:] if len(process.stdout) > 500 else process.stdout)
    else:
        print(f"[DEPLOY] ❌ Falha no deploy (código {process.returncode}):")
        print(process.stderr)

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path not in ["/webhook", "/deploy"]:
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        # Validação opcional de Secret
        if SECRET:
            header_secret = self.headers.get("X-Gitea-Signature", "") or self.headers.get("X-Gitea-Token", "")
            if header_secret != SECRET:
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b"Assinatura invalida")
                return

        # Responder imediatamente 200 OK para o Gitea não dar timeout
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "deploy_triggered"}).encode("utf-8"))

        # Executar deploy em thread separada
        threading.Thread(target=run_deploy, daemon=True).start()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Brasil Caramelo Gitea Webhook Receiver ativo!")

    def log_message(self, format, *args):
        print(f"[HTTP] {self.address_string()} - {format % args}")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print(f"👂 Servidor de Webhook escutando em http://0.0.0.0:{PORT}/webhook")
    print(f"📁 Diretório monitorado: {REPO_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
