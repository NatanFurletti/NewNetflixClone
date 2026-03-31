# 🔧 AUDITORIA QA - CORREÇÕES NECESSÁRIAS

**Data:** 31/03/2026  
**Status:** ⚠️ 18 Issues Identificados (9 CRITICAL, 5 HIGH, 3 MEDIUM, 1 LOW)  
**Prioridade:** CORRIGIR ANTES DE PRODUÇÃO

---

## ✅ CORREÇÕES JÁ FEITAS

### 1. Token Format Inconsistency ✅

- **Arquivo:** `src/application/usecases/Login.ts`
- **Fix:** Padronizar para snake_case (`access_token`, `refresh_token`)
- **Status:** COMMITTED (commit 543dc01)

### 2. Auto-Login on Register ✅

- **Arquivo:** `src/interfaces/http/controllers/AuthController.ts`
- **Fix:** Register agora faz login automático e retorna tokens
- **Status:** COMMITTED (commit 543dc01)

### 3. User in Auth Response ✅

- **Arquivo:** `src/application/usecases/Login.ts`
- **Fix:** Adicionar `user: { id, email }` na resposta
- **Status:** COMMITTED (commit 543dc01)

### 4. API URL Correction ✅

- **Arquivo:** `frontend/lib/api/client.ts`
- **Fix:** Corrigir porta de 3001 para 5000
- **Status:** COMMITTED

### 5. Home Page Authentication Bypass ✅

- **Arquivo:** `frontend/app/page.tsx`
- **Fix:** Remover redirecionamento de autenticação para dev
- **Status:** COMMITTED

---

## 🔴 CRITICAL ISSUES - PRÓXIMAS AÇÕES

### #001: Secrets Expostos em .env

**Severidade:** CRITICAL  
**Arquivo:** `.env`, `.env.local`, `.env.example`  
**Problema:** TMDB_BEARER_TOKEN e JWT secrets em plaintext  
**Fix:**

```bash
# Regerar secrets:
- Novo TMDB_BEARER_TOKEN (gerar em https://www.themoviedb.org/settings/api)
- JWT_SECRET_ACCESS: $(openssl rand -hex 32)
- JWT_SECRET_REFRESH: $(openssl rand -hex 32)

# Adionar .env ao .gitignore
# Criar .env.example sem secrets
```

---

### #002: Sem Validação de Input (ANY types)

**Severidade:** CRITICAL  
**Arquivos:** `AuthController.ts`, `WatchlistController.ts`  
**Problema:** Controllers aceitam qualquer dados sem schema validation  
**Fix:**

```typescript
// Instalar Zod
npm install zod

// Criar schemas
// src/application/validation/schemas.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter 8+ caracteres')
    .regex(/[A-Z]/, 'Deve ter 1 letra maiúscula')
    .regex(/[0-9]/, 'Deve ter 1 número'),
});

export const CreateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Nome obrigatório')
    .max(50, 'Nome muito longo'),
});

export const AddToWatchlistSchema = z.object({
  movieId: z.number().positive('ID inválido'),
  profileId: z.string().uuid('Profile ID inválido'),
});

// Usar no controller:
const validated = RegisterSchema.parse(req.body);
```

---

### #003: Broken Access Control (sem ownership)

**Severidade:** CRITICAL  
**Arquivos:** `WatchlistController.ts`, `src/application/usecases/*`  
**Problema:** Usuário consegue acessar watchlist de outros usuários  
**Fix:**

```typescript
// Em getWatchlistItems:
// 1. Verificar se profileId pertence ao user autenticado
const profile = await profileRepository.findById(profileId);
if (profile?.userId !== req.user.id) {
  throw new ForbiddenError("Acesso negado");
}

// 2. Mesmo para addToWatchlist
const profile = await profileRepository.findById(profileId);
if (profile?.userId !== req.user.id) {
  throw new ForbiddenError("Você não pode adicionar para este profile");
}
```

---

### #004: Type Hits - ANY types

**Severidade:** CRITICAL  
**Arquivos:** `TokenService.ts`, `TmdbClient.ts`, middleware auth  
**Problema:** Múltiplos `any` em pontos críticos de segurança  
**Fix:**

```typescript
// TokenService.ts
interface TokenPayload {
  sub: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
}

export class TokenService {
  static validateToken(token: string, secret: string): TokenPayload {
    // Agora com tipos corretos
  }
}

// middleware/auth.ts
interface AuthRequest extends Request {
  user: { id: string };
}
```

---

### #005: Token Revocation em Memória

**Severidade:** CRITICAL  
**Arquivo:** `src/application/usecases/RefreshToken.ts`  
**Problema:** Set<> perde tokens revogados em reboot  
**Fix:**

```typescript
// Usar Redis ao invés de Set em memória
// Instalar redis
npm install redis

// Em RefreshTokenUseCase:
private redis: RedisClient;

async execute(input) {
  // Verificar se token foi revogado em Redis
  const isRevoked = await this.redis.get(`revoked_token:${input.refreshToken}`);
  if (isRevoked) {
    throw new UnauthorizedError('Token já foi utilizado');
  }

  // Revogar token em Redis (expira em 7 dias)
  await this.redis.setex(`revoked_token:${input.refreshToken}`, 604800, '1');
}
```

---

### #006: Brute Force Protection em Memória

**Severidade:** CRITICAL  
**Arquivo:** `src/application/usecases/Login.ts`  
**Problema:** Contador de falhas perde em restart  
**Fix:**

```typescript
// Usar Redis
// Em LoginUseCase:
async checkBruteForceProtection(email: string) {
  const attempts = await this.redis.get(`login_attempts:${email}`);
  const attemptCount = parseInt(attempts || '0', 10);

  if (attemptCount >= 5) {
    const lockoutKey = `login_lockout:${email}`;
    const lockout = await this.redis.get(lockoutKey);
    if (lockout) {
      const remaining = await this.redis.ttl(lockoutKey);
      throw new UnauthorizedError(
        `Conta bloqueada. Tente em ${remaining}s`
      );
    }
  }
}

async recordFailedAttempt(email: string) {
  await this.redis.incr(`login_attempts:${email}`);
  await this.redis.expire(`login_attempts:${email}`, 900); // 15 min

  const count = await this.redis.get(`login_attempts:${email}`);
  if (parseInt(count, 10) >= 5) {
    await this.redis.setex(`login_lockout:${email}`, 900, '1');
  }
}
```

---

## ⚠️ HIGH PRIORITY FIXES

### #010: Sem Logging de Segurança

```typescript
// Adicionar winston ou pino para logging
npm install pino

// Log em LoginUseCase:
logger.info(`Login attempt: ${email}`);
logger.warn(`Failed login attempt: ${email} - attempt ${count}/5`);
logger.error(`Brute force lockout: ${email}`);
```

---

### #011: CORS Muito Permissivo

**Arquivo:** `src/interfaces/http/app.ts`  
**Fix:**

```typescript
// Ao invés de:
origin: process.env.FRONTEND_URL || "http://localhost:3000";

// Usar whitelist:
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://yourdomain.com",
];

cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

### #013: Rate Limit Inadequado

**Arquivo:** `src/interfaces/http/app.ts`  
**Fix:**

```typescript
// Para auth, usar limite mais baixo:
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Máximo 5 tentativas
  skipSuccessfulRequests: true,
});

app.post('/api/auth/login', authLimiter, ...);
app.post('/api/auth/register', authLimiter, ...);

// Para outros endpoints, 100 por 15 min está OK
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
```

---

### #014: Sem Auto-Logout no Frontend

**Arquivo:** `frontend/contexts/auth.tsx`  
**Fix:**

```typescript
// Adicionar useEffect para monitorar token expiração:
useEffect(() => {
  const checkTokenExpiry = setInterval(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = decoded.exp * 1000 - Date.now();

      if (expiresIn < 60000) {
        // Menos de 1 minuto
        // Auto-logout
        logout();
        toast.error("Sessão expirada. Faça login novamente.");
      }
    }
  }, 30000); // Verificar a cada 30s

  return () => clearInterval(checkTokenExpiry);
}, []);
```

---

## 📝 CHECKLIST FINAL

- [ ] Regenerar e guardar secrets em .env.local (não commit)
- [ ] Instalar Zod e criar schemas de validação
- [ ] Adicionar verificação de ownership em todos endpoints
- [ ] Remover ALL `any` types
- [ ] Implementar Redis para session/revocation
- [ ] Atualizar rate limiting
- [ ] Adicionar logging (pino/winston)
- [ ] Testar todos endpoints com dados inválidos
- [ ] Testar brute force protection
- [ ] Testar CORS com diferentes origins
- [ ] Implementar auto-logout no frontend
- [ ] Executar npm audit
- [ ] Fazer security code review
- [ ] Testar deploy com variáveis de ambiente

---

## 🚀 PRÓXIMOS PASSOS

### **HOJE (Priority 1):**

1. Matar backend antigo (Ctrl+C)
2. npm install zod
3. Implementar schemas de validação
4. Adicionar ownership checks
5. Rebuild e testar

### **ESTA SEMANA (Priority 2):**

6. Setup Redis para session management
7. Implementar logging
8. Auto-logout frontend
9. Audit npm dependencies

### **PRÓXIMA SPRINT:**

10. Email double opt-in
11. Advanced security tests
12. Penetration testing

---

## 📊 Impacto das Correções

| Fix              | Impacto            | Tempo |
| ---------------- | ------------------ | ----- |
| Validação Zod    | Bloqueia ataques   | 1h    |
| Ownership checks | Previne data leak  | 2h    |
| Type hints       | Menos bugs         | 1.5h  |
| Redis            | Permissões persist | 2h    |
| Rate limit       | DDoS protection    | 0.5h  |
| Auto-logout      | UX/Security        | 0.5h  |

**Total estimado:** ~7 horas

---

**Gerado em:** 31/03/2026  
**Por:** QA Audit System  
**Status:** ⛔ CRITICO - Não deploy até corrigir
