// src/domain/repositories/IWatchlistRepository.ts
import { WatchlistItem } from "../entities/WatchlistItem";

/**
 * Interface de repositório de watchlist
 */
export interface IWatchlistRepository {
  create(item: WatchlistItem): Promise<WatchlistItem>;
  findById(id: string): Promise<WatchlistItem | null>;
  findByProfileAndTmdbId(
    profileId: string,
    tmdbId: number,
    mediaType: "movie" | "tv",
  ): Promise<WatchlistItem | null>;
  findByProfileId(
    profileId: string,
    limit?: number,
    offset?: number,
  ): Promise<WatchlistItem[]>;
  delete(id: string): Promise<void>;
  count(profileId: string): Promise<number>;
  update(id: string, item: Partial<WatchlistItem>): Promise<WatchlistItem>;
}
