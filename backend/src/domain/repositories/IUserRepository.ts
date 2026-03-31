// src/domain/repositories/IUserRepository.ts
import { User } from "../entities/User";

/**
 * Interface de repositório de usuários
 * Define o contrato que o repositório deve implementar
 */
export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
