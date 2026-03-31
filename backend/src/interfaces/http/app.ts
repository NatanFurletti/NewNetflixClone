// src/interfaces/http/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AuthController } from './controllers/AuthController';
import { WatchlistController } from './controllers/WatchlistController';
import { createAuthRoutes } from './routes/auth.routes';
import { createWatchlistRoutes } from './routes/watchlist.routes';
import { errorHandler } from './middlewares/errorHandler';

export interface AppConfig {
  authController: AuthController;
  watchlistController: WatchlistController;
  jwtAccessSecret: string;
  port: number;
}

export function createApp(config: AppConfig): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Muitas requisições deste IP, por favor try again later.',
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', createAuthRoutes(config.authController));
  app.use('/api', createWatchlistRoutes(config.watchlistController, config.jwtAccessSecret));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      code: 'ROUTE_NOT_FOUND',
      path: req.path,
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
