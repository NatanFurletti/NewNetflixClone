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

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS with environment-based whitelist
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3004').split(',').map(o => o.trim());
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }));

  // General rate limiting
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  
  const generalLimiter = rateLimit({
    windowMs,
    max: maxRequests,
    message: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Stricter limiter for auth endpoints
  const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Same window
    max: 5, // Much stricter limit for auth
    message: 'Muitas tentativas de autenticação, por favor tente novamente mais tarde.',
    skipSuccessfulRequests: true, // Don't count successful requests
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply general limiter
  app.use(generalLimiter);

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', createAuthRoutes(config.authController, authLimiter));
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
