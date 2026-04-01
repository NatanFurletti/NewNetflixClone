// src/domain/entities/Profile.ts
import { BadRequestError } from "../errors/DomainError";

/**
 * Profile Entity — Perfil de usuário dentro de uma conta
 * Permite múltiplos perfis por usuário
 */
export class Profile {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly avatarUrl?: string;
  readonly isKids: boolean;
  readonly createdAt: Date;

  constructor(
    id: string,
    userId: string,
    name: string,
    avatarUrl?: string,
    isKids: boolean = false,
    createdAt: Date = new Date(),
  ) {
    // Validação: nome deve ter 3-20 caracteres
    if (name.length < 3 || name.length > 20) {
      throw new BadRequestError("Nome do perfil deve ter entre 3 e 20 caracteres");
    }

    this.id = id;
    this.userId = userId;
    this.name = name;
    this.avatarUrl = avatarUrl;
    this.isKids = isKids;
    this.createdAt = createdAt;
  }

  /**
   * Cria nova instância de Profile
   */
  static create(
    id: string,
    userId: string,
    name: string,
    options: { avatarUrl?: string; isKids?: boolean } = {},
  ): Profile {
    return new Profile(
      id,
      userId,
      name,
      options.avatarUrl,
      options.isKids ?? false,
    );
  }
}
