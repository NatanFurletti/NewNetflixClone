// src/interfaces/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', async (req, res, next) => {
    try {
      await controller.register(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      await controller.login(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      await controller.refreshToken(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
