# 🎬 Netflix Clone Backend API

Production-ready backend API built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (local or Docker)
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Docker Setup

```bash
# Start services with Docker Compose
npm run docker:up

# Stop services
npm run docker:down
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:e2e          # End-to-end tests
```

**Coverage Requirements:**

- Domain Layer: ≥95%
- Application Layer: ≥85%
- Infrastructure Layer: ≥70%

---

## 📁 Project Structure

```
src/
├── domain/                 # Business logic (entities, errors)
│   ├── entities/          # User, Profile, WatchlistItem
│   ├── errors/            # DomainError hierarchy
│   ├── repositories/      # Interfaces (IUserRepository, etc.)
│   └── index.ts
├── application/            # Use cases & services
│   ├── services/          # PasswordService, TokenService
│   ├── usecases/          # 9 use cases (RegisterUser, Login, etc.)
│   └── index.ts
├── infrastructure/         # External services & persistence
│   ├── repositories/      # Prisma implementations
│   └── services/          # Redis, TMDB, external clients
├── interfaces/            # HTTP layer
│   ├── middlewares/       # Auth, error handling
│   ├── controllers/       # HTTP request handlers
│   ├── routes/            # Express routes
│   ├── app.ts            # Express app setup
│   └── index.ts
└── index.ts              # Server entry point

prisma/
└── schema.prisma         # Database schema

tests/
├── unit/                 # Unit tests (domain, app)
├── integration/          # Integration tests
├── security/            # Security tests
├── e2e/                 # End-to-end tests
└── helpers/             # Test factories & mocks
```

---

## 🔐 Authentication & Authorization

### JWT Tokens

- **Access Token**: 15 minutes expiration (type: 'access')
- **Refresh Token**: 7 days expiration (type: 'refresh')

### Protected Routes

All routes under `/api/profiles` and `/api/watchlist` require:

```
Authorization: Bearer <accessToken>
```

### Brute Force Protection

- Max 5 login attempts per 15 minutes
- Account lockout increases exponentially

---

## 📊 Database Schema

### User

```sql
id (PK)
email (UNIQUE)
passwordHash
createdAt
updatedAt
```

### Profile

```sql
id (PK)
userId (FK)
name (3-20 chars)
avatarUrl (optional)
isKids (default: false)
createdAt
```

### WatchlistItem

```sql
id (PK)
profileId (FK)
tmdbId
mediaType ('movie' | 'tv')
title
posterPath (optional)
addedAt
UNIQUE(profileId, tmdbId, mediaType)
```

### RefreshToken

```sql
id (PK)
userId (FK)
token (UNIQUE)
expiresAt
revokedAt (soft delete)
createdAt
```

---

## 🔌 API Endpoints

### Authentication

#### POST `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### POST `/api/auth/refresh`

```json
{
  "refreshToken": "token..."
}
```

### Profiles

#### POST `/api/profiles`

```json
{
  "name": "My Profile",
  "avatarUrl": "https://...",
  "isKids": false
}
```

#### GET `/api/profiles`

Returns all profiles for authenticated user.

### Watchlist

#### POST `/api/watchlist`

```json
{
  "profileId": "...",
  "tmdbId": 550,
  "mediaType": "movie",
  "title": "Fight Club",
  "posterPath": "/..."
}
```

#### GET `/api/watchlist/:profileId?limit=50&offset=0`

Paginated list of watchlist items.

#### DELETE `/api/watchlist/:watchlistItemId`

Remove item from watchlist.

---

## 🔒 Security Features

| Feature              | Details                                  |
| -------------------- | ---------------------------------------- |
| **Password Hashing** | bcrypt (cost factor 12)                  |
| **JWT Validation**   | Token type verification (access/refresh) |
| **Rate Limiting**    | 100 req/min global, 5 login/15min        |
| **CORS**             | Configurable frontend origin             |
| **Helmet.js**        | Security headers (CSP, HSTS, etc.)       |
| **Input Validation** | Email regex, password strength           |
| **Error Messages**   | No user enumeration (generic errors)     |
| **Token Rotation**   | Refresh tokens invalidated after use     |

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/netflix_clone

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# TMDB API
TMDB_BEARER_TOKEN=your-bearer-token

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🛠️ Development Commands

```bash
npm run dev              # Start development server
npm run build           # Build TypeScript
npm run start           # Start production server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run typecheck       # TypeScript type checking
npm run prisma:migrate  # Create & apply migrations
npm run prisma:reset    # Reset database
npm run prisma:studio   # Open Prisma Studio
```

---

## 🚨 Error Handling

Errors are mapped to HTTP status codes:

```
InvalidEmailError           → 400 Bad Request
WeakPasswordError          → 400 Bad Request
DuplicateEmailError        → 409 Conflict
UserNotFoundError          → 404 Not Found
UnauthorizedError          → 401 Unauthorized
ForbiddenError             → 403 Forbidden
InvalidMediaTypeError      → 400 Bad Request
DuplicateItemError         → 409 Conflict
```

---

## 📊 Architecture

**Clean Architecture** with strict layer separation:

1. **Domain Layer**: Business rules (no dependencies)
2. **Application Layer**: Use cases & services (depends on domain)
3. **Infrastructure Layer**: Persistence & external services
4. **Interfaces Layer**: HTTP controllers & routes

**Dependency Injection** ensures testability and loose coupling.

---

## 🧪 Test Coverage

**70 Total Tests** across 4 test suites:

- **15 Domain Tests**: Entity validation, error handling
- **39 Application Tests**: Use case logic, edge cases
- **13 Security Tests**: Brute force, headers, token validation
- **3 E2E Tests**: Full auth flow, watchlist persistence

See `PHASE_1_COMPLETE.md` for detailed test breakdown.

---

## 📈 Performance

- **Connection Pooling**: Prisma with configurable pool size
- **Caching**: Redis cache layer (-insert use case for GetTrendingMovies)
- **Rate Limiting**: Prevent abuse (100 req/min)
- **Pagination**: Watchlist supports limit/offset
- **Timeouts**: External API calls timeout at 5 seconds

---

## 🔄 CI/CD

GitHub Actions workflows (configured in `.github/workflows/`):

- **Tests**: Run on push to `main` and PRs
- **Build**: TypeScript compilation check
- **Lint**: ESLint validation
- **Coverage**: Jest coverage reporting

---

## 📚 Documentation

- `PHASE_1_COMPLETE.md` - Phase 1 summary (Domain + App)
- `Base/01_ARCHITECT.md` - Architecture decisions
- `Base/07_SECURITY.md` - Security threat model & STRIDE analysis
- `Base/02_TDD_STRATEGY.md` - TDD approach & test structure

---

## 🤝 Contributing

1. Follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`)
2. Write tests before code (TDD)
3. Maintain >70% coverage
4. Run `npm run lint` before commit
5. No modifying existing tests

---

## 📄 License

MIT

---

## 🚀 Deployment

### Railway (Recommended for Backend)

```bash
# Set environment variables in Railway dashboard
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
TMDB_BEARER_TOKEN=
FRONTEND_URL=

# Deploy
git push origin main
```

### Docker

```bash
docker build -t netflix-clone-backend .
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e JWT_ACCESS_SECRET=... \
  netflix-clone-backend
```

---

## 🆘 Troubleshooting

### Tests failing after DB schema change

```bash
npm run prisma:reset
npm test
```

### TypeScript errors

```bash
npm run typecheck
```

### Port already in use

```bash
PORT=3001 npm run dev
```

---

**Backend Status**: ✅ Ready for production after QA Review & SECURITY Audit
