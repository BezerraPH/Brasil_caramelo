# Documentação — Brasil Caramelo

| Arquivo | Conteúdo |
|---------|----------|
| [../CONFIGURACAO.md](../CONFIGURACAO.md) | Deploy, Docker, Tailscale, HTTPS, variáveis `.env` |
| [../ROADMAP.md](../ROADMAP.md) | Checklist de tarefas (`[ ]` / `[x]`) — **atualizar ao entregar** |
| [../Versions.txt](../Versions.txt) | Histórico de versões e funcionalidades |
| [../AGENTS.md](../AGENTS.md) | Regras para desenvolvedores e IA |
| [../scripts/README.md](../scripts/README.md) | Scripts de sync, deploy, smoke e auditoria |

## Scripts principais

```bash
# PC — enviar código
git push

# Servidor — atualizar e implantar
bash scripts/sync-from-git.sh
sudo bash scripts/deploy-brasil-caramelo.sh --mode tailscale --full

# Testes (no servidor ou com app no ar)
bash scripts/server-smoke.sh
bash scripts/server-smoke.sh --auth   # com BC_SMOKE_EMAIL no .env
```

## Versão atual

Ver `package.json` e o topo de `Versions.txt`.
