// src/application/usecases/RemoveFromWatchlist.ts
import { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";

/**
 * Use Case: Remover item da watchlist
 */
export class RemoveFromWatchlistUseCase {
  constructor(private watchlistRepository: IWatchlistRepository) {}

  async execute(input: { watchlistItemId: string }): Promise<void> {
    await this.watchlistRepository.delete(input.watchlistItemId);
  }
}
