// src/application/services/PasswordService.ts
import * as bcrypt from "bcryptjs";
import { WeakPasswordError } from "@/domain/errors/DomainError";

/**
 * PasswordService — Serviço para hashing e verificação de senhas
 */
export class PasswordService {
  private static readonly BCRYPT_ROUNDS = 12;
  private static readonly PASSWORD_MIN_LENGTH = 8;
  private static readonly PASSWORD_REGEX =
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  /**
   * Valida se a senha atende aos requisitos de força
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Pelo menos 1 letra maiúscula
   * - Pelo menos 1 número
   */
  static isStrong(password: string): boolean {
    if (password.length < this.PASSWORD_MIN_LENGTH) {
      return false;
    }

    return this.PASSWORD_REGEX.test(password);
  }

  /**
   * Valida e lança erro se senha for fraca
   */
  static validateStrength(password: string): void {
    if (!this.isStrong(password)) {
      throw new WeakPasswordError();
    }
  }

  /**
   * Faz hash da senha com bcrypt
   */
  static async hash(password: string): Promise<string> {
    this.validateStrength(password);
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Verifica se a senha corresponde ao hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
