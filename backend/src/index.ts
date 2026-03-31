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

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  const tmdbBearerToken = process.env.TMDB_BEARER_TOKEN!;

  // Initialize Prisma
  const prisma = new PrismaClient();

  // Initialize Redis (or use in-memory cache for development)
  let cacheService;
  if (process.env.REDIS_URL) {
    const redis = createClient({
      url: process.env.REDIS_URL,
    });
    await redis.connect();
    cacheService = new RedisCache(redis);
  } else {
    console.warn('REDIS_URL not set, using in-memory cache');
    cacheService = new InMemoryCache();
  }

  // Initialize repositories
  const userRepository = new PrismaUserRepository(prisma);
  const profileRepository = new PrismaProfileRepository(prisma);
  const watchlistRepository = new PrismaWatchlistRepository(prisma);

  // Initialize external services
  const tmdbClient = new TmdbClient(tmdbBearerToken);

  // Initialize use cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository, jwtAccessSecret, jwtRefreshSecret);
  const refreshTokenUseCase = new RefreshTokenUseCase(jwtAccessSecret, jwtRefreshSecret);
  const createProfileUseCase = new CreateProfileUseCase(profileRepository);
  const getProfilesUseCase = new GetProfilesUseCase(profileRepository);
  const addToWatchlistUseCase = new AddToWatchlistUseCase(watchlistRepository);
  const removeFromWatchlistUseCase = new RemoveFromWatchlistUseCase(watchlistRepository);
  const getWatchlistItemsUseCase = new GetWatchlistItemsUseCase(watchlistRepository);
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
    port,
  });

  // Start server
  app.listen(port, () => {
    console.log(`[Netflix Clone] Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[Netflix Clone] Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('[Netflix Clone] Bootstrap failed:', error);
  process.exit(1);
});
