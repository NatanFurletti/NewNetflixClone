// src/interfaces/routes/watchlistRoutes.ts
import { Router } from "express";
import { WatchlistController } from "../controllers/WatchlistController";

export function createWatchlistRoutes(controller: WatchlistController): Router {
  const router = Router();

  router.get("/:profileId", async (req, res, next) => {
    try {
      await controller.list(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      await controller.add(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:watchlistItemId", async (req, res, next) => {
    try {
      await controller.remove(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
