// src/application/usecases/GetProfiles.ts
import { IProfileRepository } from "../../domain/repositories/IProfileRepository";

/**
 * Use Case: Listar perfis de um usuário
 */
export class GetProfilesUseCase {
  constructor(private profileRepository: IProfileRepository) {}

  async execute(input: {
    userId: string;
  }): Promise<Array<{ id: string; name: string; isKids: boolean }>> {
    const profiles = await this.profileRepository.findByUserId(input.userId);

    return profiles.map((p) => ({
      id: p.id,
      name: p.name,
      isKids: p.isKids,
    }));
  }
}
