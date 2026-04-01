// src/interfaces/http/routes/auth.routes.ts
import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../utils/asyncHandler';

export function createAuthRoutes(authController: AuthController, authLimiter?: RequestHandler): Router {
  const router = Router();

  // Apply auth limiter if provided
  if (authLimiter) {
    router.use(authLimiter);
  }

  router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
  router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
  router.post('/refresh', asyncHandler((req, res) => authController.refreshToken(req, res)));
  router.post('/logout', asyncHandler((req, res) => authController.logout(req, res)));

  return router;
}
