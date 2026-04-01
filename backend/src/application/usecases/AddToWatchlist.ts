// src/application/usecases/AddToWatchlist.ts
import { v4 as uuid } from "uuid";
import { WatchlistItem } from "../../domain/entities/WatchlistItem";
import { DuplicateItemError, ForbiddenError, ProfileNotFoundError, BadRequestError } from "../../domain/errors/DomainError";
import { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";

/**
 * Use Case: Adicionar item à watchlist
 */
export class AddToWatchlistUseCase {
  private readonly MAX_WATCHLIST_SIZE = 500;

  constructor(
    private watchlistRepository: IWatchlistRepository,
    private profileRepository: IProfileRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
  }): Promise<{ id: string }> {
    // 1. Verificar que o perfil pertence ao usuário autenticado
    const profile = await this.profileRepository.findById(input.profileId);
    if (!profile) {
      throw new ProfileNotFoundError(input.profileId);
    }
    if (profile.userId !== input.userId) {
      throw new ForbiddenError("Acesso negado a este perfil");
    }

    // 2. Verificar se item já existe
    const existing = await this.watchlistRepository.findByProfileAndTmdbId(
      input.profileId,
      input.tmdbId,
      input.mediaType,
    );

    if (existing) {
      throw new DuplicateItemError("Item já está na sua lista");
    }

    // 3. Verificar limite de itens (500)
    const count = await this.watchlistRepository.count(input.profileId);
    if (count >= this.MAX_WATCHLIST_SIZE) {
      throw new BadRequestError("Limite de itens na watchlist atingido");
    }

    // 4. Criar item
    const item = WatchlistItem.create(
      uuid(),
      input.profileId,
      input.tmdbId,
      input.mediaType,
      input.title,
      input.posterPath,
    );

    // 5. Persistir
    const savedItem = await this.watchlistRepository.create(item);

    return { id: savedItem.id };
  }
}
