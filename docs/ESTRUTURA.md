# Estrutura do projeto — Brasil Caramelo

Referência rápida de pastas (detalhes operacionais em [CONFIGURACAO.md](../CONFIGURACAO.md)).

```
brasil_caramelo/
├── src/
│   ├── app/              # Rotas Next.js (páginas + API)
│   │   ├── (app)/        # Área autenticada (feed, explorar, …)
│   │   └── api/          # REST API
│   ├── components/       # UI React
│   ├── hooks/            # Hooks compartilhados
│   ├── lib/              # Lógica de negócio (explorar-hub.ts, nav.ts…)
│   └── middleware.ts     # Proteção de rotas (sessão)
├── prisma/               # Schema e migrações
├── scripts/              # Deploy, smoke, HTTPS, backup
│   ├── README.md         # Índice dos scripts
│   └── lib/              # Funções shell compartilhadas
├── deploy/               # Nginx, LiveKit, Gitea
├── public/               # PWA, ícones estáticos
├── docs/                 # Índice e esta estrutura
├── CONFIGURACAO.md       # Tutorial único do servidor
├── Versions.txt          # Changelog e visão do produto
└── docker-compose.yml    # Stack completa
```

**Não versionar em produção:** `example_template/` (HTML de referência), `.env`, backups `*.bak.*`.
