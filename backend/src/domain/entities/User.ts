// src/domain/entities/User.ts
import { InvalidEmailError } from "../errors/DomainError";

/**
 * User Entity — Usuário do sistema
 * Regras de negócio incorporadas na classe
 */
export class User {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(
    id: string,
    email: string,
    passwordHash: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    // Validação de email
    if (!this.isValidEmail(email)) {
      throw new InvalidEmailError(email);
    }

    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Valida se email tem formato correto
   */
  private isValidEmail(email: string): boolean {
    return User.EMAIL_REGEX.test(email);
  }

  /**
   * Cria nova instância de User com dados atualizados
   * Imutabilidade: retorna novo objeto
   */
  static create(id: string, email: string, passwordHash: string): User {
    return new User(id, email, passwordHash);
  }
}
