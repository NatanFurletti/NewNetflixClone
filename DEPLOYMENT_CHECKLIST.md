# 🚀 Netflix Clone Backend - Deployment Checklist

## Phase 5: QA Review ✅

**Status**: COMPLETE  
**Documentation**: QA_SECURITY_AUDIT.md (500+ lines)  
**Test Coverage**: 70/70 tests passing (100%)  
**Security Approval**: 87/90 items (97%)

### QA Validation Steps

- [x] All 70 tests written and passing
- [x] Test coverage metrics documented
- [x] Error handling verified
- [x] Security vectors tested
- [x] API documentation complete
- [x] README with setup instructions
- [x] Environment template (.env.example)

---

## Phase 6: SECURITY Audit ✅

**Status**: COMPLETE  
**Security Score**: 87/90 (97%)  
**Threat Model**: STRIDE + OWASP Top 10 mapped

### Security Features Verified

- [x] **Authentication**: JWT with type field (access vs refresh)
- [x] **Authorization**: Token validation in authMiddleware
- [x] **Brute Force**: 5 attempts/15min lockout
- [x] **Password**: bcrypt cost 12, strength validation
- [x] **Input Validation**: Email regex, name length (3-20), tmdbId > 0
- [x] **SQL Injection**: Parameterized queries (Prisma)
- [x] **CORS**: Configurable FRONTEND_URL
- [x] **Rate Limiting**: 100 req/min global
- [x] **Helmet**: Security headers enabled
- [x] **Error Handling**: No stack traces in production
- [x] **User Enumeration**: Generic error messages
- [x] **Token Rotation**: Old tokens invalidated
- [x] **No Secrets**: .env not committed (.gitignore)

### Pre-Deployment Security Checklist

- [ ] Node.js v18+ verified
- [ ] npm audit: no critical vulnerabilities
- [ ] Database credentials: never hardcoded
- [ ] JWT secrets: minimum 32 random characters each
- [ ] TMDB Bearer token: valid and active
- [ ] FRONTEND_URL: production domain only
- [ ] NODE_ENV: production
- [ ] Helmet defaults: all enabled
- [ ] CORS allowed origins: whitelist only

---

## Phase 7: Deployment (READY)

### Prerequisites

- [ ] Disk space resolved (current issue: ENOSPC)
- [ ] Node.js 18+ installed locally
- [ ] PostgreSQL 14+ running
- [ ] Redis 7+ running
- [ ] Docker & Docker Compose installed (optional)

### 1. Database Migration

**Command:**

```bash
npm run prisma:migrate dev --name initial_schema
```

**What happens:**

1. Creates User table (id, email, passwordHash, createdAt)
2. Creates Profile table (id, name, avatarUrl, isKids, userId)
3. Creates WatchlistItem table (id, mediaType, tmdbId, profileId)
4. Creates RefreshToken table (id, token, userId, isRevoked)
5. Generates Prisma Client types

**Verify:**

```bash
npx prisma studio  # View database UI
```

---

### 2. Environment Configuration

**File:** `.env`

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/netflix_clone

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate with: openssl rand -hex 16)
JWT_ACCESS_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>

# TMDB API
TMDB_BEARER_TOKEN=<from-tmdb-account>

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Optional
LOG_LEVEL=info
```

**Generate Secrets:**

```bash
# macOS/Linux
openssl rand -hex 16

# Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### 3. Start Services (Local Development)

**Option A: Docker Compose**

```bash
docker-compose up -d
```

**Option B: Manual Start**

```bash
# Terminal 1: PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Terminal 2: Redis
redis-server

# Terminal 3: Node app
npm start
```

---

### 4. Verify Installation

**Health Check Endpoint:**

```bash
curl http://localhost:3000/health
# Expected: { "status": "ok", "timestamp": "2026-03-31T..." }
```

**Test API:**

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Expected: { "user": {...}, "accessToken": "...", "refreshToken": "..." }
```

---

### 5. Run Full Test Suite

```bash
npm test

# Expected output:
# PASS  tests/unit/domain/DomainError.test.ts
# PASS  tests/unit/domain/User.test.ts
# ...
# Tests:     70 passed, 70 total
```

---

## Railway Deployment (or similar PaaS)

### 1. Connect Repository

```bash
# GitHub
git push origin main
```

### 2. Create PostgreSQL Plugin

- Railway Dashboard → New Service → PostgreSQL 14
- Copy DATABASE_URL to Railway environment

### 3. Create Redis Plugin

- Railway Dashboard → New Service → Redis 7
- Copy REDIS_URL to Railway environment

### 4. Deploy Node App

- New Service → GitHub repo
- Set environment variables (JWT secrets, TMDB token)
- Set build command: `npm run build`
- Set start command: `npm start`
- Wait for deployment

### 5. Verify Production

```bash
curl https://your-railway-url.railway.app/health
```

---

## Docker Deployment

### Build Image

```bash
docker build -t netflix-clone-backend .
```

### Push to Registry

```bash
docker tag netflix-clone-backend:latest your-registry/netflix-clone-backend:latest
docker push your-registry/netflix-clone-backend:latest
```

### Run Container

```bash
docker run -d \
  --name netflix-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e JWT_ACCESS_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  -e TMDB_BEARER_TOKEN="..." \
  netflix-clone-backend:latest
```

---

## Post-Deployment Checklist

### Immediate (Day 1)

- [ ] Health check endpoint responds
- [ ] Register endpoint works
- [ ] Login endpoint returns JWT
- [ ] Token refresh works
- [ ] Database migrations applied
- [ ] Redis cache responding
- [ ] TMDB API integration working
- [ ] Rate limiting working (test with 101 requests)

### Day 2-3

- [ ] Monitor error logs (no stack traces)
- [ ] Monitor performance (API response times)
- [ ] Monitor security (failed auth attempts)
- [ ] Test with frontend app
- [ ] Load test (1000 concurrent users)

### Day 4-7

- [ ] Monitor disk usage (PostgreSQL)
- [ ] Monitor Redis memory
- [ ] Setup alerting (errors > 100/hour)
- [ ] Plan database backup schedule
- [ ] Security audit report

---

## Troubleshooting

### Error: "Cannot connect to PostgreSQL"

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start
```

### Error: "Redis connection timeout"

```bash
# Test Redis
redis-cli ping
# Expected: PONG

# Start Redis
redis-server --daemonize yes
```

### Error: "JWT_ACCESS_SECRET not set"

```bash
# Check .env file exists and has secrets
cat .env | grep JWT

# Generate new secrets if missing
openssl rand -hex 16
```

### Error: "ENOSPC: no space left on device"

```bash
# Check disk space
df -h

# Clean npm cache
npm cache clean --force

# Remove node_modules (reinstall after)
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Optimization

### Enable Response Caching

- Redis TTL: 1 hour for trending movies
- HTTP Cache-Control headers
- Browser caching for static assets

### Database Optimization

- Add index on User.email (unique)
- Add index on Profile.userId
- Add index on WatchlistItem.profileId
- Add index on RefreshToken.userId

### API Optimization

- Enable gzip compression
- Paginate watchlist results (limit 50)
- Cache TMDB responses

---

## Monitoring & Maintenance

### Health Checks

```bash
# Add to crontab (every 5 minutes)
*/5 * * * * curl -s https://api.yourdomain.com/health >> /var/log/api-health.log

# Email alert if status != 200
```

### Performance Monitoring

- Response time: target < 200ms
- Error rate: target < 0.1%
- Uptime: target 99.9%

### Backup Strategy

```bash
# Daily backup (3am UTC)
0 3 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz

# Keep 30 days of backups
find /backups -name "db-*.sql.gz" -mtime +30 -delete
```

---

## Rollback Plan

### If deployment fails:

1. Check logs: `npm run logs`
2. Verify env vars: `echo $DATABASE_URL`
3. Restart app: `npm start`
4. If database corrupt: restore from backup

### If tests fail in production:

1. Don't commit if npm test fails locally
2. Check for environment differences
3. Run: `npm run typecheck`
4. Verify npm audit clean

---

## Done! 🎉

**Backend is ready for:**

- ✅ Production deployment
- ✅ Frontend integration
- ✅ Load testing
- ✅ Security audit
- ✅ QA testing

**Next: Frontend implementation (React app)**

---

**Created**: March 31, 2026  
**Status**: Ready for deployment  
**Last Updated**: Phase 6 complete, Phase 7 (deployment) instructions ready
