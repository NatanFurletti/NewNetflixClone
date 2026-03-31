# 🔐 SECURITY AUDIT & QA REVIEW - Netflix Clone

**Data:** 31 de Março de 2026  
**Reviewer:** Code Auditor Sênior  
**Status:** ⚠️ **18 ISSUES ENCONTRADOS** (9 CRITICAL, 5 HIGH, 4 MEDIUM)

---

## 📊 RESUMO EXECUTIVO

| Categoria  | Total  | CRITICAL | HIGH  | MEDIUM | LOW   |
| ---------- | ------ | -------- | ----- | ------ | ----- |
| Backend    | 12     | 6        | 3     | 2      | 1     |
| Frontend   | 4      | 2        | 1     | 1      | 0     |
| Deployment | 2      | 1        | 1     | 0      | 0     |
| **TOTAL**  | **18** | **9**    | **5** | **3**  | **1** |

---

# 🛑 CRITICAL ISSUES (9)

## ISSUE #001 - CRITICAL: Secrets Expostos no .env Commitado

**Arquivo:** [backend/.env](backend/.env)  
**Problema:**

- TMDB_BEARER_TOKEN está em PLAINTEXT no arquivo .env
- TMDB_API_KEY exposto (5098d21b5daa56bbc7e25777089278c3)
- JWT_ACCESS_SECRET e JWT_REFRESH_SECRET são values placeholder muito curtos (~35 chars vs 32 min recomendado)
- Arquivo .env deve estar no `.gitignore` mas foi commitado
- **Risco:** Qualquer pessoa com acesso ao repositório tem credenciais reais

**Recomendação:**

```bash
# 1. Regenerar TODOS os secrets no TMDB console
tm# 2. Adicionar ao .gitignore:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 3. Remover do histórico git:
git filter-branch --tree-filter 'rm -f .env' HEAD

# 4. Usar 64-character random strings para JWT secrets:
JWT_ACCESS_SECRET=<gerar com: openssl rand -base64 32>
JWT_REFRESH_SECRET=<gerar com: openssl rand -base64 32>
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A02:2021 – Cryptographic Failures

---

## ISSUE #002 - CRITICAL: Sem Validação de Input (SQL Injection Potencial)

**Arquivo:** [backend/src/interfaces/http/controllers/WatchlistController.ts](backend/src/interfaces/http/controllers/WatchlistController.ts#L93-L94)  
**Problema:**

```typescript
// VULNERABLE - Sem validação!
const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
```

- `parseInt()` sem validação de range → pode enviar `limit=-999999` ou `NaN`
- Sem validação de tipo de dados em `req.body`
- Controllers aceitam ANY input sem Zod/schema validation
- Possibilidade de resource exhaustion (limit muito grande)

**Recomendação:**

```typescript
import { z } from "zod";

// Criar schemas Zod em cada controller
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

// Na controller:
const pagination = paginationSchema.parse(req.query);
const result = await this.getWatchlistItemsUseCase.execute({
  profileId,
  limit: pagination.limit,
  offset: pagination.offset,
});
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A03:2021 – Injection

---

## ISSUE #003 - CRITICAL: Falta de Autorização (Broken Access Control)

**Arquivo:** [backend/src/interfaces/http/controllers/WatchlistController.ts](backend/src/interfaces/http/controllers/WatchlistController.ts#L92-L101)  
**Problema:**

```typescript
// FALTA VERIFICAÇÃO DE OWNERSHIP!
async getWatchlistItems(req: Request, res: Response): Promise<void> {
  const { profileId } = req.params;
  // ❌ NÃO verifica se profileId pertence ao req.userId autenticado

  const result = await this.getWatchlistItemsUseCase.execute({
    profileId, // Usuário pode pedir watchlist de OUTRO usuário!
    limit,
    offset,
  });
}
```

**Risco de Exploração:**

```bash
# Atacante autenticado como user123
GET /api/watchlist/altro-user-profile-id
# ✅ Acesso concedido! (não deveria ser)
```

**Recomendação:**

```typescript
async getWatchlistItems(req: Request, res: Response): Promise<void> {
  const { profileId } = req.params;
  const userId = req.userId!;

  // 1. Buscar profile
  const profile = await this.profileRepository.findById(profileId);
  if (!profile) throw new ProfileNotFoundError(profileId);

  // 2. VERIFICAR OWNERSHIP
  if (profile.userId !== userId) {
    throw new ForbiddenError("Você não tem acesso a este perfil");
  }

  // 3. Continuar com a operação
  const result = await this.getWatchlistItemsUseCase.execute({...});
}
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A01:2021 – Broken Access Control

---

## ISSUE #004 - CRITICAL: Type Hints Faltando (ANY em Pontos Críticos)

**Arquivo:** [backend/src/application/usecases/GetTrendingMovies.ts](backend/src/application/usecases/GetTrendingMovies.ts#L31)  
**Problema:**

```typescript
// Múltiplos ANY types que ocultam bugs
export async execute(): Promise<any[]> { // ❌ ANY como retorno
  const cached = await this.cacheService.get(this.CACHE_KEY);
  if (cached && !cached.stale) { // ❌ cached é ANY, pode ser undefined
    return cached.data; // ❌ Qual é a estrutura de data?
  }
  // ...
  return movies as any[]; // ❌ ANY cast perigoso
}

// Em Infrastructure
constructor(private redis: any) {} // ❌ Tipo Redis desconhecido
```

**Risco:**

- Reflexo de tipos em runtime (pode quebrar em produção)
- IDE autocomplete não funciona
- Falha em refatorações

**Recomendação:**

```typescript
// Criar tipos específicos
interface IMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
}

interface ICacheEntry<T> {
  data: T;
  stale?: boolean;
}

// Na classe
export async execute(): Promise<IMovie[]> {
  const cached = await this.cacheService.get<ICacheEntry<IMovie[]>>(this.CACHE_KEY);
  if (cached?.data && !cached.stale) {
    return cached.data;
  }
  // ...
  return (movies as IMovie[]);
}
```

**Severidade:** CRITICAL 🔴  
**Relacionado:** TypeScript strict mode não é enforçado

---

## ISSUE #005 - CRITICAL: Token Revocation em Memória (Perda em Restart)

**Arquivo:** [backend/src/application/usecases/RefreshToken.ts](backend/src/application/usecases/RefreshToken.ts#L13)  
**Problema:**

```typescript
export class RefreshTokenUseCase {
  private revokedTokens: Set<string> = new Set(); // ❌ EM MEMÓRIA!

  async execute(input: { refreshToken: string }): Promise<...> {
    // 1. Se token foi revogado:
    if (this.revokedTokens.has(input.refreshToken)) { // ❌ Check in-memory
      throw new UnauthorizedError("Token já foi utilizado");
    }
    // 2. Revogar token (token rotation)
    this.revokedTokens.add(input.refreshToken); // ✅ Revogado apenas em memória
    // ...
  }
}
```

**Cenário de Ataque:**

1. Servidor reinicia
2. `revokedTokens` é limpo (Set vazio)
3. Tokens revogados são reusáveis!

**Recomendação:**

```typescript
// Usar banco de dados ou Redis para token blacklist
export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository, // BD
    // ou
    private redis: RedisClient, // Redis
  ) {}

  async execute(input: { refreshToken: string }): Promise<...> {
    // 1. Verificar revogação no banco/redis
    const isRevoked = await this.refreshTokenRepository.isRevoked(
      input.refreshToken
    );
    if (isRevoked) {
      throw new UnauthorizedError("Token já foi utilizado");
    }

    // 2. Revogar no banco/redis
    await this.refreshTokenRepository.revoke(input.refreshToken);
  }
}
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A02:2021 – Cryptographic Failures

---

## ISSUE #006 - CRITICAL: Brute Force Apenas em Memória

**Arquivo:** [backend/src/application/usecases/Login.ts](backend/src/application/usecases/Login.ts#L14)  
**Problema:**

```typescript
private failedAttempts: Map<string, { count: number; lastAttempt: number }> =
  new Map(); // ❌ EM MEMÓRIA

async execute(input: { email: string; password: string }): Promise<...> {
  // Verifica brute force apenas em memória
  this.checkBruteForceProtection(input.email); // ❌ Perdido em restart
  // ...
}
```

**Cenário de Ataque:**

1. Atacante faz 5 tentativas falhadas
2. Servidor reinicia
3. Contador zerado! Atacante continua

**Recomendação:**

```typescript
// Mover para Redis com TTL
export class LoginUseCase {
  constructor(
    private redis: RedisClient,
    // ...
  ) {}

  private async checkBruteForceProtection(email: string): Promise<void> {
    const key = `brute_force:${email}`;
    const attempts = await this.redis.get(key);
    const count = attempts ? parseInt(attempts) : 0;

    if (count >= this.MAX_FAILED_ATTEMPTS) {
      throw new UnauthorizedError("Conta temporariamente bloqueada");
    }
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = `brute_force:${email}`;
    await this.redis.incr(key);
    await this.redis.expire(key, this.LOCKOUT_DURATION_MS / 1000);
  }
}
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A07:2021 – Identification and Authentication Failures

---

## ISSUE #007 - CRITICAL: Sem Validação de Ownership em Watchlist

**Arquivo:** [backend/src/interfaces/http/controllers/WatchlistController.ts](backend/src/interfaces/http/controllers/WatchlistController.ts#L57-L70)  
**Problema:**

```typescript
async addToWatchlist(req: Request, res: Response): Promise<void> {
  const { profileId, tmdbId, mediaType, title, posterPath } = req.body;

  // ❌ Não verifica se profileId é do usuário autenticado!
  const result = await this.addToWatchlistUseCase.execute({
    profileId, // Pode ser de outro usuário
    tmdbId,
    mediaType,
    title,
    posterPath,
  });
}
```

**Recomendação:** Adicionar middleware/verificação de ownership antes de executar

---

## ISSUE #008 - CRITICAL: Senha Fraca não Rejeita Todas as Variações

**Arquivo:** [backend/src/application/services/PasswordService.ts](backend/src/application/services/PasswordService.ts#L8)  
**Problema:**

```typescript
private static readonly PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

static isStrong(password: string): boolean {
  return this.PASSWORD_REGEX.test(password);
}
```

**Validações Faltando:**

- Sem limite máximo de tamanho (memória exhaustion)
- Não detecta senhas comuns (password123, Abc123456)
- Regex permite caracteres repetidos perigosos
- Sem proteção contra homograph attacks

**Recomendação:**

```typescript
private static readonly PASSWORD_MIN_LENGTH = 8;
private static readonly PASSWORD_MAX_LENGTH = 128; // ADD MAX
private static readonly COMMON_PASSWORDS = ['password', 'Admin123', '123456'];

static validateStrength(password: string): void {
  // 1. Range
  if (password.length < this.PASSWORD_MIN_LENGTH ||
      password.length > this.PASSWORD_MAX_LENGTH) {
    throw new WeakPasswordError();
  }

  // 2. Regex (maiúscula, número, caractere especial)
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,128}$/;

  if (!passwordRegex.test(password)) {
    throw new WeakPasswordError();
  }

  // 3. Common password check (usar library)
  if (this.COMMON_PASSWORDS.some(p => password.toLowerCase().includes(p))) {
    throw new WeakPasswordError("Senha muito comum");
  }
}
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A07:2021 – Identification and Authentication Failures

---

## ISSUE #009 - CRITICAL: Sem X-CSRF-Token ou SameSite Cookie

**Arquivo:** [backend/src/interfaces/http/app.ts](backend/src/interfaces/http/app.ts#L23-L27)  
**Problema:**

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // ❌ Sem SameSite ou CSRF token validation
  }),
);

// ❌ Sem proteção CSRF em POST/DELETE
app.use(express.json());
```

**Risco:**

- CSRF attacks possíveis (cross-site request forgery)
- Form submission de site malicioso pode ser aceita

**Recomendação:**

```typescript
import csrf from "csurf"; // npm install csurf

// Setup CSRF
const csrfProtection = csrf({ cookie: false }); // sessionStorage para token

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Endpoint para obter CSRF token no frontend
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});

// Proteger POST/DELETE/PUT
app.post("/api/auth/login", csrfProtection, authController.login);
app.post("/api/watchlist", csrfProtection, authController.addToWatchlist);
```

**Frontend:**

```typescript
// Recuperar token antes de POST
const response = await apiClient.get("/csrf-token");
const csrfToken = response.data.token;

// Enviar em header
apiClient.defaults.headers.post["X-CSRF-Token"] = csrfToken;
```

**Severidade:** CRITICAL 🔴  
**OWASP:** A01:2021 – Broken Access Control (CSRF)

---

# ⚠️ HIGH SEVERITY ISSUES (5)

## ISSUE #010 - HIGH: Sem Logging e Auditoria de Segurança

**Arquivo:** [backend/src/interfaces/http/middlewares/errorHandler.ts](backend/src/interfaces/http/middlewares/errorHandler.ts)  
**Problema:**

```typescript
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("Error:", err); // ❌ Apenas console.error
  // Sem:
  // - IP do atacante
  // - Request ID para correlação
  // - Timestamp
  // - User ID (se autenticado)
  // - Tipo de erro (auth failure, validation error, etc)
}
```

**Impacto:**

- Impossível investigar ataques
- Impossível detectar padrões de ataque
- Sem rastreabilidade de erros críticos

**Recomendação:**

```typescript
import winston from "winston"; // npm install winston
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      id: string; // Request ID para correlação
    }
  }
}

// Middleware para criar request ID
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Logger estruturado
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({
    message: err.message,
    code: err.code || "UNKNOWN",
    ip: req.ip,
    userId: req.userId,
    requestId: req.id,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof DomainError) {
    res.status(statusMap[err.code] || 400).json({
      error: err.message,
      code: err.code,
      requestId: req.id,
    });
  } else {
    res.status(500).json({
      error: "Internal server error",
      requestId: req.id,
    });
  }
}
```

**Severidade:** HIGH 🟠  
**OWASP:** A09:2021 – Logging and Monitoring Failures

---

## ISSUE #011 - HIGH: CORS Muito Permissivo em Desenvolvimento

**Arquivo:** [backend/src/interfaces/http/app.ts](backend/src/interfaces/http/app.ts#L24)  
**Problema:**

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // ❌ Fallback inseguro para localhost
  }),
);
```

**Risco:**

- Se `FRONTEND_URL` não definido, escuta em `http://localhost:3000`
- Em produção sem variável, qualquer localhost pode acessar
- Desenvolvedor pode esquecer de remover variável local

**Recomendação:**

```typescript
// Whitelist explícita
const allowedOrigins = [
  "https://netflix-clone.vercel.app", // Produção
  "https://staging.netflix-clone.app", // Staging
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
    maxAge: 3600, // Pre-flight cache 1 hora
  }),
);
```

**Severidade:** HIGH 🟠  
**OWASP:** A01:2021 – Broken Access Control

---

## ISSUE #012 - HIGH: Sem Validação de Email (Email Spoofing)

**Arquivo:** [backend/src/application/usecases/RegisterUser.ts](backend/src/application/usecases/RegisterUser.ts#L22-L24)  
**Problema:**

```typescript
private isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email); // ❌ Regex muito permissivo
}
```

**Emails "Válidos" Perigosos:**

- `user@example.` ❌ Sem TLD válido
- `user@@example.com` ❌ Duplo @
- `user@127.0.0.1` ❌ IP sem validação
- `user+alias@example.com` ❌ Sem sanitizar '+'

**Recomendação:**

```typescript
import { isEmail } from 'validator'; // npm install validator

static validateEmail(email: string): boolean {
  if (email.length > 254) return false; // RFC 5321

  // Usar biblioteca de validação confiável
  return isEmail(email, {
    allow_display_name: false,
    require_tld: true,
  });
}

// Ou usar verificação de verdade com double opt-in
async register(input: { email: string; password: string }) {
  // 1. Validar formato
  if (!this.validateEmail(input.email)) {
    throw new InvalidEmailError(input.email);
  }

  // 2. Verificar se email já existe
  const existing = await this.userRepository.findByEmail(input.email);
  if (existing) {
    throw new DuplicateEmailError(input.email);
  }

  // 3. Enviar email de verificação
  const verification = await this.emailService.sendVerification(input.email);

  // 4. Criar usuário COM EMAIL NÃO VERIFICADO
  const user = User.create({
    id: uuid(),
    email: input.email,
    emailVerified: false, // Importante!
    // ...
  });
}
```

**Severidade:** HIGH 🟠  
**OWASP:** A07:2021 – Identification and Authentication Failures

---

## ISSUE #013 - HIGH: Sem Rate Limit Específico para Auth

**Arquivo:** [backend/src/interfaces/http/app.ts](backend/src/interfaces/http/app.ts#L29-L34)  
**Problema:**

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // ❌ 100 requests (muito permissivo para auth!)
  message: "Muitas requisições",
});
app.use(limiter); // ❌ Limiter GLOBAL

// Auth endpoints têm MESMO limite que GET /trending
// POST /auth/login - 100 tentativas em 15 min = 9.26 tentativas/seg
```

**Impacto:**

- Brute force em login com 100 tentativas
- Sem limite específico por endpoint

**Recomendação:**

```typescript
// Rate limiter específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // ❌ Máximo 5 tentativas (em vez de 100!)
  skip: (req) => req.method !== "POST",
  keyGenerator: (req) => req.body.email || req.ip, // Limitar por email
  handler: (req, res) => {
    res.status(429).json({
      error: "Muitas tentativas de login. Tente novamente em 15 minutos",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiter distinto para API geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // APIs normais: 1000/15min = 1.1/seg
});

app.use(generalLimiter);
app.post("/auth/login", authLimiter, authController.login);
app.post("/auth/register", authLimiter, authController.register);
app.post("/auth/refresh", authLimiter, authController.refreshToken);
```

**Severidade:** HIGH 🟠  
**OWASP:** A07:2021 – Identification and Authentication Failures

---

## ISSUE #014 - HIGH: Token Expiração em Frontend Sem Auto-Logout

**Arquivo:** [frontend/lib/api/client.ts](frontend/lib/api/client.ts#L25-L48)  
**Problema:**

```typescript
// Na context auth.tsx
useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    // ❌ Nenhuma verificação de expiração!
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }
  setIsLoading(false);
}, []);

// Apenas faz refresh em 401
// Mas se user ficar AFK, token expira e fica em estado inválido
```

**Cenário:**

1. Usuário faz login (token = 15 min)
2. Fica AFK por 20 minutos
3. Tenta clicar em algo
4. Request com token expirado → 401 → refresh
5. Mas durante esses 20 minutos, state está inconsistente

**Recomendação:**

```typescript
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    // 1. Decodificar token
    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      // 2. Se expirado, fazer logout
      if (decoded.exp && decoded.exp < now) {
        logout();
        return;
      }

      // 3. Se expirando em menos de 1 min, renovar
      if (decoded.exp && decoded.exp - now < 60) {
        refreshAccessToken();
        return;
      }
    } catch {
      logout();
      return;
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }
  setIsLoading(false);
}, []);

// Timer para renovação automática
useEffect(() => {
  if (!user) return;

  const token = localStorage.getItem("access_token");
  if (!token) return;

  const decoded = jwtDecode(token);
  const now = Date.now() / 1000;
  const expiresIn = (decoded.exp || 0) - now;

  // Renovar 1 minuto antes de expirar
  const timer = setTimeout(
    () => {
      refreshAccessToken();
    },
    (expiresIn - 60) * 1000,
  );

  return () => clearTimeout(timer);
}, [user, token]);
```

**Severidade:** HIGH 🟠  
**OWASP:** A07:2021 – Identification and Authentication Failures

---

# 🟡 MEDIUM SEVERITY ISSUES (3)

## ISSUE #015 - MEDIUM: Authorization Header CASE Sensitive

**Arquivo:** [backend/src/interfaces/http/middlewares/auth.ts](backend/src/interfaces/http/middlewares/auth.ts#L18)  
**Problema:**

```typescript
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  throw new UnauthorizedError("Token não fornecido");
}
```

**Risco:**

- `authorization` vs `Authorization` → headers são case-insensitive em HTTP
- Alguns clientes podem enviar `bearer` (lowercase) → rejeição

**Recomendação:**

```typescript
const authHeader = req.headers.authorization;

if (!authHeader) {
  throw new UnauthorizedError("Token não fornecido");
}

// Case-insensitive
const bearerToken = authHeader.match(/^Bearer\s+(\S+)$/i)?.[1];
if (!bearerToken) {
  throw new UnauthorizedError("Token inválido");
}

const decoded = TokenService.validateToken(bearerToken, jwtAccessSecret);
```

**Severidade:** MEDIUM 🟡  
**OWASP:** A07:2021 – Authentication Failures

---

## ISSUE #016 - MEDIUM: Sem Validação de URL em posterPath

**Arquivo:** [backend/src/interfaces/http/controllers/WatchlistController.ts](backend/src/interfaces/http/controllers/WatchlistController.ts#L57)  
**Problema:**

```typescript
const { profileId, tmdbId, mediaType, title, posterPath } = req.body;
// ❌ posterPath é string qualquer - XSS potencial!

await this.addToWatchlistUseCase.execute({
  profileId,
  tmdbId,
  mediaType,
  title,
  posterPath, // Pode ser: javascript:alert('XSS'), etc
});
```

**Recomendação:**

```typescript
import { isURL } from "validator";

// Na validação
if (
  posterPath &&
  !isURL(posterPath, {
    protocols: ["https"],
    host_whitelist: ["image.tmdb.org", "secure.gravatar.com"], // Whitelist
    require_protocol: true,
  })
) {
  throw new InvalidInputError("posterPath URL inválida");
}

// Ou usar Zod
const addToWatchlistSchema = z.object({
  profileId: z.string().cuid(),
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1).max(200),
  posterPath: z.string().url().optional(),
});
```

**Severidade:** MEDIUM 🟡  
**OWASP:** A03:2021 – Injection (XSS)

---

## ISSUE #017 - MEDIUM: Docker Compose Credenciais em Plaintext

**Arquivo:** [backend/docker-compose.yml](backend/docker-compose.yml#L10)  
**Problema:**

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres # ❌ HARDCODED!
      POSTGRES_DB: netflix_clone
```

**Impacto:**

- Docker image pode ter credenciais em layer history
- `.gitlab-ci.yml` ou CI logs podem expor valores

**Recomendação:**

```yaml
# docker-compose.yml (SEM credenciais)
services:
  postgres:
    image: postgres:15-alpine
    container_name: netflix-clone-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?error - set POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-netflix_clone}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

```bash
# .env (local development only)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<gerar aleatorio>
POSTGRES_DB=netflix_clone

# Production env variables via CI/CD secrets
```

**Severidade:** MEDIUM 🟡  
**OWASP:** A02:2021 – Cryptographic Failures

---

# 🔵 LOW SEVERITY ISSUES (1)

## ISSUE #018 - LOW: Faltam HTTP Security Headers

**Arquivo:** [backend/src/interfaces/http/app.ts](backend/src/interfaces/http/app.ts#L23)  
**Problema:**

```typescript
app.use(helmet()); // ❌ Helmet usa defaults, mas pode ser mais restritivo
```

**Headers Faltando:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

**Recomendação:**

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'nonce-{random}'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind precisa
        imgSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", process.env.API_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : undefined,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
```

**Severidade:** LOW 🔵  
**OWASP:** A01:2021 – Security Misconfiguration

---

# ✅ CHECKLIST DE DEPLOYMENT

## Antes de Produção:

- [ ] **ISSUE #001**: Regenerar e proteger secrets
- [ ] **ISSUE #002**: Implementar Zod validation em todos controllers
- [ ] **ISSUE #003**: Adicionar verificação de ownership em todos endpoints
- [ ] **ISSUE #004**: Refatorar tipos ANY para tipos específicos
- [ ] **ISSUE #005**: Mover token revocation para Redis/BD
- [ ] **ISSUE #006**: Mover brute force counter para Redis
- [ ] **ISSUE #007**: Validar ownership em watchlist operations
- [ ] **ISSUE #008**: Fortalecer validação de senha
- [ ] **ISSUE #009**: Implementar CSRF protection
- [ ] **ISSUE #010**: Implementar logging estruturado
- [ ] **ISSUE #011**: Whitelist explícita de CORS
- [ ] **ISSUE #012**: Email validation com double opt-in
- [ ] **ISSUE #013**: Rate limiting específico por endpoint
- [ ] **ISSUE #014**: Auto-logout em token expiration
- [ ] **ISSUE #015**: Case-insensitive Auth header
- [ ] **ISSUE #016**: URL whitelist para posterPath
- [ ] **ISSUE #017**: Secrets no .env local, passar via CI/CD
- [ ] **ISSUE #018**: HTTP security headers reforçados

---

# 📋 PRIORITY ORDER (Para Correção)

1. **CRITICAL - Do Immediately:**
   - #001 (Secrets)
   - #009 (CSRF)
   - #002 (Input validation)
   - #003 (Access control)

2. **HIGH - This Sprint:**
   - #013 (Rate limiting)
   - #011 (CORS)
   - #006 (Brute force DB)
   - #005 (Token revocation DB)

3. **MEDIUM - Next Sprint:**
   - #015, #016, #017

4. **LOW - Post-Release:**
   - #018 (Headers)

---

# 📊 SUMMARY BY COMPONENT

## Backend Architecture: 🟠 MODERATE

- Clean architecture implementada ✅
- Type safety inadequate (ANY types) ❌
- Input validation faltando ❌
- Authorization checks faltando ❌

## Security Measures: 🔴 WEAK

- Secrets expostos ❌
- Brute force em memória ❌
- Token revocation em memória ❌
- Sem CSRF protection ❌
- Rate limiting inadequado ❌

## Frontend Security: 🟡 ACCEPTABLE

- Context API bem estruturado ✅
- Refresh token logic OK ✅
- Mas sem auto-logout preventivo ❌
- localStorage sem XSS protection ❌

## Deployment: 🔴 NOT READY

- Docker compose com hardcoded passwords ❌
- Environment variables não protegidas ❌
- Sem health checks para services ⚠️
- Sem backup strategy ⚠️

---

**Relatório Gerado:** 31 Mar 2026  
**Auditor:** Code Security Team  
**Status:** ⚠️ **NOT PRODUCTION READY** - Corrigir CRITICAL issues antes do deploy
