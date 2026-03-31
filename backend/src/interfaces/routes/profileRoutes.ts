// src/interfaces/routes/profileRoutes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';

export function createProfileRoutes(controller: ProfileController): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      await controller.create(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      await controller.list(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
