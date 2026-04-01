// src/application/usecases/GetWatchlistItems.ts
import { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { ForbiddenError, ProfileNotFoundError } from "../../domain/errors/DomainError";

/**
 * Use Case: Listar itens da watchlist
 */
export class GetWatchlistItemsUseCase {
  constructor(
    private watchlistRepository: IWatchlistRepository,
    private profileRepository: IProfileRepository,
  ) {}

  async execute(input: {
    userId: string;
    profileId: string;
    limit?: number;
    offset?: number;
  }): Promise<
    Array<{ id: string; tmdbId: number; title: string; mediaType: string }>
  > {
    // 1. Verificar que o perfil pertence ao usuário autenticado
    const profile = await this.profileRepository.findById(input.profileId);
    if (!profile) {
      throw new ProfileNotFoundError(input.profileId);
    }
    if (profile.userId !== input.userId) {
      throw new ForbiddenError("Acesso negado a este perfil");
    }

    // 2. Buscar itens
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
