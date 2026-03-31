# 🧪 Netflix Clone — Mapeamento de Comportamentos (TDD)

> Este arquivo mapeia TODOS os comportamentos esperados em linguagem natural.
> Formato: **Dado [contexto], quando [ação], então [resultado esperado]**

---

## 🔐 AUTENTICAÇÃO

### Registration

```
Dado: Email válido e senha forte (8+ chars, maiúscula, número, caractere especial)
Quando: Submeter formulário de registro
Então: Conta criada com sucesso, email confirmado, redirect para seleção de perfil

Dado: Email já cadastrado
Quando: Tentar registrar novamente
Então: Erro 409, mensagem "Email já existe" SEM revelar se já está confirmado

Dado: Entrada inválida (email mal formado, senha fraca)
Quando: Tentar registrar
Então: Validação inline no frontend, nenhuma chamada ao backend

Dado: Passwords mism identidade em formulário de registro
Quando: Submeter com passwords diferentes
Então: Erro de validação frontend, nenhuma chamada ao backend

Dado: Input com SQL injection ou XSS
Quando: Tentar registrar
Então: Input sanitizado, conta não criada, nenhum erro exibido
```

### Login

```
Dado: Email e senha corretos
Quando: Submeter login
Então: Retorna access token (15min), refresh token (7d), redirect para SelectProfile

Dado: Email correto, senha incorreta
Quando: Submeter login (primeira vez)
Então: Erro 401, mensagem genérica "Credenciais inválidas"

Dado: Email ou usuário não encontrado
Quando: Submeter login
Então: Erro 401, mensagem MESMA que senha incorreta (user enumeration prevention)

Dado: 5 tentativas falhadas de login no espaço de 15 minutos
Quando: 6ª tentativa
Então: Conta bloqueada por 15 minutos, erro 429 com mensagem clara

Dado: Conta bloqueada
Quando: Tentar login antes dos 15 minutos
Então: Erro 429 "Tente novamente em X segundos"

Dado: Token expirado
Quando: Tentar acessar rota protegida
Então: Interceptor redireciona para refresh token, se também expirado → login
```

### Refresh Token Rotation

```
Dado: Access token válido mas expirado
Quando: Submeter refresh token válido
Então: Novo access token emitido, novo refresh token emitido, ANTIGO refresh invalidado

Dado: Refresh token já usado/rotacionado
Quando: Tentar usar novamente (replay attack)
Então: Erro 401 "Token inválido, faça login novamente"

Dado: Refresh token expirado (> 7 dias)
Quando: Tentar usar
Então: Erro 401, redirect para login
```

### Logout

```
Dado: Usuário autenticado
Quando: Clicar em logout
Então: Refresh token revogado, access token limpado, redirect para login

Dado: Token revogado
Quando: Tentar usar após logout
Então: Erro 401 "Não autorizado"
```

---

## 👥 PERFIS

### Criar Perfil

```
Dado: Usuário autenticado, nome válido (3-20 chars)
Quando: Criar novo perfil
Então: Perfil criado com avatar padrão, adicionado à lista de perfis do usuário

Dado: Usuário com 4 perfis existentes (limite atingido)
Quando: Tentar criar 5º perfil
Então: Erro 400 "Limite de perfis atingido"

Dado: Nome do perfil vazio ou com < 3 caracteres
Quando: Tentar criar
Então: Erro de validação frontend, nenhuma chamada ao backend
```

### Listar Perfis

```
Dado: Usuário com 3 perfis criados
Quando: Acessar GET /api/profiles
Então: Retorna array com 3 perfis (id, name, avatarUrl, isKids)

Dado: Usuário novo, nenhum perfil ainda
Quando: Acessar GET /api/profiles
Então: Retorna array vazio []
```

### Selecionar Perfil Ativo

```
Dado: Usuário autenticado, 3 perfis disponíveis
Quando: Selecionar perfil por ID
Então: Perfil marcado como ativo, localStorage atualizado, watchlist do perfil carregada

Dado: Usuário tenta acessar perfil de outro usuário
Quando: Submeter outro userId com profileId
Então: Erro 403 "Acesso negado"
```

### Deletar Perfil

```
Dado: Usuário com perfil (watchlist vazia)
Quando: Deletar perfil
Então: Perfil removido, watchlist associada deletada, redirect para seleção de perfil

Dado: Último perfil do usuário
Quando: Tentar deletar
Então: Erro 400 "Usuário deve ter pelo menos um perfil"

Dado: Outro usuário tenta deletar meu perfil
Quando: Submeter DELETE /api/profiles/:myProfileId
Então: Erro 403 (não consegue acessar meu profile)
```

---

## 🎬 CONTEÚDO (Proxy da TMDB)

### Trending Filmes

```
Dado: TMDB online, primeira chamada
Quando: GET /api/movies/trending
Então: Retorna 20 filmes trending com id, title, posterPath, backdropPath, releaseDate, vote_average

Dado: Chamada anterior em menos de 1 hora
Quando: GET /api/movies/trending
Então: Resposta vem do Redis (< 5ms), header X-Cache: HIT

Dado: TMDB_BEARER_TOKEN inválido/expirado
Quando: GET /api/movies/trending
Então: Erro 500 "Erro ao conectar TMDB" (SEM expor detalhes)

Dado: TMDB offline, cache existente (stale)
Quando: GET /api/movies/trending
Então: Retorna dados do cache com header X-Cache: STALE_FALLBACK
```

### Detalhes do Filme

```
Dado: filme ID válido (123), TMDB online
Quando: GET /api/movies/123
Então: Retorna objeto completo {id, title, overview, genres, runtime, releaseDate, credits[], videos[]}

Dado: filme ID inexistente (999999)
Quando: GET /api/movies/999999
Então: Erro 404 "Filme não encontrado"

Dado: ID como string malformada ("abc")
Quando: GET /api/movies/abc
Então: Erro 400 "ID deve ser número"
```

### Trailers

```
Dado: Filme com vídeos disponíveis na TMDB
Quando: GET /api/movies/123/trailer
Então: Retorna primeiro YouTube video: {key: "youtube_id", name, type: "Trailer"}

Dado: Filme sem vídeos
Quando: GET /api/movies/123/trailer
Então: Retorna null ou status 204 No Content

Dado: Vídeo expirado no YouTube
Quando: Frontend tenta reproduzir
Então: Player exibe erro e esconde trailer (graceful degradation)
```

### Busca

```
Dado: Termo de busca válido ("Inception"), TMDB online
Quando: GET /api/search?q=Inception
Então: Retorna mix de filmes e séries (multi search), máximo 20 resultados

Dado: Termo vazio ou < 2 caracteres
Quando: GET /api/search?q=a
Então: Erro 400 "Termo deve ter pelo menos 2 caracteres"

Dado: Termo com < 2 caracteres submetido do frontend
Quando: Usuario tenta buscar
Então: Frontend bloqueia submissão (validação inline)

Dado: Termo com SQL injection ("' OR '1'='1")
Quando: GET /api/search?q=...
Então: Tratado como busca literal (escapado), nenhum resultado ou erro apropriado

Dado: Múltiplas buscas em paralelo (3x simultaneamente)
Quando: Submeter
Então: Rate limit: máx 5 buscas/minuto por usuário, 6ª retorna 429
```

---

## ⭐ WATCHLIST

### Adicionar à Watchlist

```
Dado: Usuário autenticado, filme NOT na watchlist
Quando: Clicar em "+ Minha Lista" no card
Então: Filme adicionado à watchlist, ícone muda para "✓", UI otimista (não espera resposta)

Dado: Erro de rede ao adicionar
Quando: Falha na request
Então: Ícone reverte para "+", toast mostra "Falha ao adicionar"

Dado: Filme já na watchlist
Quando: Tentar adicionar novamente (idempotência)
Então: Erro 409 "Já está na sua lista", ícone permanece "✓"

Dado: Usuário com 500 itens na watchlist
Quando: Adicionar 501º item
Então: Erro 400 "Limite de itens na watchlist atingido"
```

### Remover da Watchlist

```
Dado: Filme na watchlist do usuário
Quando: Clicar em "✓" (remover)
Então: Filme removido, ícone muda para "+", UI otimista

Dado: Erro de rede
Quando: Falha na request de remoção
Então: Estado reverte, toast "Falha ao remover"
```

### Listar Watchlist

```
Dado: Usuário com 5 filmes na watchlist
Quando: GET /api/watchlist
Então: Retorna array com 5 itens {id, tmdbId, title, posterPath, addedAt}

Dado: Perfil ativo mudou (outro usuário no mesmo device)
Quando: GET /api/watchlist
Então: Retorna watchlist do perfil ativo ATUAL (não do anterior)

Dado: Usuário sem nada na watchlist
Quando: GET /api/watchlist
Então: Retorna [] (array vazio), página mostra "Nenhum filme adicionado"
```

---

## 🏠 HOME PAGE

### HeroBanner

```
Dado: Página home carregada
Quando: Componente montado
Então: Exibe backdrop do 1º filme trending com rotação automática a cada 8s

Dado: 5 filmes trending carregados
Quando: Esperar 8 segundos
Então: Fade transition para filme #2

Dado: Filme em rotação clicado no botão "Mais informações"
Quando: Click
Então: Modal de detalhes abre com trailer

Dado: Trailers indisponíveis para filme em exibição
Quando: HeroBanner renderizado
Então: Gradiente cobre o espaço do trailer, nenhum erro exibido
```

### MovieRow (Carrossel)

```
Dado: MovieRow montada com 8 filmes
Quando: Renderizada em resolução desktop
Então: Exibe 6 cards em fila horizontal, setas < > aparecem no hover

Dado: Seta direita clicada
Quando: Click
Então: Scroll fluido revela próximos cards

Dado: Usuario em mobile (< 640px)
Quando: MovieRow renderizada
Então: Exibe 2 cards por linha, setas menores

Dado: Imagens carregando
Quando: Página inicial abre
Então: Skeleton loaders exibidos, fade transition quando pronto
```

### MovieCard

```
Dado: Card em repouso (hover delay 0ms)
Quando: Mouse sobre o card
Então: Nenhuma reação nos primeiros 400ms (evita flicker)

Dado: Mouse sobre card após 400ms
Quando: Delay decorrido
Então: Card expande (scale 1.0 → 1.3, z-index 999), trailer inicia autoplay muted

Dado: Card expandido, mouse sai
Quando: Mouse leave
Então: Card retorna ao tamanho normal em 300ms, trailer para

Dado: Card em mobile (sem hover)
Quando: Tap no card
Então: Modal abre diretamente (sem expansão intermediária)

Dado: Múltiplos cards em hover
Quando: Overlapping cards
Então: Z-index correto, cards superiores visíveis, nenhum glitch

Dado: Card sem trailer disponível
Quando: Expandir
Então: Area de trailer exibe placeholder, botão > Play desabilitado
```

---

## 🎞️ MOVIE MODAL

### Abrir Modal

```
Dado: Card clicado ou botão "Mais informações"
Quando: Click
Então: Modal animado abre (fade in + scale), com backdrop

Dado: Modal aberta
Quando: Usuário pressiona ESC
Então: Modal fecha com animação

Dado: Clickfora do modal (no backdrop)
Quando: Click
Então: Modal fecha

Dado: Scroll na página enquanto modal aberta
Quando: Modal visible
Então: Scroll bloqueado (documento não se move)
```

### Conteúdo do Modal

```
Dado: Modal aberta para filme válido
Quando: Renderizar
Então: Exibe:
  - Trailer com som (NOT muted)
  - Título do filme
  - Avaliação (vote_average)
  - Sinopse completa (overview)
  - Release date, runtime, genres
  - Elenco (atores + fotos)
  - Link para filmes similares
  - Botão: "+ Minha Lista" (ou "✓" se já na lista)
  - Botão: "▶ Assistir" (link para trailer no YouTube em nova aba)

Dado: Filme sem elenco disponível
Quando: Modal renderizando
Então: Seção de atores exibe "Elenco não disponível"

Dado: Filme sem sinopse/overview
Quando: Modal renderizando
Então: Sinopse exibe "Descrição não disponível"
```

### Adicionar/Remover da Watchlist (Modal)

```
Dado: Modal aberta, filme NOT na watchlist
Quando: Clicar "+ Minha Lista"
Então: Ícone muda para "✓", filme adicionado (UI otimista)

Dado: Modal aberta, filme já na watchlist
Quando: Clicar "✓"
Então: Ícone muda para "+", filme removido

Dado: Erro na request
Quando: Falha ao adicionar/remover
Então: Ícone reverte, toast notifica erro
```

---

## 🔍 SEARCH PAGE

### Submeter Busca

```
Dado: Usuário vê campo de busca no Navbar
Quando: Digitar "Inception" e pressionar Enter
Então: Navega para /search?q=Inception, resultados carregam

Dado: < 2 caracteres digite
Quando: Pressionar Enter
Então: Validação frontend bloqueia submit, nenhuma navegação

Dado: Busca anterior em cache (último 5 minutos)
Quando: Redigitar mesm termo
Então: Resultados exibem instantaneamente do cache local
```

### Exibir Resultados

```
Dado: 45 resultados para "Inception"
Quando: Página carrega
Então: Exibe 20 primeiros, botão "Carregar mais" aparece

Dado: Clicar "Carregar mais"
Quando: Click
Então: Carrega próximos 20 (total 40 exibidos)

Dado: 0 resultados para "asdfghjkl"
Quando: Página carrega
Então: Mensagem "Nenhum resultado encontrado para 'asdfghjkl'"

Dado: Resultado inclui mix de filmes E séries
Quando: Renderizar
Então: Cards exibem badge "Filme" ou "Série" diferenciando

Dado: Resultado clicado
Quando: Click n card
Então: Modal de detalhes abre (filme ou série)
```

---

## 🌐 RESPONSIVIDADE

### Mobile (< 640px)

```
Dado: Página home em mobile
Quando: Carregar
Então: HeroBanner simplificado, MovieRows com 2 cards/linha

Dado: Navbar em mobile
Quando: Renderizar
Então: Menu hamburger aparece, logo Netflix visível

Dado: Modal em mobile
Quando: Abrir
Então: Ocupa 90% da tela, scrollável internamente

Dado: Cards em mobile, hover não disponível
Quando: Tap card
Então: Ação registrada, modal abre (sem expansão intermediária)
```

### Tablet (640–1024px)

```
Dado: Página em tablet
Quando: Renderizar
Então: MovieRows com 3 cards/linha, setas de navegação visíveis
```

### Desktop (> 1024px)

```
Dado: Página em desktop
Quando: Renderizar
Então: MovieRows com 6 cards/linha, hover expand completo, animações suaves
```

---

## 🔐 SEGURANÇA (Testes de segurança)

```
Dado: SQL injection no campo de busca ("' OR '1'='1")
Quando: Submeter
Então: Tratado como string literal, nenhum dados expostos

Dado: XSS payload no nome do perfil ("<script>alert(1)</script>")
Quando: Criar perfil
Então: Payload sanitizado, nome armazenado como string literal

Dado: CSRF token ausente em ação POST
Quando: Tentar adicionar à watchlist
Então: Erro 403 "Token CSRF inválido"

Dado: Token JWT expirado
Quando: Tentar acessar rota protegida
Então: Interceptor tenta refresh, se falha → redirect login

Dado: Token de outro usuário utilizado
Quando: Tentar acessar minha watchlist com token de outro
Então: Erro 401 "Não autorizado"

Dado: Brute force: 5 logins falhados em 15 minutos
Quando: 6ª tentativa
Então: Conta bloqueada por 15 minutos, sem poder fazer login
```

---

## 📊 RESUMO DE SUÍTE DE TESTES

### Unit Tests (60-70%)

- Domain entities (User, Profile, WatchlistItem)
- Caso de uso isolado (CreateUser, Login, AddToWatchlist)
- Formatadores de datas, URLs de imagem
- Validadores (email, password, pagination)
- Utilitários

### Integration Tests (20-30%)

- UserRepository (criar, buscar, atualizar)
- WatchlistRepository
- TMDB proxy client (com mock da API)
- Redis cache adapter
- Autenticação JWT (geração e validação)

### E2E Tests (5-10%)

- Fluxo completo: Registro → Login → Criar Perfil → Buscar Filme → Adicionar Watchlist
- Fluxo alternativo: Login → Logout → Login outra vez → Dados persistem
- Responsividade em mobile/desktop

### Testes de Segurança (Transversais)

- SQL injection, XSS, CSRF
- Brute force
- Authorization checks
- Secrets não expostos

---

## ✅ Próximo Passo

Todos os comportamentos acima serão traduzidos em testes em estado RED (falhando) antes de qualquer implementação.
