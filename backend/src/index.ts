// src/index.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { createApp } from './interfaces/http/app';
import { RegisterUserUseCase } from './application/usecases/RegisterUser';
import { LoginUseCase } from './application/usecases/Login';
import { RefreshTokenUseCase } from './application/usecases/RefreshToken';
import { CreateProfileUseCase } from './application/usecases/CreateProfile';
import { GetProfilesUseCase } from './application/usecases/GetProfiles';
import { AddToWatchlistUseCase } from './application/usecases/AddToWatchlist';
import { RemoveFromWatchlistUseCase } from './application/usecases/RemoveFromWatchlist';
import { GetWatchlistItemsUseCase } from './application/usecases/GetWatchlistItems';
import { GetTrendingMoviesUseCase } from './application/usecases/GetTrendingMovies';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
import { PrismaProfileRepository } from './infrastructure/repositories/PrismaProfileRepository';
import { PrismaWatchlistRepository } from './infrastructure/repositories/PrismaWatchlistRepository';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/PrismaRefreshTokenRepository';
import { RedisCache, InMemoryCache } from './infrastructure/cache/RedisCache';
import { TmdbClient } from './infrastructure/external/TmdbClient';
import { AuthController } from './interfaces/http/controllers/AuthController';
import { WatchlistController } from './interfaces/http/controllers/WatchlistController';

async function bootstrap() {
  // Validate environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'TMDB_BEARER_TOKEN',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Validate JWT secret entropy — prevent weak/placeholder secrets in production
  if (process.env.NODE_ENV === 'production') {
    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const weakPatterns = /REPLACE_WITH|change-me|secret|password|example|test/i;
    if (accessSecret.length < 32 || weakPatterns.test(accessSecret)) {
      throw new Error('JWT_ACCESS_SECRET is too weak or a placeholder. Use at least 32 random characters.');
    }
    if (refreshSecret.length < 32 || weakPatterns.test(refreshSecret)) {
      throw new Error('JWT_REFRESH_SECRET is too weak or a placeholder. Use at least 32 random characters.');
    }
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN!;

  // Initialize Prisma
  const prisma = new PrismaClient();

  // Initialize Redis (or use in-memory cache for development)
  let cacheService;
  let redisClient: ReturnType<typeof createClient> | null = null;
  if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    cacheService = new RedisCache(redisClient);
  } else {
    console.warn('REDIS_URL not set, using in-memory cache');
    cacheService = new InMemoryCache();
  }

  // Initialize repositories
  const userRepository = new PrismaUserRepository(prisma);
  const profileRepository = new PrismaProfileRepository(prisma);
  const watchlistRepository = new PrismaWatchlistRepository(prisma);
  const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma);

  // Initialize external services
  const tmdbClient = new TmdbClient(tmdbBearerToken);

  // Initialize use cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, cacheService, jwtAccessSecret, jwtRefreshSecret);
  const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository, jwtAccessSecret, jwtRefreshSecret);
  const createProfileUseCase = new CreateProfileUseCase(profileRepository);
  const getProfilesUseCase = new GetProfilesUseCase(profileRepository);
  const addToWatchlistUseCase = new AddToWatchlistUseCase(watchlistRepository, profileRepository);
  const removeFromWatchlistUseCase = new RemoveFromWatchlistUseCase(watchlistRepository, profileRepository);
  const getWatchlistItemsUseCase = new GetWatchlistItemsUseCase(watchlistRepository, profileRepository);
  const getTrendingMoviesUseCase = new GetTrendingMoviesUseCase(tmdbClient, cacheService);

  // Initialize controllers
  const authController = new AuthController(
    registerUserUseCase,
    loginUseCase,
    refreshTokenUseCase
  );

  const watchlistController = new WatchlistController(
    createProfileUseCase,
    getProfilesUseCase,
    addToWatchlistUseCase,
    removeFromWatchlistUseCase,
    getWatchlistItemsUseCase,
    getTrendingMoviesUseCase
  );

  // Create Express app
  const app = createApp({
    authController,
    watchlistController,
    jwtAccessSecret,
    cacheService,
    port,
  });

  // Start server
  app.listen(port, () => {
    console.log(`[Netflix Clone] Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Netflix Clone] ${signal} received. Shutting down gracefully...`);
    if (redisClient) {
      await redisClient.quit();
    }
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[Netflix Clone] Bootstrap failed:', error);
  process.exit(1);
});
