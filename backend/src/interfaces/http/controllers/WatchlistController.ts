// src/interfaces/http/controllers/WatchlistController.ts
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CreateProfileUseCase } from '../../../application/usecases/CreateProfile';
import { GetProfilesUseCase } from '../../../application/usecases/GetProfiles';
import { AddToWatchlistUseCase } from '../../../application/usecases/AddToWatchlist';
import { RemoveFromWatchlistUseCase } from '../../../application/usecases/RemoveFromWatchlist';
import { GetWatchlistItemsUseCase } from '../../../application/usecases/GetWatchlistItems';
import { GetTrendingMoviesUseCase } from '../../../application/usecases/GetTrendingMovies';
import {
  CreateProfileSchema,
  AddToWatchlistSchema,
  RemoveFromWatchlistSchema,
  PaginationSchema,
  CreateProfileInput,
  AddToWatchlistInput,
  RemoveFromWatchlistInput,
  PaginationInput,
} from '../../../application/validation/schemas';
import { BadRequestError } from '../../../domain/errors/DomainError';

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
      // Validate input
      const validatedData: CreateProfileInput = CreateProfileSchema.parse(req.body);
      const userId = req.userId!;

      const result = await this.createProfileUseCase.execute({
        userId,
        name: validatedData.name,
        avatarUrl: validatedData.avatarUrl || undefined,
        isKids: validatedData.isKids,
      });

      res.status(201).json({
        data: result,
        message: 'Perfil criado com sucesso',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
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
      // Validate input
      const validatedData: AddToWatchlistInput = AddToWatchlistSchema.parse(req.body);

      const result = await this.addToWatchlistUseCase.execute({
        profileId: validatedData.profileId,
        tmdbId: validatedData.tmdbId,
        mediaType: validatedData.mediaType,
        title: validatedData.title,
        posterPath: validatedData.posterPath,
      });

      res.status(201).json({
        data: result,
        message: 'Item adicionado à watchlist',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  async removeFromWatchlist(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validatedData: RemoveFromWatchlistInput = RemoveFromWatchlistSchema.parse({
        watchlistItemId: req.params.watchlistItemId,
      });

      await this.removeFromWatchlistUseCase.execute({
        watchlistItemId: validatedData.watchlistItemId,
      });

      res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
      throw error;
    }
  }

  async getWatchlistItems(req: Request, res: Response): Promise<void> {
    try {
      const { profileId } = req.params;
      
      // Validate pagination
      const validatedPagination: PaginationInput = PaginationSchema.parse({
        limit: req.query.limit,
        offset: req.query.offset,
      });

      const result = await this.getWatchlistItemsUseCase.execute({
        profileId,
        limit: validatedPagination.limit,
        offset: validatedPagination.offset,
      });

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError(
          error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
      }
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
