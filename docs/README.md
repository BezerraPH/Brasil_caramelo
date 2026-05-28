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
bash scripts/server-smoke.sh   # inclui upload imagem+vídeo se BC_SMOKE_* no .env
npm run validate:smoke       # valida formato das listas (sem subir app)
```

## Versão atual

Ver `package.json` e o topo de `Versions.txt`.
