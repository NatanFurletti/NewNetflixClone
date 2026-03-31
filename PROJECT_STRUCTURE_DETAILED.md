# 📁 ESTRUTURA COMPLETA DE ARQUIVOS - NETFLIX CLONE
**Auditoria Detalhada - 31 de Março de 2026**

---

## 🗂️ BACKEND - ESTRUTURA COMPLETA (src/)

### Domain Layer - Entidades

```
src/domain/entities/
├── index.ts
├── User.ts
│   ├── class User {
│   │   ├── readonly id: string
│   │   ├── readonly email: string (validado com regex)
│   │   ├── readonly passwordHash: string
│   │   ├── readonly createdAt: Date
│   │   ├── readonly updatedAt: Date
│   │   ├── isValidEmail(): boolean
│   │   └── static create(id, email, passwordHash): User
│   └── }
│
├── Profile.ts
│   ├── class Profile {
│   │   ├── id: string
│   │   ├── userId: string
│   │   ├── name: string
│   │   ├── avatarUrl?: string
│   │   ├── isKids: boolean
│   │   ├── createdAt: Date
│   │   └── updatedAt: Date
│   └── }
│
└── WatchlistItem.ts
    ├── class WatchlistItem {
    │   ├── id: string
    │   ├── profileId: string
    │   ├── tmdbId: number
    │   ├── mediaType: "movie" | "tv"
    │   ├── title: string
    │   ├── posterPath?: string
    │   └── addedAt: Date
    └── }
```

### Domain Layer - Repositórios (Interfaces)

```
src/domain/repositories/
├── index.ts
├── IUserRepository.ts
│   ├── interface IUserRepository {
│   │   ├── create(user): Promise<User>
│   │   ├── findByEmail(email): Promise<User | null>
│   │   ├── findById(id): Promise<User | null>
│   │   └── update(id, user): Promise<User>
│   └── }
│
├── IProfileRepository.ts
│   ├── interface IProfileRepository {
│   │   ├── create(profile): Promise<Profile>
│   │   ├── findByUserId(userId): Promise<Profile[]>
│   │   ├── findById(id): Promise<Profile | null>
│   │   └── delete(id): Promise<void>
│   └── }
│
└── IWatchlistRepository.ts
    ├── interface IWatchlistRepository {
    │   ├── add(item): Promise<WatchlistItem>
    │   ├── getByProfileId(profileId): Promise<WatchlistItem[]>
    │   ├── remove(id): Promise<void>
    │   └── findByProfileAndTmdb(profileId, tmdbId): Promise<WatchlistItem | null>
    └── }
```

### Domain Layer - Erros

```
src/domain/errors/
├── index.ts
└── DomainError.ts
    ├── interface DomainError extends Error
    ├── class InvalidEmailError extends DomainError
    ├── class DuplicateEmailError extends DomainError
    ├── class WeakPasswordError extends DomainError
    ├── class UnauthorizedError extends DomainError
    ├── class NotFoundError extends DomainError
    └── class InvalidTokenError extends DomainError
```

### Application Layer - Use Cases

```
src/application/usecases/
├── index.ts
│   └── Export de todos os 9 use cases
│
├── RegisterUser.ts
│   ├── execute(input: { email, password })
│   ├── Valida email formato
│   ├── Valida força de senha
│   ├── Verificar duplicidade de email
│   ├── Hash de password
│   └── Retorna: { id, email }
│
├── Login.ts
│   ├── execute(input: { email, password })
│   ├── Find user por email
│   ├── Comparar password hasheada
│   ├── Gerar JWT access token
│   ├── Gerar JWT refresh token
│   └── Retorna: { accessToken, refreshToken, user }
│
├── RefreshToken.ts
│   ├── execute(input: { refreshToken })
│   ├── Validar refresh token
│   ├── Verificar se está revogado
│   ├── Gerar novo access token
│   └── Retorna: { accessToken }
│
├── CreateProfile.ts
│   ├── execute(input: { userId, name, avatarUrl, isKids })
│   ├── Validar duplicidade (userId + name)
│   ├── Criar profile no repository
│   └── Retorna: Profile criado
│
├── GetProfiles.ts
│   ├── execute(input: { userId })
│   ├── Buscar todos os perfis do usuário
│   └── Retorna: Profile[]
│
├── AddToWatchlist.ts
│   ├── execute(input: { profileId, tmdbId, mediaType, title, posterPath })
│   ├── Validar unicidade (profileId + tmdbId + mediaType)
│   ├── Criar WatchlistItem
│   └── Retorna: WatchlistItem criado
│
├── RemoveFromWatchlist.ts
│   ├── execute(input: { watchlistItemId })
│   ├── Remover item do repository
│   └── Retorna: { message: "Removed" }
│
├── GetWatchlistItems.ts
│   ├── execute(input: { profileId })
│   ├── Buscar todos os itens do perfil
│   └── Retorna: WatchlistItem[]
│
└── GetTrendingMovies.ts
    ├── execute(input: { mediaType, language })
    ├── Verificar cache Redis
    ├── Se cache miss → Chamar TMDB API
    ├── Cachear resultado (TTL)
    └── Retorna: Trending movies/tv shows
```

### Application Layer - Serviços

```
src/application/services/
├── index.ts
├── PasswordService.ts
│   ├── static PASSWORD_MIN_LENGTH = 8
│   ├── static PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
│   ├── static isStrong(password): boolean
│   ├── static validateStrength(password): void
│   ├── static hash(password): Promise<string>
│   └── static compare(password, hash): Promise<boolean>
│
└── TokenService.ts
    ├── static generateAccessToken(userId, secret): string
    ├── static generateRefreshToken(userId, secret): string
    ├── static validateToken(token, secret): TokenPayload
    └── interface TokenPayload { sub, type, exp }
```

### Infrastructure Layer - Repositories (Implementação)

```
src/infrastructure/repositories/
├── index.ts
├── PrismaUserRepository.ts
│   ├── constructor(private prisma: PrismaClient)
│   ├── async create(user): Promise<User>
│   ├── async findByEmail(email): Promise<User | null>
│   ├── async findById(id): Promise<User | null>
│   └── async update(id, user): Promise<User>
│
├── PrismaProfileRepository.ts
│   ├── constructor(private prisma: PrismaClient)
│   ├── async create(profile): Promise<Profile>
│   ├── async findByUserId(userId): Promise<Profile[]>
│   ├── async findById(id): Promise<Profile | null>
│   └── async delete(id): Promise<void>
│
└── PrismaWatchlistRepository.ts
    ├── constructor(private prisma: PrismaClient)
    ├── async add(item): Promise<WatchlistItem>
    ├── async getByProfileId(profileId): Promise<WatchlistItem[]>
    ├── async remove(id): Promise<void>
    └── async findByProfileAndTmdb(profileId, tmdbId): Promise<WatchlistItem | null>
```

### Infrastructure Layer - Cache e Serviços

```
src/infrastructure/
├── cache/
│   ├── index.ts
│   ├── RedisCache.ts
│   │   ├── class RedisCache {
│   │   │   ├── private client: RedisClient
│   │   │   ├── private inMemoryCache: Map
│   │   │   ├── async get(key): Promise<any>
│   │   │   ├── async set(key, value, ttl): Promise<void>
│   │   │   ├── async delete(key): Promise<void>
│   │   │   └── async clear(): Promise<void>
│   │   └── }
│   │
│   └── InMemoryCache (fallback se Redis indisponível)
│
├── external/
│   ├── index.ts
│   ├── TmdbClient.ts
│   │   ├── class TmdbClient {
│   │   │   ├── private baseUrl = "https://api.themoviedb.org/3"
│   │   │   ├── private timeout = 5000
│   │   │   ├── private bearerToken: string
│   │   │   ├── async getTrending(mediaType, language): Promise<TrendingResult>
│   │   │   ├── async search(query, language): Promise<SearchResult>
│   │   │   └── async getDetails(mediaType, id, language): Promise<DetailResult>
│   │   └── }
│   │
│   └── tmdb/
│       ├── types.ts (interfaces TMDB)
│       └── constants.ts (endpoints TMDB)
│
└── services/
    ├── index.ts
    └── RedisCache.ts (pode estar duplicado, consolidar)
```

### Interfaces Layer - Controllers

```
src/interfaces/controllers/
├── index.ts
├── AuthController.ts
│   ├── constructor(
│   │   private registerUserUseCase: RegisterUserUseCase,
│   │   private loginUseCase: LoginUseCase,
│   │   private refreshTokenUseCase: RefreshTokenUseCase
│   │ )
│   ├── async register(req, res): Promise<void>
│   ├── async login(req, res): Promise<void>
│   └── async refreshToken(req, res): Promise<void>
│
├── ProfileController.ts
│   ├── constructor(
│   │   private createProfileUseCase: CreateProfileUseCase,
│   │   private getProfilesUseCase: GetProfilesUseCase
│   │ )
│   ├── async create(req, res): Promise<void>
│   └── async list(req, res): Promise<void>
│
└── WatchlistController.ts
    ├── constructor(
    │   private addToWatchlistUseCase: AddToWatchlistUseCase,
    │   private removeFromWatchlistUseCase: RemoveFromWatchlistUseCase,
    │   private getWatchlistItemsUseCase: GetWatchlistItemsUseCase
    │ )
    ├── async add(req, res): Promise<void>
    ├── async remove(req, res): Promise<void>
    └── async list(req, res): Promise<void>
```

### Interfaces Layer - Rotas

```
src/interfaces/routes/
├── index.ts [EXPORTA: createAuthRoutes, createProfileRoutes, createWatchlistRoutes]
├── authRoutes.ts
│   ├── POST /register
│   ├── POST /login
│   └── POST /refresh
│
├── profileRoutes.ts
│   ├── POST /
│   └── GET /
│
└── watchlistRoutes.ts
    ├── GET /:profileId
    ├── POST /
    └── DELETE /:watchlistItemId
```

### Interfaces Layer - App Configuration

```
src/interfaces/app.ts
├── createApp(prisma: PrismaClient, jwtAccessSecret, jwtRefreshSecret): Express
├── Middleware Stack:
│   ├── helmet() - Security headers
│   ├── cors() - CORS configuration
│   ├── express.json() - JSON parsing
│   └── rateLimit() - Rate limiting (100 req/min)
├── Repository Initialization
├── UseCase Initialization
├── External Services (TMDB, Redis)
├── Controller Initialization
└── Routes Mounting:
    ├── /api/auth
    ├── /api/profiles (protegida)
    └── /api/watchlist (protegida)
```

### Interfaces Layer - Middlewares

```
src/interfaces/middlewares/
├── index.ts [EXPORTA: authMiddleware, errorHandler]
├── authMiddleware.ts
│   ├── Valida Bearer token
│   ├── Verifica JWT no Authorization header
│   ├── Valida token type (access vs refresh)
│   ├── Injeta userId em req.userId
│   └── Status 401 se inválido
│
└── errorHandler.ts
    ├── Captura erros da aplicação
    ├── Formata resposta de erro
    ├── Loga erros em modo debug
    └── Status 400/401/500 apropriado
```

---

## 🎨 FRONTEND - ESTRUTURA COMPLETA

### App Router Pages

```
frontend/app/
├── layout.tsx
│   ├── export default function RootLayout({ children })
│   ├── AuthProvider wrapper
│   ├── Globals CSS import
│   └── Metadata configuration
│
├── page.tsx (HOME - /)
│   ├── "use client"
│   ├── Netflix header/branding
│   ├── Hero section
│   ├── CTA buttons (Sign In / Sign Up)
│   └── Responsive design
│
├── auth/
│   ├── login/
│   │   └── page.tsx
│   │       ├── LoginForm component
│   │       ├── Email input
│   │       ├── Password input
│   │       ├── Submit button
│   │       └── Register link
│   │
│   └── register/
│       └── page.tsx
│           ├── RegisterForm component
│           ├── Email input
│           ├── Password input
│           ├── Confirm password
│           ├── Terms checkbox
│           └── Login link
│
├── dashboard/
│   ├── layout.tsx
│   │   ├── Protected route layout
│   │   ├── Navigation sidebar
│   │   ├── User profile dropdown
│   │   └── Logout button
│   │
│   └── page.tsx (/dashboard)
│       ├── Profile selector
│       ├── Movie grid/carousel
│       ├── Featured movie section
│       ├── Categories/rows
│       └── Search functionality
│
├── trending/
│   └── page.tsx (/trending)
│       ├── Trending movies section
│       ├── Trending TV section
│       ├── Filter options
│       └── Pagination
│
└── globals.css
    ├── Base styles
    ├── Tailwind imports
    └── Custom variables
```

### Context API - Estado Global

```
frontend/contexts/auth.tsx
├── interface User {
│   ├── id: string
│   ├── email: string
│   ├── profiles: Profile[]
│   └── createdAt: Date
│ }
│
├── interface AuthContextType {
│   ├── user: User | null
│   ├── isAuthenticated: boolean
│   ├── isLoading: boolean
│   ├── login(email, password): Promise<void>
│   ├── register(email, password): Promise<void>
│   ├── logout(): void
│   └── // Possíveis adições:
│   ├── updateProfile(profile): Promise<void>
│   └── changePassword(old, new): Promise<void>
│ }
│
├── const AuthContext = createContext<AuthContextType>()
│
├── export function AuthProvider({ children })
│   ├── useState<User | null>
│   ├── useState<boolean> isLoading
│   ├── useEffect(() => { checkAuth on mount })
│   ├── async login(email, password)
│   ├── async register(email, password)
│   ├── logout()
│   └── value provider
│
└── export function useAuth()
    └── return useContext(AuthContext)
```

### API Client (Interceptadores)

```
frontend/lib/api/client.ts
├── const API_URL = process.env.NEXT_PUBLIC_API_URL
│
├── const apiClient = axios.create({
│   ├── baseURL: API_URL
│   └── headers: { "Content-Type": "application/json" }
│ })
│
├── Request Interceptor
│   ├── if (typeof window !== "undefined") // SSR check
│   ├── Get access_token from localStorage
│   ├── Add Authorization header
│   └── config.headers.Authorization = `Bearer ${token}`
│
├── Response Interceptor
│   ├── if (error.response?.status === 401)
│   ├── Get refresh_token from localStorage
│   ├── POST /auth/refresh
│   ├── Update localStorage tokens
│   ├── Retry original request
│   └── catch: logout() if refresh fails
│
└── export default apiClient
```

### Componentes Structure

```
frontend/components/
├── auth/
│   ├── LoginForm.tsx (preparado para implementação)
│   ├── RegisterForm.tsx (preparado para implementação)
│   ├── ProtectedRoute.tsx (wrapper)
│   └── AuthGuard.tsx (HOC)
│
├── movies/
│   ├── MovieCard.tsx (preparado)
│   ├── MovieGrid.tsx (preparado)
│   ├── MovieCarousel.tsx (preparado)
│   ├── FeaturedMovie.tsx (preparado)
│   ├── MovieRow.tsx (preparado)
│   └── MovieDetails.tsx (preparado)
│
└── ui/
    ├── Button.tsx (preparado)
    ├── Input.tsx (preparado)
    ├── Modal.tsx (preparado)
    ├── Loading.tsx (preparado)
    ├── Toast.tsx (preparado)
    ├── Navbar.tsx (preparado)
    └── ProfileSelector.tsx (preparado)

frontend/src/components/
├── cards/
│   ├── MovieCard.tsx
│   ├── SeriesCard.tsx
│   └── ProfileCard.tsx
│
├── hero/
│   ├── HeroSection.tsx
│   ├── HeroCarousel.tsx
│   └── Featured.tsx
│
├── modals/
│   ├── MovieModal.tsx
│   ├── ProfileModal.tsx
│   └── ConfirmModal.tsx
│
├── nav/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── ProfileDropdown.tsx
│
├── rows/
│   ├── MovieRow.tsx
│   ├── CategoryRow.tsx
│   └── SearchResults.tsx
│
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Loading.tsx
    ├── Toast.tsx
    └── Dropdown.tsx
```

### Services e Hooks

```
frontend/services/
├── moviesService.ts
│   ├── getTrending()
│   ├── getPopular()
│   ├── search(query)
│   └── getDetails(id)
│
├── authService.ts
│   ├── login(email, password)
│   ├── register(email, password)
│   ├── logout()
│   └── refreshToken()
│
└── watchlistService.ts
    ├── addToWatchlist(profileId, tmdbId)
    ├── getWatchlist(profileId)
    └── removeFromWatchlist(watchlistItemId)

frontend/hooks/
├── useAuth.ts
│   ├── Wrapper do AuthContext
│   └── Tipagem

├── useFetch.ts (preparado)
│   ├── Wrapper do axios
│   └── Loading, error states

├── useProfile.ts (preparado)
│   ├── Gerenciar profile selecionado
│   └── Cache

└── usePagination.ts (preparado)
    ├── Lógica de paginação
    └── Estados
```

### Store (State Management)

```
frontend/src/store/
├── authStore.ts (com Zustand)
│   ├── user: User | null
│   ├── isAuthenticated: boolean
│   ├── setUser(user)
│   ├── logout()
│   └── setAuthState(state)
│
├── moviesStore.ts (com Zustand)
│   ├── trendingMovies: Movie[]
│   ├── selectedMovie: Movie | null
│   ├── filters: MovieFilters
│   ├── setTrendingMovies(movies)
│   ├── selectMovie(movie)
│   └── setFilters(filters)
│
├── profileStore.ts (com Zustand)
│   ├── selectedProfile: Profile | null
│   ├── userProfiles: Profile[]
│   ├── setSelectedProfile(profile)
│   └── setUserProfiles(profiles)
│
└── uiStore.ts (com Zustand)
    ├── isModalOpen: boolean
    ├── modalContent: any
    ├── openModal(content)
    └── closeModal()
```

### Tipos TypeScript

```
frontend/types/index.ts
├── interface User {
│   ├── id: string
│   ├── email: string
│   ├── profiles: Profile[]
│   └── createdAt: Date
│ }
│
├── interface Profile {
│   ├── id: string
│   ├── userId: string
│   ├── name: string
│   ├── avatarUrl: string
│   ├── isKids: boolean
│   └── createdAt: Date
│ }
│
├── interface Movie {
│   ├── id: number
│   ├── tmdbId: number
│   ├── title: string
│   ├── description: string
│   ├── posterPath: string
│   ├── backdropPath: string
│   ├── releaseDate: Date
│   ├── rating: number
│   └── mediaType: "movie" | "tv"
│ }
│
├── interface WatchlistItem {
│   ├── id: string
│   ├── profileId: string
│   ├── tmdbId: number
│   ├── mediaType: string
│   ├── title: string
│   ├── posterPath: string
│   └── addedAt: Date
│ }
│
└── interface AuthResponse {
    ├── accessToken: string
    ├── refreshToken: string
    │ user: User
    └── }
```

### Testes Structure

```
frontend/tests/
├── unit/
│   ├── contexts/
│   │   ├── __tests__/auth.context.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── __tests__/useAuth.test.ts
│   │   └── ...
│   └── utils/
│       ├── __tests__/formatters.test.ts
│       └── ...
│
├── integration/
│   ├── api.integration.test.ts
│   ├── auth-flow.integration.test.tsx
│   └── watchlist.integration.test.tsx
│
└── e2e/
    ├── login.e2e.test.ts
    ├── dashboard.e2e.test.ts
    └── watchlist.e2e.test.ts
```

---

## 🔗 DETALHAMENTO DE ENDPOINTS

### Auth Endpoints

```
┌───────────────────────────────────────────────────────────┐
│ POST /api/auth/register                                   │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Registrar novo usuário                         │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ {                                                          │
│   "email": "user@example.com",                            │
│   "password": "SecurePass123"                             │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (201):                                            │
│ {                                                          │
│   "id": "cuid123456...",                                  │
│   "email": "user@example.com"                             │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 400: InvalidEmailError - Email inválido                   │
│ 400: WeakPasswordError - Senha fraca                      │
│ 409: DuplicateEmailError - Email já registrado            │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ POST /api/auth/login                                      │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Autenticar usuário                             │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ {                                                          │
│   "email": "user@example.com",                            │
│   "password": "SecurePass123"                             │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (200):                                            │
│ {                                                          │
│   "accessToken": "eyJhbGc...",                            │
│   "refreshToken": "eyJhbGc...",                           │
│   "user": {                                                │
│     "id": "cuid...",                                      │
│     "email": "user@example.com",                          │
│     "profiles": []                                        │
│   }                                                        │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Credenciais inválidas                                │
│ 404: Usuário não encontrado                               │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ POST /api/auth/refresh                                    │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Renovar access token                           │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ {                                                          │
│   "refreshToken": "eyJhbGc..."                            │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (200):                                            │
│ {                                                          │
│   "accessToken": "eyJhbGc..."                             │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Refresh token expirado                               │
│ 401: Refresh token revogado                               │
└───────────────────────────────────────────────────────────┘
```

### Profile Endpoints

```
┌───────────────────────────────────────────────────────────┐
│ POST /api/profiles                                        │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Criar novo perfil                              │
│ AUTH: ✅ Bearer Token obrigatório                         │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ Headers: { Authorization: "Bearer <token>" }             │
│ Body:                                                      │
│ {                                                          │
│   "name": "Meu Perfil",                                   │
│   "avatarUrl": "https://...",                             │
│   "isKids": false                                         │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (201):                                            │
│ {                                                          │
│   "id": "cuid...",                                        │
│   "userId": "cuid...",                                    │
│   "name": "Meu Perfil",                                   │
│   "avatarUrl": "https://...",                             │
│   "isKids": false,                                        │
│   "createdAt": "2024-03-31T10:00:00Z",                   │
│   "updatedAt": "2024-03-31T10:00:00Z"                    │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Sem autenticação                                     │
│ 409: Perfil com esse nome já existe                       │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ GET /api/profiles                                         │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Listar perfis do usuário                       │
│ AUTH: ✅ Bearer Token obrigatório                         │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ Headers: { Authorization: "Bearer <token>" }             │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (200):                                            │
│ [                                                          │
│   {                                                        │
│     "id": "cuid...",                                      │
│     "userId": "cuid...",                                  │
│     "name": "Perfil 1",                                   │
│     "isKids": false,                                      │
│     ...                                                    │
│   },                                                       │
│   {                                                        │
│     "id": "cuid...",                                      │
│     "userId": "cuid...",                                  │
│     "name": "Perfil Infantil",                            │
│     "isKids": true,                                       │
│     ...                                                    │
│   }                                                        │
│ ]                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Sem autenticação                                     │
└───────────────────────────────────────────────────────────┘
```

### Watchlist Endpoints

```
┌───────────────────────────────────────────────────────────┐
│ GET /api/watchlist/:profileId                             │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Listar itens da watchlist                      │
│ AUTH: ✅ Bearer Token obrigatório                         │
├───────────────────────────────────────────────────────────┤
│ PARAMS:                                                    │
│ profileId: "cuid..." (ID do perfil)                       │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (200):                                            │
│ [                                                          │
│   {                                                        │
│     "id": "cuid...",                                      │
│     "profileId": "cuid...",                               │
│     "tmdbId": 550,                                        │
│     "mediaType": "movie",                                 │
│     "title": "Fight Club",                                │
│     "posterPath": "/pP...",                               │
│     "addedAt": "2024-03-31T10:00:00Z"                    │
│   },                                                       │
│   ...                                                      │
│ ]                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Sem autenticação                                     │
│ 404: Perfil não encontrado                                │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ POST /api/watchlist                                       │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Adicionar item à watchlist                     │
│ AUTH: ✅ Bearer Token obrigatório                         │
├───────────────────────────────────────────────────────────┤
│ REQUEST:                                                   │
│ {                                                          │
│   "profileId": "cuid...",                                 │
│   "tmdbId": 550,                                          │
│   "mediaType": "movie",                                   │
│   "title": "Fight Club",                                  │
│   "posterPath": "/pP..."                                  │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (201):                                            │
│ {                                                          │
│   "id": "cuid...",                                        │
│   "profileId": "cuid...",                                 │
│   "tmdbId": 550,                                          │
│   "mediaType": "movie",                                   │
│   "title": "Fight Club",                                  │
│   "posterPath": "/pP...",                                 │
│   "addedAt": "2024-03-31T10:00:00Z"                      │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Sem autenticação                                     │
│ 409: Item já existe na watchlist                          │
│ 404: Perfil não encontrado                                │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ DELETE /api/watchlist/:watchlistItemId                    │
├───────────────────────────────────────────────────────────┤
│ DESCRIÇÃO: Remover item da watchlist                      │
│ AUTH: ✅ Bearer Token obrigatório                         │
├───────────────────────────────────────────────────────────┤
│ PARAMS:                                                    │
│ watchlistItemId: "cuid..." (ID do item)                   │
├───────────────────────────────────────────────────────────┤
│ RESPONSE (200):                                            │
│ {                                                          │
│   "message": "Item removido com sucesso"                  │
│ }                                                          │
├───────────────────────────────────────────────────────────┤
│ ERROS:                                                     │
│ 401: Sem autenticação                                     │
│ 404: Item não encontrado                                  │
└───────────────────────────────────────────────────────────┘
```

---

## 📦 DEPENDÊNCIAS COMPLETAS

### Backend dependencies.json

```json
{
  "@prisma/client": "^5.8.0",     // ORM
  "axios": "^1.6.2",              // HTTP Client
  "bcryptjs": "^2.4.3",           // Password hashing
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.3.1",            // Environment variables
  "express": "^4.18.2",           // Web framework
  "express-rate-limit": "^7.0.0", // Rate limiting
  "helmet": "^7.1.0",             // Security headers
  "jsonwebtoken": "^9.0.2",       // JWT
  "redis": "^4.6.13",             // Cache
  "typescript": "^5.3.3",         // Language
  "uuid": "^9.0.1",               // ID generation
  "zod": "^3.22.4"                // Schema validation
}

devDependencies: {
  "@types/*": "latest",           // Type definitions
  "@typescript-eslint/*": "6+",   // Linting
  "eslint": "8+",                 // Code quality
  "jest": "29+",                  // Testing
  "prettier": "3+",               // Code formatting
  "prisma": "5.8+",               // Migrations
  "supertest": "6+",              // HTTP testing
  "ts-jest": "29+",               // Jest + TypeScript
  "tsx": "4+"                     // TypeScript executor
}
```

### Frontend package.json

```json
{
  "@hookform/resolvers": "^3.3.4",        // Form resolvers
  "@tanstack/react-query": "^5.37.1",    // Server state
  "@types/node": "^20.11.20",             // Node types
  "@types/react": "^18.2.42",             // React types
  "@types/react-dom": "^18.2.17",        // React DOM types
  "axios": "^1.6.7",                      // HTTP client
  "class-variance-authority": "^0.7.0",   // CVA utility
  "clsx": "^2.0.0",                       // Class names
  "date-fns": "^3.3.1",                   // Date utilities
  "lucide-react": "^0.378.0",             // Icons
  "next": "^14.1.4",                      // Framework
  "react": "^18.2.0",                     // Library
  "react-dom": "^18.2.0",                 // DOM binding
  "react-hook-form": "^7.50.1",           // Form management
  "react-hot-toast": "^2.4.1",            // Notifications
  "tailwind-merge": "^2.2.2",             // Tailwind merge
  "tailwindcss-animate": "^1.0.7",        // Animations
  "typescript": "^5.3.3",                 // Language
  "zustand": "^4.4.5"                     // State manager
}

devDependencies: {
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/react": "^14.1.2",
  "@types/jest": "^29.5.11",
  "autoprefixer": "^10.4.17",
  "eslint": "8+",
  "eslint-config-next": "14+",
  "jest": "29+",
  "jest-environment-jsdom": "29+",
  "postcss": "8+",
  "tailwindcss": "3+",
  "typescript": "5+"
}
```

---

## 🔧 CONFIGURAÇÃO DE SISTEMA

### Docker Compose Services

```yaml
Services:
  postgres:15-alpine
    ├── Container: netflix-clone-postgres
    ├── Port: 5432
    ├── Volumes: postgres_data
    ├── Healthcheck: pg_isready
    └── Network: netflix-network

  redis:7-alpine
    ├── Container: netflix-clone-redis
    ├── Port: 6379
    ├── Memory: 256MB
    ├── Eviction: allkeys-lru
    ├── Healthcheck: redis-cli ping
    └── Network: netflix-network

Network: netflix-network
Volumes: postgres_data, redis_data
```

### Scripts Build

```bash
Backend:
  npm run dev              # tsx watch (hot reload)
  npm run build            # tsc
  npm start                # node dist/index.js
  npm test                 # jest --coverage
  npm run lint             # eslint
  npm run prisma:migrate   # Handle migrations
  npm run docker:up        # Start containers

Frontend:
  npm run dev              # next dev (port 3000)
  npm run build            # next build
  npm start                # next start
  npm test                 # jest
  npm run lint             # next lint
```

---

**FIM DO DOCUMENTO DE ESTRUTURA COMPLETA**  
*Gerado em 31 de Março de 2026 para Auditoria QA*
