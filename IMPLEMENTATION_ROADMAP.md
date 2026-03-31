# ⚙️ ENGENHEIRO — Roadmap de Implementação

> Este documento guia a implementação RED → GREEN → REFACTOR do Netflix Clone Backend.
> **Regra de Ouro:** NUNCA altere testes. Se um teste falha, a IMPLEMENTAÇÃO está errada.

---

## 📋 Ordem de Implementação (Dependências Primeiro)

```
1. Domain Layer
   ├── Entidades (User, Profile, WatchlistItem)
   ├── Erro custom (InvalidEmailError, etc.)
   └── Interfaces de repositório

2. Application Layer
   ├── Services (TokenService, PasswordService)
   └── Use Cases (RegisterUser, Login, AddToWatchlist, etc.)

3. Infrastructure Layer
   ├── Database (Prisma migrations, migrations)
   ├── Cache (Redis adapter)
   └── External (TMDB client)

4. Interfaces Layer
   ├── Controllers (AuthController, WatchlistController, etc.)
   ├── Routes (auth.routes, watchlist.routes, etc.)
   └── Middlewares (auth, rate limit, error handler)

5. App & Server
   ├── Express app setup
   ├── Middleware registration
   └── Server startup
```

---

## 🔴🟢♻️ Ciclo Red-Green-Refactor por Layer

### FASE 1: Domain Layer (Entidades + Erros)

#### 1.1 Implementar User Entity

```bash
# 1. Rodar teste (deve falhar)
npm test -- tests/unit/domain/User.spec.ts

# 2. Criar arquivo
# src/domain/entities/User.ts

# 3. Implementar classe User com:
#    - constructor(id, email, passwordHash)
#    - Validação de email (InvalidEmailError)
#    - Nunca expor passwordHash
#    - createdAt, updatedAt timestamps

# 4. Rodar teste novamente (deve passar)
npm test -- tests/unit/domain/User.spec.ts

# 5. Refactor se necessário
```

#### 1.2 Implementar Profile Entity

```bash
npm test -- tests/unit/domain/Profile.spec.ts
# - Profile entity
# - Validação de nome (3-20 chars)
# - isKids flag
# - avatarUrl opcional
```

#### 1.3 Implementar WatchlistItem Entity

```bash
npm test -- tests/unit/domain/WatchlistItem.spec.ts
# - WatchlistItem entity
# - Validação de mediaType (movie | tv)
# - addedAt timestamp
```

#### 1.4 Implementar Domain Errors

```bash
npm test -- tests/unit/domain/DomainErrors.spec.ts
# Criar arquivo: src/domain/errors/index.ts
# Com classes:
#  - class InvalidEmailError extends Error
#  - class WeakPasswordError extends Error
#  - class UserNotFoundError extends Error
#  - class ProfileNotFoundError extends Error
#  - class DuplicateEmailError extends Error
#  - class UnauthorizedError extends Error
#  - class ForbiddenError extends Error
```

---

### FASE 2: Application Layer (Services + Use Cases)

#### 2.1 Serviço de Tokens JWT

```bash
npm test -- tests/unit/application/Login.spec.ts
# Criar arquivo: src/application/services/TokenService.ts
# Com métodos:
#  - generateAccessToken(userId): 15 min expiration
#  - generateRefreshToken(userId): 7 day expiration
#  - validateToken(token): valida assinatura
#  - decodeToken(token): decodifica sem validar
```

#### 2.2 Serviço de Password (Hashing/Verification)

```bash
# Criar arquivo: src/application/services/PasswordService.ts
# Com métodos:
#  - hash(password): bcrypt com cost 12
#  - verify(password, hash): compara hashes
#  - isStrong(password): valida força (8+ chars, maiúscula, número)
```

#### 2.3 Use Case: RegisterUser

```bash
npm test -- tests/unit/application/RegisterUser.spec.ts
# Criar arquivo: src/application/usecases/RegisterUser.ts
#
# 1. Validar email (formato)
# 2. Validar password (força)
# 3. Verificar se email já existe
# 4. Hash password
# 5. Criar user no repository
# 6. Retornar user (sem passwordHash)
```

#### 2.4 Use Case: Login

```bash
npm test -- tests/unit/application/Login.spec.ts
# Criar arquivo: src/application/usecases/Login.ts
#
# 1. Buscar user por email
# 2. Verificar password com hash armazenado
# 3. Tracking de falhas (brute force)
# 4. Se 5 falhas em 15 min: bloquear
# 5. Gerar access + refresh tokens
# 6. Retornar { accessToken, refreshToken }
#
# Error handling:
#  - Mesmo erro para email não encontrado e senha errada
#  - Nunca revelar qual falhou
```

#### 2.5 Use Case: RefreshToken

```bash
npm test -- tests/unit/application/RefreshToken.spec.ts
# Criar arquivo: src/application/usecases/RefreshToken.ts
#
# 1. Validar refresh token (assinatura + expiration)
# 2. Extrair userId
# 3. Invalidar OLD refresh token (token rotation)
# 4. Gerar NEW access + refresh tokens
# 5. Retornar { accessToken, refreshToken }
#
# Security: Rejeitar replay attacks
#  - Se mesmo token usado 2x → UnauthorizedError
```

#### 2.6 Use Case: AddToWatchlist

```bash
npm test -- tests/unit/application/AddToWatchlist.spec.ts
# Criar arquivo: src/application/usecases/AddToWatchlist.ts
#
# 1. Validar mediaType (movie | tv)
# 2. Validar tmdbId > 0
# 3. Verificar duplicata (profileId + tmdbId + mediaType)
# 4. Verificar limite 500 itens da watchlist
# 5. Criar item no repository
# 6. Retornar item
```

#### 2.7 Use Case: GetTrendingMovies

```bash
npm test -- tests/unit/application/GetTrendingMovies.spec.ts
# Criar arquivo: src/application/usecases/GetTrendingMovies.ts
#
# 1. Verificar cache (Redis)
# 2. Se hit: retornar com cache status
# 3. Se miss: chamar TMDB API com TIMEOUT 5s
# 4. Se erro: tentar cache stale
# 5. Se tudo falha: error
# 6. Cachear resultado por 1 hora
#
# Integration com TmdbClient:
#  - Via interface injetada no constructor
```

---

### FASE 3: Infrastructure Layer

#### 3.1 Prisma Setup

```bash
# Criar arquivo: backend/prisma/schema.prisma
# Com models:
#  - User { id, email, passwordHash, createdAt, updatedAt }
#  - Profile { id, name, avatarUrl, isKids, userId, createdAt }
#  - WatchlistItem { id, tmdbId, mediaType, title, posterPath, profileId, addedAt }
#  - RefreshToken { id, token, userId, expiresAt, createdAt }

# Criar arquivo: src/infrastructure/database/PrismaUserRepository.ts
# Implementar interface IUserRepository:
#  - create(userData): User
#  - findById(id): User | null
#  - findByEmail(email): User | null
#  - update(id, data): User
```

#### 3.2 Redis Cache Setup

```bash
# Criar arquivo: src/infrastructure/cache/RedisCache.ts
# Com métodos:
#  - get(key): Promise<any>
#  - set(key, value, ttl): Promise<void>
#  - delete(key): Promise<void>
#  - Connection pooling + error handling
```

#### 3.3 TMDB Client

```bash
npm test -- tests/unit/application/GetTrendingMovies.spec.ts
# Criar arquivo: src/infrastructure/external/tmdb/TmdbClient.ts
#
# Com métodos:
#  - getTrendingMovies(): Promise<Movie[]>
#  - getMovieDetails(id): Promise<Movie>
#  - getTrailer(movieId): Promise<Video>
#  - search(query): Promise<SearchResult[]>
#
# Requisitos:
#  - Bearer Token authentication
#  - Request timeout: 5s
#  - Error handling (TMDB offline)
#  - Rate limiting friendly
```

---

### FASE 4: Interfaces Layer (HTTP)

#### 4.1 AuthController

```bash
# Criar arquivo: src/interfaces/http/controllers/AuthController.ts
#
# Com métodos:
#  - register(req, res): POST /api/auth/register
#  - login(req, res): POST /api/auth/login
#  - refresh(req, res): POST /api/auth/refresh
#  - logout(req, res): POST /api/auth/logout
#
# Responsabilidades:
#  - Validar input (Zod schema)
#  - Chamar use case
#  - Transformar erro domain → resposta HTTP
#  - Retornar JSON correto
```

#### 4.2 Middlewares

```bash
# src/interfaces/http/middlewares/auth.ts
#  - Validar JWT do header Authorization
#  - Injetar userId em req.user
#  - Rate limit: 100 req/min por IP

# src/interfaces/http/middlewares/errorHandler.ts
#  - Pegar DomainError e retornar HTTP apropriado
#  - Em produção: error genérico. Em dev: detalhes
#  - Nunca expor stack trace em prod

# src/interfaces/http/middlewares/validation.ts
#  - Validar com Zod schema
#  - Retornar 400 com erros de validação
```

#### 4.3 Routes

```bash
# src/interfaces/http/routes/auth.routes.ts
#  - POST /api/auth/register
#  - POST /api/auth/login
#  - POST /api/auth/refresh
#  - POST /api/auth/logout

# src/interfaces/http/routes/watchlist.routes.ts
#  - GET /api/watchlist (require auth)
#  - POST /api/watchlist (require auth)
#  - DELETE /api/watchlist/:tmdbId (require auth)
```

#### 4.4 Express App Setup

```bash
# Criar arquivo: src/interfaces/app.ts
#  - Express setup com cors, helmet, rate limit
#  - Registrar middlewares globais
#  - Registrar routes
#  - Error handler como middleware final

# Criar arquivo: src/index.ts
#  - Criar app
#  - Conectar PostgreSQL (Prisma)
#  - Conectar Redis
#  - Iniciar server em PORT
```

---

## ⚡ Checklist de Implementação

### Domain Layer ✅

- [ ] `User` entity criado
- [ ] `Profile` entity criado
- [ ] `WatchlistItem` entity criado
- [ ] `DomainError` base class
- [ ] Todos os 15 testes de domain passando ✅

### Application Layer ✅

- [ ] `TokenService` implementado
- [ ] `PasswordService` implementado
- [ ] `RegisterUser` use case
- [ ] `Login` use case
- [ ] `RefreshToken` use case
- [ ] `AddToWatchlist` use case
- [ ] `GetTrendingMovies` use case
- [ ] Todos os 39 testes de application passando ✅

### Infrastructure Layer ✅

- [ ] Prisma migrations criadas
- [ ] `PrismaUserRepository` implementado
- [ ] `RedisCache` implementado
- [ ] `TmdbClient` implementado
- [ ] Connection pooling + error handling

### Interfaces Layer ✅

- [ ] `AuthController` implementado
- [ ] `WatchlistController` implementado
- [ ] Auth middleware implementado
- [ ] Error handler middleware implementado
- [ ] Validation middleware implementado
- [ ] Routes registradas

### App & Server ✅

- [ ] Express app criado
- [ ] All middlewares registrado
- [ ] All routes registrado
- [ ] Server iniciando em PORT

### Tests ✅

- [ ] Todos os 70 testes passando 🟢
- [ ] Coverage >= 95% domain
- [ ] Coverage >= 85% application
- [ ] Coverage >= 70% infrastructure
- [ ] Lint sem errors
- [ ] Type-check sem errors

---

## 🔄 Ciclo por Feature (Repetir para cada)

```
1. Rodar teste (deve falhar com "Cannot find module" ou "is not defined")
2. Criar arquivo de implementação vazio
3. Implementar MÍNIMO para passar
4. Rodar teste (deve passar 🟢)
5. Refactor se necessário (sem quebrar teste)
6. Prosseguir para próximo teste
```

**Nunca:**

- ❌ Escrever mais código que o necessário
- ❌ Alterar testes para passar
- ❌ Deixar testes em `.skip` ou `.todo`
- ❌ Rodar apenas novo teste (sempre rodar suite completa)

**Sempre:**

- ✅ Rodar suite completa após cada implementação
- ✅ Verificar que nenhum teste regrediu
- ✅ Manter cobertura acima do mínimo
- ✅ Comitar com Conventional Commits

---

## 🧪 Validar Implementação

### Após cada feature completada:

```bash
# 1. Rodar testes (todos devem passar)
npm test

# 2. Verificar coverage
npm test -- --coverage

# 3. Lint
npm run lint

# 4. Type check
npm run typecheck

# 5. Se tudo OK: fazer commit
git add .
git commit -m "feat(domain): implement User entity"
```

---

## 📈 Progresso Esperado

```
Sprint 1: Domain Layer (2-3 horas)
  ✅ Entities criadas: 15 testes verdes
  ✅ Errors criados: 15 testes verdes
  Total: 22 testes verdes

Sprint 2: Application Layer (4-6 horas)
  ✅ Services implementados
  ✅ Use cases implementados
  Total: 39 testes verdes

Sprint 3: Infrastructure (3-4 horas)
  ✅ Prisma setup
  ✅ Repositories implementados
  ✅ Cache e TMDB integrados
  Total: 60+ testes verdes

Sprint 4: HTTP Layer (3-4 horas)
  ✅ Controllers
  ✅ Routes
  ✅ Middlewares
  Total: 70 testes verdes 🎉

Sprint 5: E2E + Refinement (2-3 horas)
  ✅ E2E testes passando
  ✅ Security testes passando
  ✅ Coverage validado
```

---

## ❓ Dúvidas? Referências

- [PROJECT_NETFLIX_CLONE.md](../PROJECT_NETFLIX_CLONE.md) — Stack e arquitetura
- [Base/04_ENGINEER.md](../Base/04_ENGINEER.md) — Princípios de implementação
- [BEHAVIORS.md](../BEHAVIORS.md) — Comportamentos esperados
- [backend/tests/TEST_INDEX.md](tests/TEST_INDEX.md) — Índice de testes
- [backend/tests/helpers/mocks.ts](tests/helpers/mocks.ts) — Mocks de teste

---

## ✅ Critério de Conclusão

A implementação está completa quando:

- [x] Todos 70 testes passando 🟢
- [x] Coverage >= mínimo definido
- [x] Lint + type check sem errors
- [x] Nenhum teste em `.skip` ou `.todo`
- [x] Nenhuma implementação sem teste
- [x] Code review aprovado
- [x] Ready para QA final review

**Próximo:** QA Review → Security Audit → Release 🚀
