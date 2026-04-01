// src/application/usecases/RefreshToken.ts
import { TokenService } from "../services/TokenService";
import { UnauthorizedError } from "../../domain/errors/DomainError";
import { IRefreshTokenRepository } from "../../domain/repositories/IRefreshTokenRepository";

/**
 * Use Case: Renovar token de acesso
 * Implementa token rotation com persistência no banco de dados
 */
export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepository: IRefreshTokenRepository,
    private jwtAccessSecret: string,
    private jwtRefreshSecret: string,
  ) {}

  async execute(input: {
    refreshToken: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Validar assinatura JWT
    let decoded: any;
    try {
      decoded = TokenService.validateToken(
        input.refreshToken,
        this.jwtRefreshSecret,
      );
    } catch (error) {
      throw new UnauthorizedError("Refresh token inválido ou expirado");
    }

    // 2. Verificar se é realmente um refresh token
    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Token inválido");
    }

    // 3. Buscar token no banco — verifica se foi revogado ou expirou
    const storedToken = await this.refreshTokenRepository.findByToken(input.refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError("Refresh token não encontrado");
    }

    if (storedToken.revokedAt !== null) {
      // Possível replay attack — revogar todos os tokens do usuário por segurança
      await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
      throw new UnauthorizedError("Token já foi utilizado. Faça login novamente.");
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expirado");
    }

    // 4. Revogar token atual (token rotation)
    await this.refreshTokenRepository.revokeByToken(input.refreshToken);

    // 5. Gerar novos tokens
    const userId = decoded.sub;
    const access_token = TokenService.generateAccessToken(userId, this.jwtAccessSecret);
    const refresh_token = TokenService.generateRefreshToken(userId, this.jwtRefreshSecret);

    // 6. Persistir novo refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    await this.refreshTokenRepository.create({ userId, token: refresh_token, expiresAt });

    return { access_token, refresh_token };
  }

  /**
   * Revoga um token específico (ex: logout)
   */
  async revokeToken(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeByToken(token);
  }

  /**
   * Revoga todos os tokens de um usuário (ex: logout de todos os dispositivos)
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
  }
}
