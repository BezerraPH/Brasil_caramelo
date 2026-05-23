#!/bin/bash
# Auditoria completa do servidor — sistema, Docker, HTTPS/nginx, portas, logs, smoke tests.
#
# Uso:
#   ./scripts/server-audit.sh              # relatório completo
#   ./scripts/server-audit.sh --quick      # sem smoke tests nem logs longos
#   ./scripts/server-audit.sh --smoke-only # só smoke tests
#   ./scripts/server-audit.sh > relatorio.txt
#
# Alias legado: ./scripts/server-report.sh
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/server-common.sh
source "$ROOT/scripts/lib/server-common.sh"

QUICK=0
SMOKE_ONLY=0
WARNINGS=0
FAILURES=0

for arg in "$@"; do
  case "$arg" in
    --quick) QUICK=1 ;;
    --smoke-only) SMOKE_ONLY=1 ;;
    -h|--help)
      echo "Uso: $0 [--quick] [--smoke-only]"
      exit 0
      ;;
  esac
done

bc_warn() { printf '  [WARN] %s\n' "$*"; WARNINGS=$((WARNINGS + 1)); }
bc_fail() { printf '  [FAIL] %s\n' "$*"; FAILURES=$((FAILURES + 1)); }
bc_ok() { printf '  [OK]   %s\n' "$*"; }

bc_load_host

if [ "$SMOKE_ONLY" -eq 1 ]; then
  bc_section "Smoke tests"
  if [ -x scripts/server-smoke.sh ]; then
    scripts/server-smoke.sh || exit 1
  else
    bash scripts/server-smoke.sh || exit 1
  fi
  exit 0
fi

printf 'BRASIL CARAMELO — AUDITORIA DO SERVIDOR (server-audit.sh)\n'
printf 'Gerado em: %s\n' "$(date -Iseconds 2>/dev/null || date)"
printf 'Diretório: %s\n' "$ROOT"
printf 'Hostname: %s\n' "$(hostname 2>/dev/null || echo '?')"

# ── 1. Sistema ─────────────────────────────────────────────────────────────
bc_section "1. Sistema e rede"
bc_run hostname
bc_run uname -a
if [ -f /etc/os-release ]; then
  bc_run bash -c 'grep PRETTY /etc/os-release | cut -d= -f2 | tr -d "\""'
fi
bc_run whoami
bc_run pwd
bc_run df -h /
bc_run free -h 2>/dev/null || true

printf '\nResolução DNS do BC_HOST (%s):\n' "$BC_HOST"
if bc_host_resolves "$BC_HOST"; then
  bc_ok "${BC_HOST} resolve neste servidor ($(getent hosts "$BC_HOST" | awk '{print $1}'))"
else
  bc_warn "${BC_HOST} NÃO resolve neste servidor — normal se só o PC tiver /etc/hosts"
  printf '         Corrija: sudo bash -c "echo %s %s >> /etc/hosts"\n' "$BC_LAN_IP" "$BC_HOST"
  printf '         ou: bash scripts/setup-https-lan.sh (adiciona hosts automaticamente)\n'
fi
if ! bc_host_resolves "$BC_LAN_IP"; then
  bc_warn "IP LAN ${BC_LAN_IP} não aparece em getent (verifique rede)"
fi

# ── 2. Git ───────────────────────────────────────────────────────────────────
bc_section "2. Git"
if command -v git >/dev/null 2>&1; then
  bc_run git remote -v
  bc_run git branch --show-current
  bc_run git log -1 --oneline
  bc_run git status -sb
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    printf '\nAlterações locais:\n'
    git status --porcelain
  else
    printf '\nWorking tree limpo.\n'
  fi
else
  bc_fail "git não instalado"
fi

# ── 3. .env ──────────────────────────────────────────────────────────────────
bc_section "3. Variáveis .env (sem segredos)"
printf 'BC_HOST=%s\n' "$(bc_safe_env BC_HOST)"
printf 'APP_URL=%s\n' "$(bc_safe_env APP_URL)"
printf 'NEXT_PUBLIC_APP_URL=%s\n' "$(bc_safe_env NEXT_PUBLIC_APP_URL)"
printf 'COOKIE_SECURE=%s\n' "$(bc_safe_env COOKIE_SECURE)"
printf 'NEXT_PUBLIC_LIVEKIT_URL=%s\n' "$(bc_safe_env NEXT_PUBLIC_LIVEKIT_URL)"
printf 'NEXT_PUBLIC_PUSHER_HOST=%s\n' "$(bc_safe_env NEXT_PUBLIC_PUSHER_HOST)"
printf 'NEXT_PUBLIC_PUSHER_PORT=%s\n' "$(bc_safe_env NEXT_PUBLIC_PUSHER_PORT)"
printf 'NEXT_PUBLIC_PUSHER_USE_TLS=%s\n' "$(bc_safe_env NEXT_PUBLIC_PUSHER_USE_TLS)"
printf 'NEXT_PUBLIC_TURN_URL=%s\n' "$(bc_safe_env NEXT_PUBLIC_TURN_URL)"
printf 'UPLOAD_DIR=%s\n' "$(bc_safe_env UPLOAD_DIR)"
printf 'OLLAMA_BASE_URL=%s\n' "$(bc_safe_env OLLAMA_BASE_URL)"
printf 'Conta smoke: '
grep -qE '^BC_SMOKE_EMAIL=.+' .env 2>/dev/null && grep '^BC_SMOKE_EMAIL=' .env | cut -d= -f2- || echo não configurada

if grep -qE '^COOKIE_SECURE=true' .env 2>/dev/null; then
  CS_VAL=true
else
  CS_VAL=false
fi
if [ "$CS_VAL" = true ] && [[ "$BASE_HTTPS" != https://* ]]; then
  bc_warn "COOKIE_SECURE=true mas APP_URL não é https://"
fi
if [ "$CS_VAL" = false ] && [[ "$(bc_safe_env APP_URL)" == https://* ]]; then
  bc_warn "HTTPS no APP_URL mas COOKIE_SECURE não é true — login pode falhar"
fi

printf '\nModo de acesso detectado:\n'
APP_URL_RAW="$(bc_safe_env_raw APP_URL)"
if [[ "$APP_URL_RAW" == *".ts.net"* ]]; then
  bc_ok "Tailscale (${BC_HOST}) — ideal para celular com app Tailscale"
elif [[ "$APP_URL_RAW" == https://* ]]; then
  bc_ok "HTTPS LAN (${BC_HOST}) — instale rootCA no celular se necessário"
else
  bc_warn "HTTP LAN — microfone, Latidos e chamadas no celular exigem HTTPS"
  printf '         Recomendado: sudo bash scripts/setup-tailscale.sh --serve\n'
  printf '         Alternativa: sudo bash scripts/setup-https-lan.sh\n'
fi
if command -v tailscale >/dev/null 2>&1; then
  if tailscale serve status 2>/dev/null | grep -q 'https://'; then
    bc_ok "tailscale serve ativo"
  elif [[ "$APP_URL_RAW" == *".ts.net"* ]]; then
    bc_warn "BC_HOST é .ts.net mas tailscale serve não parece ativo — rode setup-tailscale.sh --serve"
  fi
fi

# ── 4. Docker ────────────────────────────────────────────────────────────────
bc_section "4. Docker Compose"
if command -v docker >/dev/null 2>&1; then
  bc_run docker --version
  bc_run docker compose version
  bc_run docker compose ps -a
  for svc in app db soketi livekit coturn; do
    if docker compose ps --status running "$svc" 2>/dev/null | grep -q .; then
      bc_ok "Container $svc está Running"
    else
      bc_fail "Container $svc NÃO está Running"
    fi
  done
else
  bc_fail "docker não instalado"
fi

# ── 5. Portas ─────────────────────────────────────────────────────────────────
bc_section "5. Portas em escuta (stack + nginx)"
for port in 80 443 6443 7443 3000 5432 6001 7880 7881 3478; do
  printf '\n── Porta %s ──\n' "$port"
  listeners="$(bc_port_listener "$port")"
  if [ -n "$listeners" ]; then
    echo "$listeners"
  else
    printf '  (nada escutando)\n'
  fi
done

if bc_port_in_use 80 && ! systemctl is-active nginx >/dev/null 2>&1; then
  bc_warn "Porta 80 ocupada por outro processo — nginx não pode iniciar (veja seção 6)"
  printf '  Dica: sudo ss -tlnp | grep :80\n'
  printf '  Ou rode setup-https-lan.sh (pula redirect :80 se ocupada)\n'
fi

# ── 6. nginx + HTTPS + mkcert ───────────────────────────────────────────────
bc_section "6. nginx, mkcert e HTTPS"
if command -v nginx >/dev/null 2>&1; then
  printf 'nginx instalado: sim\n'
  if systemctl is-active nginx >/dev/null 2>&1; then
    bc_ok "nginx.service está active"
  else
    bc_fail "nginx.service NÃO está active (systemctl start nginx)"
    if [ -f /var/log/nginx/error.log ]; then
      printf '\nÚltimas linhas error.log:\n'
      sudo tail -15 /var/log/nginx/error.log 2>/dev/null || tail -15 /var/log/nginx/error.log 2>/dev/null || true
    fi
  fi
  if sudo nginx -t 2>&1; then
    bc_ok "nginx -t (sintaxe OK)"
  else
    bc_fail "nginx -t falhou"
  fi
  if [ -f /etc/nginx/sites-enabled/brasilcaramelo ]; then
    bc_ok "Site brasilcaramelo em sites-enabled"
  else
    bc_warn "Site brasilcaramelo ausente — rode: bash scripts/setup-https-lan.sh"
  fi
else
  bc_warn "nginx não instalado — HTTPS LAN requer nginx"
fi

if command -v mkcert >/dev/null 2>&1; then
  bc_ok "mkcert instalado"
  if [ -f "$ROOT/brasilcaramelo.com+1.pem" ]; then
    bc_ok "Certificado local brasilcaramelo.com+1.pem"
  else
    bc_warn "Rode: mkcert brasilcaramelo.com 192.168.1.4"
  fi
  if [ -f /etc/ssl/certs/brasilcaramelo.pem ]; then
    bc_ok "Cert em /etc/ssl/certs/brasilcaramelo.pem"
  else
    bc_warn "Cert não copiado — setup-https-lan.sh faz isso"
  fi
  if command -v mkcert >/dev/null 2>&1; then
    printf 'CA root (instale no PC/celular): %s/rootCA.pem\n' "$(mkcert -CAROOT 2>/dev/null || echo '?')"
  fi
else
  bc_warn "mkcert não instalado"
fi

printf '\n── Testes HTTP/HTTPS ──\n'
bc_probe_tcp "127.0.0.1" "$APP_PORT" "App Docker :3000" || true
bc_probe_tcp "$BC_LAN_IP" "$APP_PORT" "App via IP LAN" || true
if bc_host_resolves "$BC_HOST"; then
  bc_probe_tcp "$BC_HOST" "$APP_PORT" "App via hostname" || true
else
  printf '  [SKIP] %-32s %s não resolve neste host\n' "App via BC_HOST" "$BC_HOST"
fi

if systemctl is-active nginx >/dev/null 2>&1; then
  code="$(curl -sS -o /dev/null -w '%{http_code}' -m 8 -k 'https://127.0.0.1/' -H 'Host: brasilcaramelo.com' 2>/dev/null || echo 000)"
  if [ "$code" != "000" ] && [ "$code" -lt 500 ]; then
    bc_ok "HTTPS :443 (Host brasilcaramelo.com) → HTTP $code"
  else
    bc_fail "HTTPS :443 não respondeu (código $code)"
  fi
  bc_probe_tcp "127.0.0.1" 443 "nginx :443" || true
  bc_probe_tcp "127.0.0.1" 7443 "LiveKit WSS :7443" || true
  bc_probe_tcp "127.0.0.1" 6443 "Soketi WSS :6443" || true
else
  bc_fail "HTTPS :443 indisponível — nginx parado"
fi

# ── 7. App API ───────────────────────────────────────────────────────────────
bc_section "7. API — versão e saúde"
bc_load_smoke_urls
printf 'Base dos testes: %s %s\n' "$SMOKE_BASE" "$SMOKE_NOTE"
bc_run bc_curl_smoke -sS -m 10 "${SMOKE_BASE}/api/version"
printf '\n'
bc_run bc_curl_smoke -sS -m 10 "${SMOKE_BASE}/api/health"
printf '\n'
if [[ "$BASE_HTTPS" == https://* ]] && [ "$SMOKE_BASE" != "${BASE_HTTPS%/}" ]; then
  printf '\nVia APP_URL (%s):\n' "$BASE_HTTPS"
  bc_run bc_curl_smoke -sS -m 10 "${BASE_HTTPS%/}/api/version"
  printf '\n'
fi

# ── 8. Prisma ────────────────────────────────────────────────────────────────
bc_section "8. Prisma / banco"
if command -v docker >/dev/null 2>&1 && docker compose ps app 2>/dev/null | grep -q Up; then
  bc_run docker compose exec -T app npx prisma migrate status
else
  bc_fail "Container app não Up"
fi

# ── 9. Uploads / backup ──────────────────────────────────────────────────────
bc_section "9. Uploads e backup"
if command -v docker >/dev/null 2>&1 && docker compose ps app 2>/dev/null | grep -q Up; then
  docker compose exec -T app sh -c 'du -sh /app/data/uploads 2>/dev/null; find /app/data/uploads -type f 2>/dev/null | wc -l' 2>/dev/null || true
fi
[ -x scripts/backup-matilha.sh ] && bc_ok "backup-matilha.sh executável" || bc_warn "backup-matilha.sh ausente ou sem +x"

# ── 10. Logs ─────────────────────────────────────────────────────────────────
if [ "$QUICK" -eq 0 ]; then
  bc_section "10. Logs recentes (últimas 20 linhas)"
  for svc in app livekit soketi coturn nginx; do
    printf '\n── docker compose logs %s ──\n' "$svc"
    if [ "$svc" = nginx ]; then
      sudo journalctl -u nginx -n 15 --no-pager 2>/dev/null || docker compose logs "$svc" --tail 15 2>&1 || true
    elif command -v docker >/dev/null 2>&1; then
      docker compose logs "$svc" --tail 20 2>&1 || printf '(serviço %s ausente)\n' "$svc"
    fi
  done
fi

# ── 11. Smoke tests ──────────────────────────────────────────────────────────
SMOKE_EXIT=0
if [ "$QUICK" -eq 0 ]; then
  bc_section "11. Smoke tests (funcionalidades HTTP)"
  if [ -x scripts/server-smoke.sh ]; then
    scripts/server-smoke.sh || SMOKE_EXIT=$?
  elif [ -f scripts/server-smoke.sh ]; then
    bash scripts/server-smoke.sh || SMOKE_EXIT=$?
  else
    bc_fail "scripts/server-smoke.sh não encontrado"
    SMOKE_EXIT=1
  fi
fi

# ── 12. Recomendações ────────────────────────────────────────────────────────
bc_section "12. Recomendações"
APP_URL_RAW="$(bc_safe_env_raw APP_URL)"
if [[ "$APP_URL_RAW" == *".ts.net"* ]]; then
  printf '• Modo Tailscale ativo — celular: app Tailscale + %s\n' "${APP_URL_RAW:-https://SEU_HOST.ts.net}"
  printf '• Latidos/chamadas: HTTPS via tailscale serve (já configurado)\n'
  printf '• Cron horário: scripts/cron-maintenance.example\n'
  printf '• Git limpo: bash scripts/sync-from-git.sh (se scripts/ modificados localmente)\n'
elif [[ "$APP_URL_RAW" == https://* ]]; then
  printf '• Modo HTTPS LAN — instale rootCA.pem no celular se o navegador avisar\n'
  printf '• PC: hosts → %s brasilcaramelo.com\n' "$BC_LAN_IP"
  if ! systemctl is-active nginx >/dev/null 2>&1; then
    printf '• nginx parado — sudo systemctl start nginx\n'
  fi
else
  printf '• Modo HTTP — microfone/Latidos no celular exigem HTTPS\n'
  printf '• Recomendado: sudo bash scripts/setup-tailscale.sh --serve\n'
  printf '• Alternativa: sudo bash scripts/setup-https-lan.sh\n'
fi
printf '• Diagnóstico completo: bash scripts/server-audit.sh\n'
printf '• Deploy: bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full\n'

bc_hr
printf 'Resumo auditoria: WARN=%s  FAIL=%s' "$WARNINGS" "$FAILURES"
if [ "$QUICK" -eq 0 ]; then
  printf '  |  smoke_exit=%s' "$SMOKE_EXIT"
fi
printf '\n'

if [ "$FAILURES" -gt 0 ] || [ "${SMOKE_EXIT:-0}" -ne 0 ]; then
  if [ "${SMOKE_EXIT:-0}" -ne 0 ] && [ "$FAILURES" -eq 0 ]; then
    printf 'Status: smoke tests falharam — se o servidor não resolve %s, rode:\n' "$BC_HOST"
    printf '  bash scripts/setup-https-lan.sh   # adiciona /etc/hosts\n'
    printf '  bash scripts/server-audit.sh\n'
  else
    printf 'Status: ATENÇÃO — corrija itens [FAIL] acima.\n'
  fi
  exit 1
fi
printf 'Status: OK (revise [WARN] se houver).\n'
exit 0
