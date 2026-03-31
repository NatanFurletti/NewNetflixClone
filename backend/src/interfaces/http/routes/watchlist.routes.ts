// src/interfaces/http/routes/watchlist.routes.ts
import { Router } from 'express';
import { WatchlistController } from '../controllers/WatchlistController';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

export function createWatchlistRoutes(
  watchlistController: WatchlistController,
  jwtAccessSecret: string
): Router {
  const router = Router();
  router.use(authMiddleware(jwtAccessSecret));

  // Profile routes
  router.post('/profiles', asyncHandler((req, res) => watchlistController.createProfile(req, res)));
  router.get('/profiles', asyncHandler((req, res) => watchlistController.getProfiles(req, res)));

  // Watchlist routes
  router.post('/watchlist', asyncHandler((req, res) => watchlistController.addToWatchlist(req, res)));
  router.delete('/watchlist/:watchlistItemId', asyncHandler((req, res) => watchlistController.removeFromWatchlist(req, res)));
  router.get('/watchlist/:profileId', asyncHandler((req, res) => watchlistController.getWatchlistItems(req, res)));

  // Trending route
  router.get('/trending', asyncHandler((req, res) => watchlistController.getTrendingMovies(req, res)));

  return router;
}
