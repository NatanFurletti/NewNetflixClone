# 🎬 PROJECT BRIEF: Netflix Clone — Portfolio

> Este arquivo define o projeto **Netflix Clone** para portfólio.
> Leia em conjunto com os arquivos de fundação (`01_ARCHITECT.md` → `07_SECURITY.md`).
> A IA deve seguir **exatamente** a ordem de execução definida em `00_INDEX.md`.

---

## 🎯 Visão Geral do Produto

Clone **funcional** do Netflix com visual fiel ao original, dados reais de filmes via **TMDB API** e backend próprio. Objetivo: demonstrar domínio técnico full-stack para recrutadores e times de engenharia.

### Diferenciais para portfólio
- Visual pixel-perfect do Netflix (não uma aproximação genérica)
- Dados reais: filmes, séries, trailers, pôsteres e backdrops da TMDB
- Autenticação funcional com múltiplos perfis de usuário
- Backend próprio (sincroniza e persiste dados da TMDB localmente)
- Cards animados com hover expand + trailer autoplay ao passar o mouse
- Deploy público acessível por recrutadores

---

## 🔑 Credenciais TMDB

> ⚠️ NUNCA commitar valores reais. Usar exclusivamente via `.env`.
> Regenere suas chaves em: https://www.themoviedb.org/settings/api

```bash
# .env.example — commitar SOMENTE este arquivo
TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here
TMDB_API_KEY=your_tmdb_api_key_here
```

```bash
# .env — NÃO commitar, adicionar ao .gitignore
TMDB_BEARER_TOKEN=<seu_bearer_token_real>
TMDB_API_KEY=<sua_api_key_real>
```

Todas as requisições à TMDB usam o Bearer Token no header:
```
Authorization: Bearer ${TMDB_BEARER_TOKEN}
```

---

## 📡 Endpoints TMDB Consumidos

| Categoria | Endpoint | Uso na UI |
|---|---|---|
| Filmes em tendência | `GET /trending/movie/week` | Hero banner + linha "Em alta" |
| Séries em tendência | `GET /trending/tv/week` | Linha "Séries populares" |
| Filmes populares | `GET /movie/popular` | Linha "Populares no Netflix" |
| Em cartaz | `GET /movie/now_playing` | Linha "Estreias" |
| Top rated | `GET /movie/top_rated` | Linha "Os mais bem avaliados" |
| Detalhes do filme | `GET /movie/{id}` | Modal de detalhes |
| Detalhes da série | `GET /tv/{id}` | Modal de detalhes |
| Trailers | `GET /movie/{id}/videos` | Autoplay no hover do card |
| Trailers série | `GET /tv/{id}/videos` | Autoplay no hover do card |
| Gêneros | `GET /genre/movie/list` | Filtros + categorias |
| Busca | `GET /search/multi?query=` | Barra de busca |
| Similares | `GET /movie/{id}/similar` | Seção "Mais como este" |
| Elenco | `GET /movie/{id}/credits` | Modal de detalhes |

### URLs de Imagem TMDB

```
Base: https://image.tmdb.org/t/p/

Pôster  (cards):    w300 | w500
Backdrop (hero/bg): w1280 | original
Avatar  (elenco):   w185
```

---

## 🏛️ FASE 1 — ARQUITETURA

*A IA deve assumir o papel de ARQUITETO ao iniciar o projeto.*

### Stack Definida

#### Frontend
- **React 18** + **TypeScript** — componentização e type safety
- **Vite** — build tool rápido para desenvolvimento
- **Tailwind CSS** — estilização utilitária, fácil de manter
- **Framer Motion** — animações dos cards e transições
- **React Query (TanStack)** — cache e sincronização de dados da TMDB
- **React Router v6** — navegação SPA
- **Zustand** — estado global leve (usuário, perfil ativo, watchlist)
- **React Player** — embed de trailers do YouTube

#### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** — banco principal (usuários, perfis, watchlist, histórico)
- **Prisma ORM** — type-safe database access
- **Redis** — cache de respostas da TMDB (TTL: 1h para trending, 24h para detalhes)
- **JWT** — autenticação (access token 15min + refresh token 7d)
- **bcrypt** — hash de senhas

#### Infraestrutura
- **Docker + Docker Compose** — ambiente local reproduzível
- **GitHub Actions** — CI com testes automáticos
- **Railway ou Render** — deploy do backend (free tier)
- **Vercel** — deploy do frontend (free tier)

### Estrutura de Pastas

```
netflix-clone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Componentes base (Button, Input, Modal)
│   │   │   ├── cards/            # MovieCard, CardHover, CardExpanded
│   │   │   ├── rows/             # MovieRow (carrossel horizontal)
│   │   │   ├── hero/             # HeroBanner, HeroInfo
│   │   │   ├── nav/              # Navbar, SearchBar, ProfileMenu
│   │   │   └── modals/           # MovieModal, TrailerModal
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Página principal com linhas de filmes
│   │   │   ├── Browse.tsx        # Navegar por gênero/categoria
│   │   │   ├── Search.tsx        # Resultados de busca
│   │   │   ├── Profile.tsx       # Seleção de perfil
│   │   │   ├── Auth.tsx          # Login e cadastro
│   │   │   └── Watchlist.tsx     # Minha lista
│   │   ├── hooks/
│   │   │   ├── useMovies.ts      # Queries TMDB via backend
│   │   │   ├── useAuth.ts        # Autenticação
│   │   │   ├── useProfile.ts     # Perfil ativo
│   │   │   └── useWatchlist.ts   # Adicionar/remover da lista
│   │   ├── store/
│   │   │   ├── authStore.ts      # Zustand: usuário autenticado
│   │   │   └── profileStore.ts   # Zustand: perfil selecionado
│   │   ├── services/
│   │   │   └── api.ts            # Axios instance com interceptors
│   │   ├── types/
│   │   │   ├── movie.types.ts    # Movie, Series, Genre, Video
│   │   │   └── user.types.ts     # User, Profile, WatchlistItem
│   │   └── utils/
│   │       ├── tmdb.ts           # Helpers de URL de imagem
│   │       └── format.ts         # Formatação de datas, duração
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/         # User, Profile, WatchlistItem
│   │   │   └── errors/           # DomainError, NotFoundError, etc.
│   │   ├── application/
│   │   │   ├── usecases/         # CreateUser, Login, AddToWatchlist, etc.
│   │   │   └── interfaces/       # IUserRepository, ICacheService
│   │   ├── infrastructure/
│   │   │   ├── database/         # Prisma client, migrations
│   │   │   ├── cache/            # Redis adapter
│   │   │   └── tmdb/             # TMDB HTTP client (consome a API externa)
│   │   └── interfaces/
│   │       ├── http/
│   │       │   ├── routes/       # auth, movies, profiles, watchlist
│   │       │   ├── middlewares/  # auth, rateLimit, errorHandler
│   │       │   └── controllers/  # Um por rota
│   │       └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

---

## 🗄️ Schema do Banco de Dados

```prisma
// prisma/schema.prisma

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  profiles     Profile[]
  refreshTokens RefreshToken[]
}

model Profile {
  id         String         @id @default(uuid())
  name       String
  avatarUrl  String?
  isKids     Boolean        @default(false)
  userId     String
  user       User           @relation(fields: [userId], references: [id])
  watchlist  WatchlistItem[]
  history    WatchHistory[]
  createdAt  DateTime       @default(now())
}

model WatchlistItem {
  id          String   @id @default(uuid())
  tmdbId      Int
  mediaType   String   // "movie" | "tv"
  title       String
  posterPath  String?
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id])
  addedAt     DateTime @default(now())

  @@unique([profileId, tmdbId, mediaType])
}

model WatchHistory {
  id          String   @id @default(uuid())
  tmdbId      Int
  mediaType   String
  title       String
  posterPath  String?
  watchedAt   DateTime @default(now())
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id])
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## 🎨 UI — Especificação Visual

### Paleta de Cores (fiel ao Netflix)

```css
:root {
  --netflix-red:     #E50914;
  --netflix-red-dark:#B81D24;
  --black:           #000000;
  --dark-bg:         #141414;
  --card-bg:         #181818;
  --text-primary:    #FFFFFF;
  --text-secondary:  #B3B3B3;
  --text-muted:      #808080;
  --overlay-dark:    rgba(0, 0, 0, 0.7);
  --gradient-bottom: linear-gradient(to top, #141414 0%, transparent 100%);
}
```

### Tipografia
- **Font:** Netflix Sans (fallback: `Helvetica Neue, Arial`)
- Títulos: bold, tracking tight
- Corpo: regular, `#B3B3B3`

### Componentes Principais

#### MovieCard — Comportamento de Hover
```
Estado normal:
  - Pôster do filme (aspect ratio 16:9 usando backdrop, ou 2:3 usando poster)
  - Sem texto visível

Hover (delay 400ms para evitar flicker):
  1. Card expande (scale 1.0 → 1.3, z-index elevado)
  2. Trailer do YouTube inicia em mute + autoplay (se disponível)
  3. Aparece painel inferior com:
     - Título do filme
     - Botões: ▶ Play | + Minha Lista | 👍 | 🔽 (mais detalhes)
     - Badges: classificação etária, duração, qualidade (HD)
     - Gêneros como tags
  4. Gradiente escuro cobre parte do trailer

Click no card (ou no 🔽):
  - Modal de detalhes abre com:
    - Trailer em destaque (com som)
    - Sinopse completa
    - Elenco
    - Filmes similares
    - Botão "Adicionar à Minha Lista"
```

#### HeroBanner
```
- Backdrop full-width do filme em destaque (trending #1)
- Gradiente da direita para esquerda (filme visível à direita)
- Gradiente bottom-to-top para fundir com as linhas abaixo
- Título grande com logo do filme (image) ou text fallback
- Sinopse (máx. 3 linhas, truncada)
- Botões: [▶ Assistir] [ℹ Mais informações]
- Rotação automática a cada 8s entre os top 5 trending
- Transição suave com fade entre filmes
```

#### MovieRow (carrossel)
```
- Título da categoria (ex: "Em alta agora")
- Scroll horizontal com setas < > nos extremos
- Setas aparecem somente no hover da row
- Scroll suave com snap
- Lazy loading das imagens
- Mínimo 6 cards visíveis em desktop, 3 em mobile
```

---

## 🔌 API do Backend (endpoints próprios)

O frontend **nunca** acessa a TMDB diretamente. Tudo passa pelo backend próprio.

### Autenticação
```
POST   /api/auth/register        → Criar conta
POST   /api/auth/login           → Login (retorna access + refresh token)
POST   /api/auth/refresh         → Renovar access token
POST   /api/auth/logout          → Invalidar refresh token
```

### Perfis
```
GET    /api/profiles             → Listar perfis do usuário
POST   /api/profiles             → Criar perfil
PUT    /api/profiles/:id         → Editar perfil
DELETE /api/profiles/:id         → Remover perfil
```

### Conteúdo (proxy + cache da TMDB)
```
GET    /api/movies/trending      → Trending filmes (cache Redis 1h)
GET    /api/movies/popular       → Populares (cache 1h)
GET    /api/movies/now-playing   → Em cartaz (cache 1h)
GET    /api/movies/top-rated     → Top rated (cache 6h)
GET    /api/movies/:id           → Detalhes do filme (cache 24h)
GET    /api/movies/:id/trailer   → Trailer do filme (cache 24h)
GET    /api/movies/:id/similar   → Similares (cache 6h)
GET    /api/series/trending      → Trending séries (cache 1h)
GET    /api/series/:id           → Detalhes da série (cache 24h)
GET    /api/search?q=            → Busca multi (sem cache, real-time)
```

### Watchlist e Histórico
```
GET    /api/watchlist            → Minha lista do perfil ativo
POST   /api/watchlist            → Adicionar item
DELETE /api/watchlist/:tmdbId    → Remover item
GET    /api/history              → Histórico de visualização
POST   /api/history              → Registrar visualização
```

---

## 🧪 FASE 2 — TESTES (TDD obrigatório)

*A IA deve assumir o papel de ENGENHEIRO TDD após a aprovação da arquitetura.*

### Comportamentos a testar — Backend

```
AUTH:
  - Dado email válido e senha forte, quando registrar, então conta criada e email confirmado
  - Dado email já cadastrado, quando registrar, então erro 409 sem revelar detalhes
  - Dado credenciais corretas, quando login, então retorna access token (15min) e refresh token (7d)
  - Dado credenciais incorretas, quando login 5x, então conta bloqueada por 15min
  - Dado refresh token válido, quando renovar, então novo access token + rotação do refresh
  - Dado refresh token já usado, quando renovar novamente, então 401 (replay attack)

WATCHLIST:
  - Dado filme não na lista, quando adicionar, então aparece na watchlist do perfil
  - Dado filme já na lista, quando adicionar novamente, então erro 409 (idempotência)
  - Dado filme na lista, quando remover, então não aparece mais

TMDB PROXY:
  - Dado requisição ao /api/movies/trending, então dados vêm da TMDB com cache Redis
  - Dado cache existente, quando requisitar novamente, então resposta < 5ms (cache hit)
  - Dado TMDB offline, quando requisitar, então retorna cache stale com header de aviso

SEGURANÇA:
  - Dado token expirado, quando acessar rota protegida, então 401
  - Dado token de outro usuário, quando acessar watchlist, então 403
  - Dado SQL injection no campo de busca, então sanitizado e sem erro de banco
```

### Comportamentos a testar — Frontend

```
CARDS:
  - Dado card em repouso, quando hover, então expansão animada em 400ms
  - Dado hover por 1s, quando trailer disponível, então inicia autoplay muted
  - Dado hover removido, então card retorna ao tamanho original e trailer para

AUTENTICAÇÃO:
  - Dado formulário de login, quando submeter sem email, então erro de validação inline
  - Dado login bem sucedido, então redireciona para seleção de perfil

WATCHLIST:
  - Dado filme fora da lista, quando clicar em "+", então ícone muda para "✓" otimisticamente
  - Dado erro de rede, então ícone reverte e toast de erro aparece
```

---

## 🔐 FASE 3 — SEGURANÇA (conforme `07_SECURITY.md`)

### Ameaças específicas deste projeto

| Ameaça | Mitigação |
|---|---|
| Exposição da TMDB key | Nunca no frontend — só no backend via env var |
| Enumeration de usuários | Mesma mensagem de erro para email não encontrado e senha errada |
| Brute force no login | Rate limit: 5 tentativas / 15min por IP |
| CSRF em ações de watchlist | JWT stateless + SameSite cookie |
| XSS via dados da TMDB | Sanitizar títulos e sinopses antes de renderizar |
| Scraping da API própria | Rate limiting geral: 100 req/min por IP |
| Tokens de longa duração | Access: 15min, Refresh: 7d com rotação |

### Variáveis de Ambiente

```bash
# backend/.env.example
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/netflix_clone
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me-min-32-chars-random-string
JWT_REFRESH_SECRET=change-me-different-min-32-chars
TMDB_BEARER_TOKEN=your_tmdb_bearer_token_here
TMDB_API_KEY=your_tmdb_api_key_here
CORS_ORIGIN=http://localhost:5173

# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 🚀 FASE 4 — IMPLEMENTAÇÃO (conforme `04_ENGINEER.md`)

*A IA assume papel de ENGENHEIRO somente após testes escritos e aprovados pelo QA.*

### Ordem de implementação sugerida

```
Backend:
  1. Setup: Express + TypeScript + Prisma + Docker Compose
  2. Domain: entidades User, Profile, WatchlistItem + erros de domínio
  3. Infrastructure: Prisma migrations + Redis adapter + TMDB client
  4. Use cases: Register, Login, RefreshToken, Logout
  5. Use cases: CreateProfile, GetProfiles
  6. Use cases: GetTrending (com cache), GetMovieDetails, GetTrailer
  7. Use cases: AddToWatchlist, RemoveFromWatchlist, GetWatchlist
  8. HTTP layer: rotas, middlewares (auth, rate limit, error handler)

Frontend:
  1. Setup: Vite + React + TypeScript + Tailwind + React Query
  2. Serviço de API (axios instance com interceptors de token)
  3. Zustand stores: authStore, profileStore
  4. Páginas: Auth (login/register)
  5. Página: ProfileSelect
  6. Componente: HeroBanner
  7. Componente: MovieCard + hover animation + trailer
  8. Componente: MovieRow (carrossel)
  9. Página: Home (compõe HeroBanner + várias MovieRows)
  10. Componente: MovieModal (detalhes + trailer com som)
  11. Página: Search
  12. Página: Watchlist ("Minha Lista")
  13. Navbar responsiva
```

### Regra crítica de implementação

```
⚠️ O frontend NUNCA chama https://api.themoviedb.org diretamente.
   Toda comunicação com a TMDB é feita pelo backend.
   O frontend só conhece /api/* do backend próprio.
   Isso protege as credenciais e permite cache centralizado.
```

---

## 📱 Responsividade

| Breakpoint | Comportamento |
|---|---|
| Mobile (< 640px) | 2 cards por linha, navbar hamburger, hero simplificado |
| Tablet (640–1024px) | 3 cards por linha, setas de navegação |
| Desktop (> 1024px) | 6 cards por linha, hover expand completo |
| Large (> 1280px) | Layout idêntico ao Netflix original |

---

## 🚢 Deploy

```
Backend  → Railway.app (free tier)
           Variáveis de ambiente configuradas no painel
           PostgreSQL como addon
           Redis como addon

Frontend → Vercel (free tier)
           VITE_API_BASE_URL apontando para backend no Railway

CI/CD    → GitHub Actions
           - Lint + type-check em todo PR
           - Testes unitários e de integração
           - Deploy automático no merge para main
```

---

## ✅ Definition of Done (Projeto Completo)

O projeto está pronto para portfólio quando:

- [ ] Login, cadastro e seleção de perfil funcionando
- [ ] Hero banner com rotação automática de filmes em trending
- [ ] Mínimo 6 linhas de filmes/séries na home
- [ ] Cards com animação de hover + expand + trailer autoplay muted
- [ ] Modal de detalhes com trailer com som + elenco + similares
- [ ] Busca funcional com resultados em tempo real
- [ ] Watchlist ("Minha Lista") persiste no banco
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Deploy público com URL compartilhável
- [ ] README com screenshots, GIF demo e instruções de setup
- [ ] Testes passando no CI (coverage > 70%)
- [ ] Nenhuma credencial exposta no repositório
- [ ] Lighthouse score > 85 em performance

---

## 📸 README do Portfólio (modelo)

O README do projeto deve conter:

```markdown
# 🎬 Netflix Clone

Clone funcional do Netflix com dados reais via TMDB API.

## Demo
[URL do deploy] | [GIF ou vídeo de 30s mostrando as animações]

## Features
- ✅ Autenticação com múltiplos perfis
- ✅ Cards animados com trailer autoplay
- ✅ Dados reais de filmes e séries (TMDB)
- ✅ Watchlist persistida
- ✅ Busca em tempo real
- ✅ Responsivo

## Stack
Frontend: React 18, TypeScript, Tailwind, Framer Motion
Backend:  Node.js, Express, PostgreSQL, Redis, Prisma
CI/CD:    GitHub Actions, Vercel, Railway

## Rodar localmente
[instruções]
```
