// src/interfaces/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, errorHandler } from './middlewares';
import { createAuthRoutes, createProfileRoutes, createWatchlistRoutes } from './routes';
import { 
  RegisterUserUseCase, 
  LoginUseCase, 
  RefreshTokenUseCase,
  CreateProfileUseCase,
  GetProfilesUseCase,
  AddToWatchlistUseCase,
  RemoveFromWatchlistUseCase,
  GetWatchlistItemsUseCase
} from '@/application';
import { 
  PrismaUserRepository,
  PrismaProfileRepository,
  PrismaWatchlistRepository
} from '@/infrastructure/repositories';
import { AuthController, ProfileController, WatchlistController } from './controllers';

export function createApp(prisma: PrismaClient, jwtAccessSecret: string, jwtRefreshSecret: string): Express {
  const app = express();

  // Middlewares globais
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
  });
  app.use('/api/', limiter);

  // Inicializar repositórios
  const userRepository = new PrismaUserRepository(prisma);
  const profileRepository = new PrismaProfileRepository(prisma);
  const watchlistRepository = new PrismaWatchlistRepository(prisma);

  // Inicializar use cases
  const registerUserUseCase = new RegisterUserUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository, jwtAccessSecret, jwtRefreshSecret);
  const refreshTokenUseCase = new RefreshTokenUseCase(jwtAccessSecret, jwtRefreshSecret);
  const createProfileUseCase = new CreateProfileUseCase(profileRepository);
  const getProfilesUseCase = new GetProfilesUseCase(profileRepository);
  const addToWatchlistUseCase = new AddToWatchlistUseCase(watchlistRepository);
  const removeFromWatchlistUseCase = new RemoveFromWatchlistUseCase(watchlistRepository);
  const getWatchlistItemsUseCase = new GetWatchlistItemsUseCase(watchlistRepository);

  // Inicializar controllers
  const authController = new AuthController(
    registerUserUseCase,
    loginUseCase,
    refreshTokenUseCase
  );
  const profileController = new ProfileController(
    createProfileUseCase,
    getProfilesUseCase
  );
  const watchlistController = new WatchlistController(
    addToWatchlistUseCase,
    removeFromWatchlistUseCase,
    getWatchlistItemsUseCase
  );

  // Rotas públicas
  app.use('/api/auth', createAuthRoutes(authController));

  // Rotas privadas (requerem autenticação)
  app.use('/api/profiles', authMiddleware(jwtAccessSecret), createProfileRoutes(profileController));
  app.use('/api/watchlist', authMiddleware(jwtAccessSecret), createWatchlistRoutes(watchlistController));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Error handler (deve ser o último middleware)
  app.use(errorHandler);

  return app;
}
