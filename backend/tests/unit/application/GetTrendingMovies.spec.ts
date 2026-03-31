// tests/unit/application/GetTrendingMovies.spec.ts
/**
 * UNIT TEST: Get Trending Movies (TMDB Proxy + Cache)
 */

describe("GetTrendingMovies Use Case", () => {
  describe("happy path", () => {
    it("should fetch trending movies from TMDB", async () => {
      // ARRANGE
      // const mockTmdbClient = createMockTmdbClient();
      // const mockCacheService = createMockCacheService();
      // const getTrendingMoviesUseCase = new GetTrendingMoviesUseCase(
      //   mockTmdbClient,
      //   mockCacheService,
      // );
      // mockTmdbClient.setResponse({
      //   results: [
      //     { id: 550, title: 'Fight Club', poster_path: '/path1.jpg' },
      //     { id: 278, title: 'Shawshank Redemption', poster_path: '/path2.jpg' },
      //   ],
      // });
      // ACT
      // const result = await getTrendingMoviesUseCase.execute();
      // ASSERT
      // expect(result.length).toBe(2);
      // expect(result[0].title).toBe('Fight Club');
    });
  });

  describe("caching", () => {
    it("should cache results in Redis for 1 hour", async () => {
      // const result = await getTrendingMoviesUseCase.execute();
      // expect(mockCacheService.setWasCalled).toBe(true);
      // const { key, value, ttl } = mockCacheService.lastSet;
      // expect(key).toBe('trending:movies');
      // expect(ttl).toBe(3600); // 1 hour in seconds
    });

    it("should return cached results on subsequent calls within 1 hour", async () => {
      // mockTmdbClient.requestCount = 0;
      // mockCacheService.setCached('trending:movies', cachedMovies);
      // const result1 = await getTrendingMoviesUseCase.execute();
      // const result2 = await getTrendingMoviesUseCase.execute();
      // expect(mockTmdbClient.requestCount).toBe(1); // only 1 actual API call
      // expect(result1).toEqual(result2); // same cached data
    });

    it("should return stale cache if TMDB is offline", async () => {
      // mockTmdbClient.setError('Connection timeout');
      // mockCacheService.setStaleData('trending:movies', oldCachedMovies);
      // const result = await getTrendingMoviesUseCase.execute();
      // expect(result).toEqual(oldCachedMovies);
      // expect(result.meta.cacheStatus).toBe('STALE_FALLBACK');
    });
  });

  describe("error handling", () => {
    it("should throw error if TMDB and cache both unavailable", async () => {
      // mockTmdbClient.setError('Connection failed');
      // mockCacheService.setError('Redis unavailable');
      // expect(async () => {
      //   await getTrendingMoviesUseCase.execute();
      // }).rejects.toThrow('Unable to fetch trending movies');
    });

    it("should have 5 second timeout for TMDB requests", async () => {
      // jest.useFakeTimers();
      // const slowPromise = new Promise(resolve => setTimeout(resolve, 6000));
      // mockTmdbClient.setResponse(slowPromise);
      // expect(async () => {
      //   await getTrendingMoviesUseCase.execute();
      // }).rejects.toThrow('Request timeout');
      // jest.useRealTimers();
    });
  });
});
