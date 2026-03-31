// src/interfaces/controllers/WatchlistController.ts
import { Request, Response } from "express";
import { AddToWatchlistUseCase } from "@/application/usecases/AddToWatchlist";
import { RemoveFromWatchlistUseCase } from "@/application/usecases/RemoveFromWatchlist";
import { GetWatchlistItemsUseCase } from "@/application/usecases/GetWatchlistItems";

export class WatchlistController {
  constructor(
    private addToWatchlistUseCase: AddToWatchlistUseCase,
    private removeFromWatchlistUseCase: RemoveFromWatchlistUseCase,
    private getWatchlistItemsUseCase: GetWatchlistItemsUseCase,
  ) {}

  async add(req: Request, res: Response): Promise<void> {
    const { profileId, tmdbId, mediaType, title, posterPath } = req.body;

    const result = await this.addToWatchlistUseCase.execute({
      profileId,
      tmdbId,
      mediaType,
      title,
      posterPath,
    });

    res.status(201).json(result);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const { watchlistItemId } = req.params;

    await this.removeFromWatchlistUseCase.execute({
      watchlistItemId,
    });

    res.status(204).send();
  }

  async list(req: Request, res: Response): Promise<void> {
    const { profileId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await this.getWatchlistItemsUseCase.execute({
      profileId,
      limit,
      offset,
    });

    res.status(200).json(result);
  }
}
