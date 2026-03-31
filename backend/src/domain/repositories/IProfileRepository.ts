// src/domain/repositories/IProfileRepository.ts
import { Profile } from "../entities/Profile";

/**
 * Interface de repositório de perfis
 */
export interface IProfileRepository {
  create(profile: Profile): Promise<Profile>;
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile[]>;
  update(id: string, profile: Partial<Profile>): Promise<Profile>;
  delete(id: string): Promise<void>;
}
