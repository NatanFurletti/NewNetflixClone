// src/application/usecases/Login.ts
import { TokenService } from "../services/TokenService";
import { PasswordService } from "../services/PasswordService";
import { UnauthorizedError } from "../../domain/errors/DomainError";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ICacheService } from "../../infrastructure/cache/RedisCache";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

/**
 * Use Case: Fazer login de usuário
 * Responsável por:
 * - Buscar usuário por email
 * - Verificar senha
 * - Gerar tokens
 * - Proteção contra brute force (persistida em Redis/cache)
 */
export class LoginUseCase {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_TTL_SECONDS = 15 * 60; // 15 minutos

  constructor(
    private userRepository: IUserRepository,
    private refreshTokenRepository: IRefreshTokenRepository,
    private cacheService: ICacheService,
    private jwtAccessSecret: string,
    private jwtRefreshSecret: string,
  ) {}

  async execute(input: {
    email: string;
    password: string;
  }): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string } }> {
    // 1. Verificar se conta está bloqueada por brute force (via cache distribuído)
    await this.checkBruteForceProtection(input.email);

    // 2. Buscar user por email
    const user = await this.userRepository.findByEmail(input.email);

    // 3. Se não encontrado OU senha incorreta: erro genérico (no user enumeration)
    if (!user) {
      await this.recordFailedAttempt(input.email);
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // 4. Verificar password
    const isPasswordCorrect = await PasswordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      await this.recordFailedAttempt(input.email);
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // 5. Limpar contador de falhas (login bem-sucedido)
    await this.cacheService.delete(`brute_force:${input.email}`);

    // 6. Gerar tokens
    const access_token = TokenService.generateAccessToken(
      user.id,
      this.jwtAccessSecret,
    );
    const refresh_token = TokenService.generateRefreshToken(
      user.id,
      this.jwtRefreshSecret,
    );

    // 7. Persistir refresh token no banco de dados
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refresh_token,
      expiresAt,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async checkBruteForceProtection(email: string): Promise<void> {
    const key = `brute_force:${email}`;
    const data = await this.cacheService.get<{ count: number; lockedUntil?: number }>(key);

    if (!data) return;

    if (data.count >= this.MAX_FAILED_ATTEMPTS) {
      if (data.lockedUntil && data.lockedUntil > Date.now()) {
        const remainingSeconds = Math.ceil((data.lockedUntil - Date.now()) / 1000);
        throw new UnauthorizedError(
          `Conta bloqueada. Tente novamente em ${remainingSeconds} segundos`,
        );
      }
    }
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = `brute_force:${email}`;
    const data = await this.cacheService.get<{ count: number; lockedUntil?: number }>(key) ?? { count: 0 };

    data.count += 1;

    if (data.count >= this.MAX_FAILED_ATTEMPTS) {
      data.lockedUntil = Date.now() + this.LOCKOUT_TTL_SECONDS * 1000;
    }

    await this.cacheService.set(key, data, this.LOCKOUT_TTL_SECONDS);
  }
}
