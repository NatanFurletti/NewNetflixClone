// src/interfaces/http/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../utils/asyncHandler';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/register', asyncHandler((req, res) => authController.register(req, res)));
  router.post('/login', asyncHandler((req, res) => authController.login(req, res)));
  router.post('/refresh', asyncHandler((req, res) => authController.refreshToken(req, res)));

  return router;
}
