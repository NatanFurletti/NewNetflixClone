// src/application/usecases/AddToWatchlist.ts
import { v4 as uuid } from "uuid";
import { WatchlistItem } from "../../domain/entities/WatchlistItem";
import { DuplicateItemError } from "../../domain/errors/DomainError";
import { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";

/**
 * Use Case: Adicionar item à watchlist
 */
export class AddToWatchlistUseCase {
  private readonly MAX_WATCHLIST_SIZE = 500;

  constructor(private watchlistRepository: IWatchlistRepository) {}

  async execute(input: {
    profileId: string;
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
  }): Promise<{ id: string }> {
    // 1. Verificar se item já existe
    const existing = await this.watchlistRepository.findByProfileAndTmdbId(
      input.profileId,
      input.tmdbId,
      input.mediaType,
    );

    if (existing) {
      throw new DuplicateItemError("Item já está na sua lista");
    }

    // 2. Verificar limite de itens (500)
    const count = await this.watchlistRepository.count(input.profileId);
    if (count >= this.MAX_WATCHLIST_SIZE) {
      throw new Error("Limite de itens na watchlist atingido");
    }

    // 3. Criar item
    const item = WatchlistItem.create(
      uuid(),
      input.profileId,
      input.tmdbId,
      input.mediaType,
      input.title,
      input.posterPath,
    );

    // 4. Persistir
    const savedItem = await this.watchlistRepository.create(item);

    return { id: savedItem.id };
  }
}
