# 🎬 Netflix Clone — Backend Setup

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm 9+

## 🚀 Setup Inicial

### 1. Instalação de Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
# Edite .env com seus valores:
# - DATABASE_URL: seu PostgreSQL
# - REDIS_URL: seu Redis
# - JWT_ACCESS_SECRET: string aleatória de 32+ chars
# - JWT_REFRESH_SECRET: string aleatória diferente
# - TMDB_BEARER_TOKEN: seu token da TMDB
# - TMDB_API_KEY: sua chave da TMDB
```

### 3. Iniciar Banco de Dados (Docker)

```bash
docker-compose up -d
```

Isso inicia:

- PostgreSQL (porta 5432)
- Redis (porta 6379)

### 4. Executar Migrations

```bash
npm run prisma:migrate
```

### 5. Executar Testes (antes de qualquer implementação)

```bash
npm test
```

Todos os 70 testes devem falhar (RED state).

---

## 📚 Estrutura de Assets

```
backend/
├── src/
│   ├── domain/              # Lógica de negócio pura
│   │   ├── entities/        # User, Profile, WatchlistItem
│   │   ├── errors/          # Custom domain errors
│   │   └── repositories/    # Interface de repositórios
│   ├── application/         # Casos de uso / orquestração
│   │   ├── usecases/        # RegisterUser, Login, AddToWatchlist, etc.
│   │   └── services/        # TokenService, CacheService, etc.
│   ├── infrastructure/      # Implementações técnicas
│   │   ├── database/        # Prisma client, migrations
│   │   ├── cache/           # Redis adapter
│   │   └── external/tmdb/   # TMDB HTTP client
│   └── interfaces/          # Controllers, routes, middlewares
│       └── http/
├── tests/
│   ├── unit/                # Testes unitários (sem I/O)
│   ├── integration/         # Testes com dependências reais
│   ├── e2e/                 # Testes de ponta a ponta
│   └── helpers/             # Factories, mocks
├── prisma/
│   ├── schema.prisma        # Schema do banco
│   └── migrations/          # Migration files
└── .env.example             # Template de variáveis
```

---

## 🧪 Testes

### Rodar todos os testes

```bash
npm test
```

### Rodar apenas testes unitários

```bash
npm run test:unit
```

### Rodar apenas testes de integração

```bash
npm run test:integration
```

### Rodar com coverage

```bash
npm test -- --coverage
```

### Watch mode (rerun on file change)

```bash
npm run test:watch
```

### Coverage mínimo exigido

- Domain: 95%
- Application: 85%
- Infrastructure: 70%

---

## 🔧 Desenvolvimento

### Dev server (com hot reload)

```bash
npm run dev
```

Server roda em `http://localhost:3001`

### Lint e format

```bash
npm run lint
npm run format
```

### Type check

```bash
npm run typecheck
```

---

## 📦 Build para Produção

```bash
npm run build
npm start
```

---

## 🗄️ Banco de Dados

### Ver dados com Prisma Studio

```bash
npm run prisma:studio
```

Acessa `http://localhost:5555`

### Resetar banco (dev only)

```bash
npm run prisma:reset
```

⚠️ **NUNCA em produção!**

---

## 🚀 Deploy

### Backend (Railway.app)

1. Fazer push para GitHub
2. conectar repositório ao Railway
3. Definir variáveis de ambiente em Railway
4. Deploy automático ativa

Database (Railway PostgreSQL addon) e Redis precisam ser configurados.

### Frontend (Vercel)

1. Frontend deve apontar para backend URL
2. Variável de ambiente: `VITE_API_BASE_URL=https://backend-railway-url.com`

---

## 💡 Convenções

- **Commits:** Use Conventional Commits (`feat:`, `fix:`, `test:`, etc.)
- **Branches:** Feature branches de `develop`, nunca de `main`
- **Pull Requests:** Sempre abrir PR, nunca fazer merge direto
- **Testes:** Nenhum commit sem testes passando

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

- Verificar se docker-compose está rodando: `docker ps`
- Verificar DATABASE_URL em .env
- Rodar migration: `npm run prisma:migrate`

### Erro: "Redis connection refused"

- Verificar Redis rodando: `redis-cli ping → PONG`
- Verificar REDIS_URL em .env (deve ser `redis://localhost:6379`)

### Testes falhando com "module not found"

- Executar `npm install` novamente
- Limpar cache: `npm cache clean --force`
- Remover node_modules: `rm -rf node_modules && npm install`

---

## 📖 Documentação

- [PROJECT_NETFLIX_CLONE.md](../PROJECT_NETFLIX_CLONE.md) — Briefing completo
- [Base/01_ARCHITECT.md](../Base/01_ARCHITECT.md) — Decisões de arquitetura
- [BEHAVIORS.md](../BEHAVIORS.md) — Comportamentos mapeados
- [tests/TEST_INDEX.md](tests/TEST_INDEX.md) — Índice de testes
- [QA_COVERAGE_VALIDATION.md](QA_COVERAGE_VALIDATION.md) — Validação de cobertura

---

## 🤝 Contribuindo

1. Branch novo a partir de `develop`
2. Escrever testes (TDD)
3. Implementar código
4. Rodar `npm test` (todos devem passar)
5. Abrir PR com detalhes
6. Aguardar review
7. Merge em `develop` após aprovação

---

## 📄 Licença

MIT
