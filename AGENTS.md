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
