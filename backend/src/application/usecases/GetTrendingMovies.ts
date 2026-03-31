// src/application/usecases/GetTrendingMovies.ts
/**
 * Interface para cache
 */
export interface ICacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlSeconds: number): Promise<void>;
}

/**
 * Interface para cliente TMDB
 */
export interface ITmdbClient {
  getTrendingMovies(): Promise<any[]>;
}

/**
 * Use Case: Buscar filmes em tendência
 * Implementa caching com fallback para cache stale
 */
export class GetTrendingMoviesUseCase {
  private readonly CACHE_KEY = "trending:movies";
  private readonly CACHE_TTL_SECONDS = 60 * 60; // 1 hora
  private readonly TMDB_TIMEOUT_MS = 5000;

  constructor(
    private tmdbClient: ITmdbClient,
    private cacheService: ICacheService,
  ) {}

  async execute(): Promise<any[]> {
    // 1. Verificar cache
    const cached = await this.cacheService.get(this.CACHE_KEY);
    if (cached && !cached.stale) {
      return cached.data;
    }

    // 2. Tentar buscar da TMDB com timeout
    try {
      const movies = await Promise.race([
        this.tmdbClient.getTrendingMovies(),
        this.timeout(this.TMDB_TIMEOUT_MS),
      ]);

      // 3. Cachear resultado
      await this.cacheService.set(
        this.CACHE_KEY,
        movies,
        this.CACHE_TTL_SECONDS,
      );

      return movies as any[];
    } catch (error) {
      // 4. Se erro e tem cache stale: retornar cache
      if (cached) {
        return cached.data;
      }

      // 5. Se tudo falhar: lançar erro
      throw new Error("Não foi possível buscar filmes em tendência");
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms),
    );
  }
}
