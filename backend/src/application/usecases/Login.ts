// src/application/usecases/Login.ts
import { TokenService } from "../services/TokenService";
import { PasswordService } from "../services/PasswordService";
import { UnauthorizedError } from "../../domain/errors/DomainError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

/**
 * Use Case: Fazer login de usuário
 * Responsável por:
 * - Buscar usuário por email
 * - Verificar senha
 * - Gerar tokens
 * - Proteção contra brute force
 */
export class LoginUseCase {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> =
    new Map();

  constructor(
    private userRepository: IUserRepository,
    private jwtAccessSecret: string,
    private jwtRefreshSecret: string,
  ) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verificar se conta está bloqueada por brute force
    this.checkBruteForceProtection(input.email);

    // 2. Buscar user por email
    const user = await this.userRepository.findByEmail(input.email);

    // 3. Se não encontrado OU senha incorreta: erro genérico (no user enumeration)
    if (!user) {
      this.recordFailedAttempt(input.email);
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // 4. Verificar password
    const isPasswordCorrect = await PasswordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      this.recordFailedAttempt(input.email);
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // 5. Limpar falhas (login bem-sucedido)
    this.failedAttempts.delete(input.email);

    // 6. Gerar tokens
    const accessToken = TokenService.generateAccessToken(
      user.id,
      this.jwtAccessSecret,
    );
    const refreshToken = TokenService.generateRefreshToken(
      user.id,
      this.jwtRefreshSecret,
    );

    return { accessToken, refreshToken };
  }

  private checkBruteForceProtection(email: string): void {
    const attempt = this.failedAttempts.get(email);

    if (!attempt) return;

    const now = Date.now();
    const timeSinceLock = now - attempt.lastAttempt;

    if (attempt.count >= this.MAX_FAILED_ATTEMPTS) {
      if (timeSinceLock < this.LOCKOUT_DURATION_MS) {
        const remainingSeconds = Math.ceil(
          (this.LOCKOUT_DURATION_MS - timeSinceLock) / 1000,
        );
        throw new UnauthorizedError(
          `Conta bloqueada. Tente novamente em ${remainingSeconds} segundos`,
        );
      } else {
        // Bloqueio expirou
        this.failedAttempts.delete(email);
      }
    }
  }

  private recordFailedAttempt(email: string): void {
    const attempt = this.failedAttempts.get(email);

    if (!attempt) {
      this.failedAttempts.set(email, { count: 1, lastAttempt: Date.now() });
    } else {
      attempt.count += 1;
      attempt.lastAttempt = Date.now();
    }
  }
}
