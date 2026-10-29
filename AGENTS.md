<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Roadmap e versões (obrigatório)

Antes de implementar backlog ou ao **concluir** qualquer entrega:

1. Consulte **`ROADMAP.md`** — fonte única de tarefas (`[ ]` / `[x]`, IDs `R-xxx`).
2. Ao concluir um item: marque `[x]` em `ROADMAP.md` (data + versão, ex. `v2.19.0`).
3. Atualize **`Versions.txt`**: topo, seção **ROADMAP (resumo)**, **FUNCIONALIDADES ATUAIS**, **HISTÓRICO DE VERSÕES**.
4. Features de produto: incremente **`package.json`** e **`src/lib/app-version.ts`**.
5. Se o item estiver em “Em breve” na app: **`src/components/RoadmapPanel.tsx`**.

Não marque roadmap como feito sem o código/deploy correspondente.

## Protocolo Obrigatório de Deploy Contínuo (a cada atualização)

A cada atualização ou entrega concluída, o assistente/desenvolvedor DEVE OBRIGATORIAMENTE executar os seguintes 5 passos:

1. **Upar para GitHub e Gitea:**
   - Commit local com descrição clara.
   - Push para Gitea (`nostr`: `http://192.168.1.6:3001/meksteel/Brasil_Caramelo_nostr.git`).
   - Push para GitHub (`origin`: `https://github.com/BezerraPH/Brasil_caramelo.git`).
2. **Atualizar os arquivos no servidor Ubuntu:**
   - Conectar via SSH (`meksteel@192.168.1.6:22`).
   - Sincronizar em `~/brasil_caramelo` via `git pull origin main`.
3. **Build e Up do container no servidor:**
   - Executar `docker compose up -d --build` para subir a stack com a nova versão.
4. **Testes de integridade:**
   - Validar `docker compose ps` (verificar se `brasil_caramelo-app-1` está `Up` e `db` `healthy`).
   - Executar teste de fumaça HTTP (`curl -s -I http://localhost:3000`).
5. **Informar o usuário:**
   - Relatar o status do deploy, links ativos (local e Tailscale) e confirmação dos testes.

*(Nota: o comando `npm run deploy:server` ou `python nao_essenciais/scripts/deploy_to_server.py` já automatiza o ciclo completo).*
