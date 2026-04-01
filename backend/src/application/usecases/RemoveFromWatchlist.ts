// src/application/usecases/RemoveFromWatchlist.ts
import { IWatchlistRepository } from "../../domain/repositories/IWatchlistRepository";
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";
import { ForbiddenError, ProfileNotFoundError } from "../../domain/errors/DomainError";
import { NotFoundError } from "../../domain/errors/DomainError";

/**
 * Use Case: Remover item da watchlist
 */
export class RemoveFromWatchlistUseCase {
  constructor(
    private watchlistRepository: IWatchlistRepository,
    private profileRepository: IProfileRepository,
  ) {}

  async execute(input: { userId: string; watchlistItemId: string }): Promise<void> {
    // 1. Buscar o item para obter o profileId
    const item = await this.watchlistRepository.findById(input.watchlistItemId);
    if (!item) {
      throw new NotFoundError("Item não encontrado na watchlist");
    }

    // 2. Verificar que o perfil do item pertence ao usuário autenticado
    const profile = await this.profileRepository.findById(item.profileId);
    if (!profile) {
      throw new ProfileNotFoundError(item.profileId);
    }
    if (profile.userId !== input.userId) {
      throw new ForbiddenError("Acesso negado a este item");
    }

    // 3. Remover
    await this.watchlistRepository.delete(input.watchlistItemId);
  }
}
