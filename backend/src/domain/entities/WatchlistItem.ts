// src/domain/entities/WatchlistItem.ts
import { InvalidMediaTypeError, BadRequestError } from "../errors/DomainError";

/**
 * WatchlistItem Entity — Item na watchlist do usuário
 */
export class WatchlistItem {
  readonly id: string;
  readonly profileId: string;
  readonly tmdbId: number;
  readonly mediaType: "movie" | "tv";
  readonly title: string;
  readonly posterPath: string | null;
  readonly addedAt: Date;

  constructor(
    id: string,
    profileId: string,
    tmdbId: number,
    mediaType: "movie" | "tv",
    title: string,
    posterPath: string | null = null,
    addedAt: Date = new Date(),
  ) {
    // Validação: mediaType apenas 'movie' ou 'tv'
    if (!["movie", "tv"].includes(mediaType)) {
      throw new InvalidMediaTypeError(mediaType);
    }

    // Validação: tmdbId deve ser positivo
    if (tmdbId <= 0) {
      throw new BadRequestError("tmdbId deve ser positivo");
    }

    this.id = id;
    this.profileId = profileId;
    this.tmdbId = tmdbId;
    this.mediaType = mediaType;
    this.title = title;
    this.posterPath = posterPath;
    this.addedAt = addedAt;
  }

  /**
   * Cria nova instância de WatchlistItem
   */
  static create(
    id: string,
    profileId: string,
    tmdbId: number,
    mediaType: "movie" | "tv",
    title: string,
    posterPath?: string | null,
  ): WatchlistItem {
    return new WatchlistItem(
      id,
      profileId,
      tmdbId,
      mediaType,
      title,
      posterPath ?? null,
    );
  }
}
