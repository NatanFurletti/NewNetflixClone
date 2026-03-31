// src/application/usecases/GetWatchlistItems.ts
import { IWatchlistRepository } from "@/domain/repositories/IWatchlistRepository";

/**
 * Use Case: Listar itens da watchlist
 */
export class GetWatchlistItemsUseCase {
  constructor(private watchlistRepository: IWatchlistRepository) {}

  async execute(input: {
    profileId: string;
    limit?: number;
    offset?: number;
  }): Promise<
    Array<{ id: string; tmdbId: number; title: string; mediaType: string }>
  > {
    const items = await this.watchlistRepository.findByProfileId(
      input.profileId,
      input.limit,
      input.offset,
    );

    return items.map((item) => ({
      id: item.id,
      tmdbId: item.tmdbId,
      title: item.title,
      mediaType: item.mediaType,
    }));
  }
}
