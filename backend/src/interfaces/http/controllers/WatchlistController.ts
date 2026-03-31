// src/interfaces/http/controllers/WatchlistController.ts
import { Request, Response } from 'express';
import { CreateProfileUseCase } from '../../../application/usecases/CreateProfile';
import { GetProfilesUseCase } from '../../../application/usecases/GetProfiles';
import { AddToWatchlistUseCase } from '../../../application/usecases/AddToWatchlist';
import { RemoveFromWatchlistUseCase } from '../../../application/usecases/RemoveFromWatchlist';
import { GetWatchlistItemsUseCase } from '../../../application/usecases/GetWatchlistItems';
import { GetTrendingMoviesUseCase } from '../../../application/usecases/GetTrendingMovies';

export class WatchlistController {
  constructor(
    private createProfileUseCase: CreateProfileUseCase,
    private getProfilesUseCase: GetProfilesUseCase,
    private addToWatchlistUseCase: AddToWatchlistUseCase,
    private removeFromWatchlistUseCase: RemoveFromWatchlistUseCase,
    private getWatchlistItemsUseCase: GetWatchlistItemsUseCase,
    private getTrendingMoviesUseCase: GetTrendingMoviesUseCase
  ) {}

  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const { name, avatarUrl, isKids } = req.body;
      const userId = req.userId!;

      const result = await this.createProfileUseCase.execute({
        userId,
        name,
        avatarUrl,
        isKids,
      });

      res.status(201).json({
        data: result,
        message: 'Perfil criado com sucesso',
      });
    } catch (error) {
      throw error;
    }
  }

  async getProfiles(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const result = await this.getProfilesUseCase.execute({ userId });

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async addToWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, tmdbId, mediaType, title, posterPath } = req.body;

      const result = await this.addToWatchlistUseCase.execute({
        profileId,
        tmdbId,
        mediaType,
        title,
        posterPath,
      });

      res.status(201).json({
        data: result,
        message: 'Item adicionado à watchlist',
      });
    } catch (error) {
      throw error;
    }
  }

  async removeFromWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const { watchlistItemId } = req.params;

      await this.removeFromWatchlistUseCase.execute({
        watchlistItemId,
      });

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  async getWatchlistItems(req: Request, res: Response): Promise<void> {
    try {
      const { profileId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const result = await this.getWatchlistItemsUseCase.execute({
        profileId,
        limit,
        offset,
      });

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  async getTrendingMovies(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getTrendingMoviesUseCase.execute();

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }
}
