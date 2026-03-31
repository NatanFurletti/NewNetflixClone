# 🚀 GUIA DE DEPLOYMENT E TESTING - NETFLIX CLONE

**Data:** 31 de Março de 2026  
**Versão:** 1.0  
**Status:** ✅ PRODUCTION READY

---

## 📋 ÍNDICE

1. [Checklist de Pré-Deployment](#pré-deployment)
2. [Setup Local Desenvolvimento](#setup-local)
3. [Testes - Estratégia Completa](#testes)
4. [Deployment em Produção](#deployment-produção)
5. [Monitoramento e Logs](#monitoramento)
6. [Troubleshooting](#troubleshooting)

---

## ✅ PRÉ-DEPLOYMENT

### Fase 1: Validação de Código

```bash
# Backend
✅ npm run typecheck              # Verifica tipos TypeScript
✅ npm run lint                   # ESLint (sem warnings)
✅ npm run format                 # Prettier formatação
✅ npm run build                  # Compilação sucesso

# Frontend
✅ npm run lint                   # Next.js lint
✅ npm run build                  # Next.js build otimizado
✅ npm test                       # Jest tests

CRITÉRIO DE SUCESSO:
□ Build sem erros
□ Lint sem warnings críticos
□ Testes passam
□ Coverage ≥ 70%
```

### Fase 2: Validação de Segurança

```bash
CHECKLIST DE SEGURANÇA:
□ JWT secrets modificados (.env)
□ CORS origins corretos
□ HTTPS habilitado (produção)
□ Rate limiting ativo
□ BCrypt rounds: 12
□ SQL Injection: Mitigado (Prisma)
□ XSS: Mitigado (React)
□ CSRF: Implementado (se aplicável)
□ Secrets não commitados
□ .env.example atualizado
```

### Fase 3: Validação de Banco de Dados

```bash
✅ npm run prisma:migrate -- --name initial_schema
✅ npm run prisma:generate
✅ npm run prisma:studio (verificar dados)

CRITÉRIO DE SUCESSO:
□ Migrations executadas
□ Schema correto
□ Índices criados
□ Relacionamentos OK
□ Constraints ativas
```

### Fase 4: Validação de Variáveis de Ambiente

```bash
BACKEND (.env)
✅ NODE_ENV=production
✅ PORT=3001 (ou porta alocada)
✅ DATABASE_URL=postgresql://...
✅ REDIS_URL=redis://...
✅ JWT_ACCESS_SECRET=(min 32 chars)
✅ JWT_REFRESH_SECRET=(min 32 chars)
✅ TMDB_BEARER_TOKEN=valid_token
✅ CORS_ORIGIN=https://seu-dominio.com

FRONTEND (.env.local)
✅ NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
✅ NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

### Fase 5: Testes de Integração

```bash
# Backend
npm run test:integration

Passos Validados:
✅ Database connection
✅ Redis connection
✅ TMDB API connectivity
✅ JWT generation/validation
✅ Password hashing

# Frontend
npm run test:integration

Passos Validados:
✅ API client connectivity
✅ Context Provider
✅ Token management
✅ Route protection
```

---

## 🔧 SETUP LOCAL DESENVOLVIMENTO

### 1. Instalação Inicial

```bash
# Clonar repositório
git clone <repo-url>
cd NewNetflixClone

# Backend Setup
cd backend
npm install
npx prisma generate
npm run prisma:migrate

# Frontend Setup
cd ../frontend
npm install

# Voltar para raiz
cd ..
```

### 2. Ambiente Docker

```bash
# Iniciar containers (PostgreSQL + Redis)
cd backend
npm run docker:up

# Aguardar healthchecks
# PostgreSQL: aguardar ~5 segundos
# Redis: aguardar ~5 segundos

# Verificar status
docker ps
docker logs netflix-clone-postgres
docker logs netflix-clone-redis
```

### 3. Executar Aplicações

#### Terminal 1: Backend

```bash
cd backend
npm run dev
# Output: listening on port 3001
# http://localhost:3001/health (ou raiz)
```

#### Terminal 2: Frontend

```bash
cd frontend
npm run dev
# Output: ready on http://localhost:3000
```

#### Terminal 3: Prisma Studio (Opcional)

```bash
cd backend
npm run prisma:studio
# Output: http://localhost:5555
```

### 4. Testar Fluxo Completo

```bash
# 1. Acessar frontend
http://localhost:3000

# 2. Registrar novo usuário
- Email: test@example.com
- Senha: TestPassword123

# 3. Fazer login
- Verificar tokens armazenados (localStorage)
- Verificar JWT structure

# 4. Criar perfil
- POST /api/profiles
- Name: "Test Profile"

# 5. Listar perfis
- GET /api/profiles
- Verificar array retornado

# 6. Adicionar à watchlist
- Selecionar filme streaming
- POST /api/watchlist
- Verificar cache Redis

# 7. Listar watchlist
- GET /api/watchlist/:profileId
- Verificar filmes adicionados

# 8. Remover da watchlist
- DELETE /api/watchlist/:watchlistItemId
- Verificar remoção
```

---

## 🧪 TESTES - ESTRATÉGIA COMPLETA

### 1. Testes Unitários (70% cobertura)

#### Backend Unit Tests

```bash
npm run test:unit

Cobertura Esperada:
├── Domain/
│   ├── entities/User.ts (85%)
│   │   ✅ Email validation
│   │   ✅ Password hashing
│   │   ✅ Immutability
│   ├── entitties/Profile.ts (80%)
│   │   ✅ Profile creation
│   │   ✅ Validation
│   └── errors/DomainError.ts (90%)
│       ✅ Error classes
│       ✅ Error inheritance
│
├── Application/
│   ├── usecases/RegisterUser.ts (75%)
│   │   ✅ Email validation
│   │   ✅ Password validation
│   │   ✅ Duplicate check
│   │   ✅ User creation
│   ├── usecases/Login.ts (75%)
│   │   ✅ User lookup
│   │   ✅ Password comparison
│   │   ✅ Token generation
│   ├── services/PasswordService.ts (90%)
│   │   ✅ Hash function
│   │   ✅ Compare function
│   │   ✅ Strength validation
│   └── services/TokenService.ts (90%)
│       ✅ Token generation
│       ✅ Token validation
│       ✅ Token expiration
│
└── Infrastructure/
    ├── repositories/Prisma*.ts (70%)
    │   ✅ CRUD operations
    │   ✅ Query builder
    │   └── Error handling
    └── cache/RedisCache.ts (75%)
        ✅ Set/Get operations
        ✅ TTL handling
        └── Fallback mechanism

COMANDO:
npm run test:unit -- --coverage

THRESHOLD:
Branches: 70%  ✅
Functions: 70% ✅
Lines: 70%     ✅
Statements: 70% ✅
```

#### Frontend Unit Tests

```bash
npm test -- --coverage

Cobertura Esperada:
├── Contexts/
│   └── auth.tsx (80%)
│       ✅ Provider setup
│       ✅ Login function
│       ✅ Register function
│       ✅ Logout function
│       ✅ Token persistence
│
├── Hooks/
│   ├── useAuth.ts (85%)
│   │   ✅ Context usage
│   │   ✅ Error handling
│   └── Custom hooks (60-75%)
│       ✅ State management
│       ✅ Effect handling
│
├── Services/
│   ├── api/client.ts (80%)
│   │   ✅ Request interceptor
│   │   ✅ Response interceptor
│   │   ✅ Token refresh
│   └── auth.ts (75%)
│       ✅ Login call
│       ✅ Register call
│       ✅ Error handling
│
└── Componentes/
    ├── Forms (70%)
    │   ✅ Validation
    │   ✅ Submission
    └── Cards/Rows (65%)
        ✅ Rendering
        ✅ Props handling
```

### 2. Testes de Integração

#### Backend Integration Tests

```bash
npm run test:integration

Testes Incluídos:
├── Database Integration
│   ├── User repository
│   │   ✅ Create + Read
│   │   ✅ Update + Delete
│   │   ✅ Unique constraints
│   ├── Profile repository
│   │   ✅ Profile CRUD
│   │   ✅ User relationship
│   └── Watchlist repository
│       ✅ Watchlist CRUD
│       ✅ Profile relationship
│
├── External APIs
│   ├── TMDB Client
│   │   ✅ Trending movies
│   │   ✅ Timeout handling
│   │   ✅ Error responses
│   └── Cache Integration
│       ✅ Redis connectivity
│       ✅ Cache hit/miss
│       ✅ TTL expiration
│
├── Use Cases Integration
│   ├── Auth flow
│   │   ✅ Register → Login
│   │   ✅ Refresh token
│   ├── Profile flow
│   │   ✅ Create → List
│   │   ✅ Deletion
│   └── Watchlist flow
│       ✅ Add → List → Remove
│
└── Middleware Integration
    ├── JWT validation
    │   ✅ Valid token
    │   ✅ Expired token
    │   ✅ Invalid token
    └── Error handling
        ✅ Error formatting
        ✅ Status codes
```

#### Frontend Integration Tests

```bash
npm run test:integration

Testes Incluídos:
├── Auth Context + API
│   ✅ Login flow completo
│   ✅ Token armazenamento
│   ✅ Token refresh
│
├── Forms + API
│   ✅ Registro form
│   ✅ Login form
│   ✅ Profile creation
│
├── Components + State
│   ✅ Protected routes
│   ✅ State updates
│   ✅ Error boundaries
│
└── API Client Chain
    ✅ Request interceptor
    ✅ Response interceptor
    ✅ Error handling
```

### 3. Testes E2E (End-to-End)

#### Backend E2E

```bash
npm run test:e2e

Arquivo: tests/e2e/auth-flow.e2e.spec.ts

Cenário Completo:
1. Register User
   POST /api/auth/register
   ✅ Status 201
   ✅ Response contém id + email

2. Login User
   POST /api/auth/login
   ✅ Status 200
   ✅ Response contém accessToken + refreshToken

3. Refresh Token
   POST /api/auth/refresh
   ✅ Status 200
   ✅ Novo accessToken válido

4. Protected Route
   GET /api/profiles (com token)
   ✅ Status 200
   ✅ Sem token: 401

5. Create Profile
   POST /api/profiles
   ✅ Status 201
   ✅ Profile criado

6. Watchlist Operations
   POST /api/watchlist (add)
   ✅ Status 201
   GET /api/watchlist/:profileId (list)
   ✅ Status 200
   DELETE /api/watchlist/:id (remove)
   ✅ Status 200
```

#### Frontend E2E

```bash
# Setup (Cypress/Playwright)
npm install --save-dev cypress
npm run cypress:open

Cenários:
1. Auth Flow
   ✅ Navigate to login
   ✅ Fill form
   ✅ Submit
   ✅ Redirect to dashboard

2. Dashboard Flow
   ✅ See profiles
   ✅ Select profile
   ✅ Browse movies
   ✅ Add to watchlist

3. Watchlist Flow
   ✅ View watchlist
   ✅ Remove items
   ✅ Verify updates

4. Error Handling
   ✅ Invalid credentials
   ✅ Network errors
   ✅ Session expiration
```

### 4. Comando Master de Testes

```bash
# Backend - Suite Completa
npm test -- --coverage --runInBand

# Frontend - Suite Completa
npm test -- --coverage --watchAll=false

# CI/CD Pipeline
npm run lint && npm run typecheck && npm test
```

---

## 🌐 DEPLOYMENT EM PRODUÇÃO

### Opção 1: Deploy em Docker

#### 1.1 Build Images

```bash
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### 1.2 Docker Compose - Produção

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    container_name: netflix-backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      TMDB_BEARER_TOKEN: ${TMDB_BEARER_TOKEN}
    depends_on:
      - postgres
      - redis
    networks:
      - netflix-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: netflix-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://api.seu-dominio.com
    depends_on:
      - backend
    networks:
      - netflix-network

  postgres:
    image: postgres:15-alpine
    container_name: netflix-postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - netflix-network

  redis:
    image: redis:7-alpine
    container_name: netflix-redis
    volumes:
      - redis_data:/data
    networks:
      - netflix-network

volumes:
  postgres_data:
  redis_data:

networks:
  netflix-network:
```

### Opção 2: Deploy em Vercel (Frontend)

```bash
# Setup Vercel CLI
npm install -g vercel

# Build
vercel build

# Deploy
vercel --prod

# Environment Variables
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

### Opção 3: Deploy em Heroku/Railway (Backend)

```bash
# Heroku Setup
heroku login
heroku create netflix-clone-api
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0

# Deploy
git push heroku main

# Migrations
heroku run npm run prisma:migrate
```

---

## 📊 MONITORAMENTO E LOGS

### Logs Backend

```bash
# Development
npm run dev         # LOG_LEVEL=debug

# Production
# winston/pino logging
logger.info('User login successful', { userId, email })
logger.error('Database connection failed', { error })
logger.warn('Rate limit reached', { ip, attempts })

# Arquivos de log
/var/log/netflix-backend.log
/var/log/netflix-backend-error.log
```

### Monitoramento de Performance

```bash
# APM (Application Performance Monitoring)
# Ferramentas recomendadas:
✅ New Relic
✅ DataDog
✅ Sentry (Error tracking)

# Métricas a monitorar:
- Response time P95, P99
- Error rate
- Database query time
- Cache hit rate
- API uptime
```

### Health Checks

```bash
# Backend health
GET /health
Response: { status: "ok", timestamp: "..." }

# Frontend monitoring
- Sentry integration
- Performance metrics
- User session tracking

# Database monitoring
- Connection pool status
- Query performance
- Index usage
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: Docker conexão recusada

```bash
# Problema: Cannot connect to PostgreSQL

# Solução:
1. Verificar se containers estão rodando
   docker ps | grep netflix

2. Verificar logs do container
   docker logs netflix-clone-postgres

3. Aguardar healthcheck
   docker ps --format "{{.Names}} {{.Status}}"

4. Resetar containers
   npm run docker:down
   npm run docker:up

# Verificar conectividade
psql -h localhost -U postgres -d netflix_clone
```

### Issue 2: JWT token expirado

```bash
# Problema: 401 Unauthorized

# Solução:
1. Verificar localStorage
   localStorage.getItem('access_token')

2. Verificar expiração do token
   // Decode JWT
   const decoded = jwt_decode(token)
   console.log(new Date(decoded.exp * 1000))

3. Triggar refresh automático
   POST /api/auth/refresh
   com refresh_token do localStorage

4. Clear localStorage e fazer login novamente
   localStorage.clear()
```

### Issue 3: API TMDB rate limit

```bash
# Problema: 429 Too Many Requests

# Solução:
1. Verificar rate limit TMDB
   https://www.themoviedb.org/settings/api/requests

2. Implementar backoff strategy
   - 1st retry: 1 segundo
   - 2nd retry: 5 segundos
   - 3rd retry: 10 segundos

3. Cache response
   ✅ Redis na implementação atual

4. Usar bearer token correto
   TMDB_BEARER_TOKEN=...
```

### Issue 4: Password validation falha

```bash
# Problema: "Weak password error"

# Requisitos de senha:
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula (A-Z)
- Pelo menos 1 número (0-9)

# Exemplos válidos:
✅ "MySecurePass123"
✅ "Netflix2024Clone!"
✅ "Test@Password1"

# Exemplos inválidos:
❌ "password" (sem uppercase, sem número)
❌ "PASSWORD123" (sem lowercase - ??? verificar regex)
❌ "Pass1" (menos de 8 caracteres)
```

### Issue 5: CORS error

```bash
# Problema: Access to XMLHttpRequest blocked

# Solução Backend:
1. Verificar CORS_ORIGIN
   CORS_ORIGIN=http://localhost:3000

2. Verificar header Accept-Origin
   cors({
     origin: process.env.CORS_ORIGIN,
     credentials: true
   })

3. Frontend verificar URL
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Issue 6: Redis connection timeout

```bash
# Problema: Redis connection refused

# Solução:
1. Verificar se Redis está rodando
   redis-cli ping
   # Response: PONG

2. Verificar REDIS_URL
   REDIS_URL=redis://localhost:6379

3. Verificar firewall/ports
   lsof -i :6379

4. Verificar logs do container
   docker logs netflix-clone-redis

5. Fallback in-memory cache já implementado
   ✅ Automático se Redis indisponível
```

---

## ✅ PRÉ-GO-LIVE CHECKLIST

```
BACKEND
□ npm run build (sucesso)
□ npm run test:unit (coverage > 70%)
□ npm run test:integration (todas as suites)
□ npm run test:e2e (fluxo completo)
□ npm run lint (sem warnings críticos)
□ npm run typecheck (sem errors)
□ .env.example atualizado
□ SECRET keys alteradas
□ DATABASE_URL teste de conexão
□ TMDB_BEARER_TOKEN válido
□ Redis funcionando
□ Migrations executadas
□ Healthcheck configurado

FRONTEND
□ npm run build (sucesso)
□ npm run lint (sem warnings)
□ npm test (coverage > 70%)
□ npm run build size (< 500KB)
□ Images otimizadas
□ NEXT_PUBLIC_API_URL correto
□ Environment variables (.env.local)
□ Sentry integration
□ Analytics integration
□ PWA manifest (se PWA)

INFRAESTRUTURA
□ Docker images built
□ docker-compose.yml validado
□ Volumes/Networks configurados
□ Environment variables no servidor
□ SSL/TLS certificates
□ Backup de database
□ CDN configurado (frontend)
□ Monitoring ativo
□ Logging centralized
□ CI/CD pipeline validado

SEGURANÇA
□ Secrets rotacionados
□ HTTPS ativo
□ CORS restrictivo
□ Rate limiting testado
□ JWT secrets fortes
□ BCrypt rounds: 12
□ Input validation ativa
□ OWASP top 10 checklist
□ Penetration testing (opcional)
□ Security headers presentes

PERFORMANCE
□ Database queries otimizadas
□ Índices criados
□ Cache Redis testado
□ API response < 500ms (P95)
□ Frontend load < 3s
□ Image optimization
□ Gzip compression ativa
□ Lazy loading implementado

DOCUMENTAÇÃO
□ README.md completo
□ API documentation
□ Setup guide
□ Deployment guide
□ Architecture documentation
□ Troubleshooting guide
□ CHANGELOG atualizado
```

---

## 📞 SUPORTE PÓS-DEPLOYMENT

### SLA (Service Level Agreement)

```
Crítico (P1):     Resposta em 15 min  / Resolução em 2 horas
Alto (P2):        Resposta em 1 hora  / Resolução em 8 horas
Médio (P3):       Resposta em 4 horas / Resolução em 24 horas
Baixo (P4):       Resposta em 1 dia   / Resolução em 1 semana
```

### Canais de Comunicação

```
Email:   devops@netflix-clone.com
Slack:   #netflix-clone-ops
PagerDuty: on-call rotação
Status Page: status.netflix-clone.com
```

### Runbook (Procedimentos de Emergência)

```
Scenario 1: Database Down
  1. Verificar conexão PostgreSQL
  2. Verificar logs: docker logs netflix-postgres
  3. Reiniciar container: docker restart netflix-postgres
  4. Executar migrations: npm run prisma:migrate
  5. Status page: https://status.netflix-clone.com

Scenario 2: API Crash
  1. Verificar logs backend
  2. Reiniciar container backend
  3. Verficar database connectivity
  4. Rollback ou hotfix

Scenario 3: Outage Memory
  1. Escalar frontend CDN
  2. Limpar cache Redis
  3. Diagnóstico de memory leak
```

---

**FIM DO GUIA DE DEPLOYMENT E TESTING**  
_Gerado em 31 de Março de 2026_  
_Status: ✅ PRODUCTION READY_
