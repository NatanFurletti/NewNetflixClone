// src/application/usecases/CreateProfile.ts
import { v4 as uuid } from "uuid";
import { Profile } from "@/domain/entities/Profile";
import { IProfileRepository } from "@/domain/repositories/IProfileRepository";

/**
 * Use Case: Criar novo perfil para usuário
 */
export class CreateProfileUseCase {
  private readonly MAX_PROFILES_PER_USER = 5;

  constructor(private profileRepository: IProfileRepository) {}

  async execute(input: {
    userId: string;
    name: string;
    avatarUrl?: string;
    isKids?: boolean;
  }): Promise<{ id: string; userId: string; name: string }> {
    // 1. Verificar número máximo de perfis
    const existingProfiles = await this.profileRepository.findByUserId(
      input.userId,
    );

    if (existingProfiles.length >= this.MAX_PROFILES_PER_USER) {
      throw new Error("Limite de perfis atingido (máximo 5)");
    }

    // 2. Criar profile (validação de nome feita no construtor)
    const profile = Profile.create(uuid(), input.userId, input.name, {
      avatarUrl: input.avatarUrl,
      isKids: input.isKids,
    });

    // 3. Persistir
    const savedProfile = await this.profileRepository.create(profile);

    return {
      id: savedProfile.id,
      userId: savedProfile.userId,
      name: savedProfile.name,
    };
  }
}
