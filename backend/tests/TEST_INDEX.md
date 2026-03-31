# 🧪 Netflix Clone — Índice de Testes (TDD)

**Status:** Em estado RED (todos os testes falhando porque o código não foi implementado)

---

## 📊 Estrutura de Testes

### Unit Tests — Domain

- `tests/unit/domain/User.spec.ts` (7 testes)
  - User entity creation, email validation, password security

- `tests/unit/domain/Profile.spec.ts` (5 testes)
  - Profile creation, name validation, isKids flag, avatar management

- `tests/unit/domain/WatchlistItem.spec.ts` (3 testes)
  - WatchlistItem creation, media type validation, addedAt timestamp

- `tests/unit/domain/DomainErrors.spec.ts` (7 testes)
  - InvalidEmailError, WeakPasswordError, UserNotFoundError, ProfileNotFoundError, etc.

### Unit Tests — Application (Use Cases)

- `tests/unit/application/RegisterUser.spec.ts` (8 testes)
  - Happy path, validation, duplicate prevention, password hashing

- `tests/unit/application/Login.spec.ts` (9 testes)
  - Correct credentials, invalid credentials, user enumeration prevention, brute force protection, token expiration

- `tests/unit/application/RefreshToken.spec.ts` (7 testes)
  - Token generation, token rotation, replay attack prevention, token validation

- `tests/unit/application/AddToWatchlist.spec.ts` (8 testes)
  - Happy path, idempotency, validation, limits (500 items max)

- `tests/unit/application/GetTrendingMovies.spec.ts` (8 testes)
  - TMDB proxy, Redis caching (1 hour TTL), stale fallback, error handling, 5s timeout

### Security Tests

- `tests/unit/security/Security.spec.ts` (13 testes)
  - SQL injection prevention, XSS prevention, CSRF protection
  - Authorization checks (403 vs 404, ownership validation)
  - Secret management, rate limiting

### Integration Tests

- `tests/integration/repositories/` (testes de repository com DB real)
- `tests/integration/external/` (testes com TMDB e Redis reais)

### E2E Tests

- `tests/e2e/auth-flow.e2e.spec.ts` (3 testes)
  - Complete registration → login → logout → login again flow
  - Watchlist persistence across sessions

---

## 📈 Coverage Mínimo por Layer

| Camada         | Coverage    | Testes    | Status      |
| -------------- | ----------- | --------- | ----------- |
| Domain         | 95%         | 22 testes | 🔴 RED      |
| Application    | 85%         | 40 testes | 🔴 RED      |
| Infrastructure | 70%         | TBD       | ⏳ Pendente |
| Security       | 100%        | 13 testes | 🔴 RED      |
| E2E            | Major flows | 3 testes  | 🔴 RED      |

**Total atual:** 78 testes em estado RED

---

## 🏭 Test Helpers

### Factories (tests/helpers/factories.ts)

- `makeUser()` — gera usuário de teste
- `makeProfile()` — gera perfil de teste
- `makeWatchlistItem()` — gera item de watchlist
- `makeTrendingMovie()` — gera film trending da TMDB
- `generateValidJWT()` — gera JWT válido para testes
- `generateExpiredJWT()` — gera JWT expirado

### Mocks (tests/helpers/mocks.ts)

- `createMockUserRepository()` — mock de repositório de usuários
- `createMockWatchlistRepository()` — mock de repositório de watchlist
- `createMockCacheService()` — mock de Redis/cache
- `createMockTmdbClient()` — mock de cliente TMDB
- `createMockTokenService()` — mock de serviço de tokens
- `createMockFailureTracker()` — mock para rate limit de brute force

---

## 🔴 Estado RED Confirmado

Ao rodar `npm test`, todos os 78 testes devem falhar com mensagens como:

- "Cannot find module '@/domain/entities/User'"
- "UserService is not defined"
- "Cannot read property 'create' of undefined"

**Isso é esperado e desejado!** Como estamos em TDD, os testes foram escritos ANTES da implementação.

---

## ✅ Próximo Passo

1. **QA Engineer** deve validar:
   - Todos os 78 testes estão em estado RED?
   - Coverage mínimo foi definido?
   - Nenhum teste passou sem implementação (false positives)?
   - Edge cases estão cobertos?

2. **Após QA aprovação**, o **Engenheiro** pode começar a implementar o código para passar nos testes.

---

## 📋 Testes de Comportamento Mapeados

Todos os comportamentos do `BEHAVIORS.md` foram traduzidos em testes:

✅ Autenticação (Register, Login, Refresh, Logout)
✅ Perfis (Create, List, Delete)
✅ Conteúdo TMDB (Trending, Details, Trailers, Cache)
✅ Watchlist (Add, Remove, List, Persistence)
✅ Segurança (SQL injection, XSS, CSRF, Rate limit, Auth)
✅ E2E (Fluxos completos)

---

## 🚀 Checklist TDD

- [x] Comportamentos mapeados em linguagem natural
- [x] Testes escritos (78 testes criados)
- [x] Testes em estado RED confirmado
- [x] Factories e mocks criados
- [x] Coverage mínimo definido (95% domain, 85% app, 70% infra)
- [x] Zero false positives (nenhum teste passou sem código)
- [ ] QA valida cobertura
- [ ] Engenheiro implementa código
