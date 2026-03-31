// src/application/usecases/RefreshToken.ts
import { TokenService } from "../services/TokenService";
import { UnauthorizedError } from "../../domain/errors/DomainError";

/**
 * Use Case: Renovar token de acesso
 * Implementa token rotation para segurança
 */
export class RefreshTokenUseCase {
  private revokedTokens: Set<string> = new Set(); // Em prod, seria em BD/Redis

  constructor(
    private jwtAccessSecret: string,
    private jwtRefreshSecret: string,
  ) {}

  async execute(input: {
    refreshToken: string;
  }): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Validar refresh token
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

    // 3. Verificar se token foi revogado (replay attack)
    if (this.revokedTokens.has(input.refreshToken)) {
      throw new UnauthorizedError("Token já foi utilizado");
    }

    // 4. Revogar token anterior (token rotation)
    this.revokedTokens.add(input.refreshToken);

    // 5. Gerar novos tokens
    const userId = decoded.sub;
    const access_token = TokenService.generateAccessToken(
      userId,
      this.jwtAccessSecret,
    );
    const refresh_token = TokenService.generateRefreshToken(
      userId,
      this.jwtRefreshSecret,
    );

    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * Revoga um token (ex: logout)
   */
  revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }
}
