// src/application/services/TokenService.ts
import * as jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../domain/errors/DomainError";

/**
 * TokenService — Serviço para geração e validação de JWT
 */
export class TokenService {
  private static readonly ACCESS_TOKEN_EXPIRATION = "15m";
  private static readonly REFRESH_TOKEN_EXPIRATION = "7d";

  /**
   * Gera access token com 15 minutos de expiração
   */
  static generateAccessToken(userId: string, secret: string): string {
    return jwt.sign({ sub: userId, type: "access" }, secret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION,
    });
  }

  /**
   * Gera refresh token com 7 dias de expiração
   */
  static generateRefreshToken(userId: string, secret: string): string {
    return jwt.sign({ sub: userId, type: "refresh" }, secret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION,
    });
  }

  /**
   * Valida token e retorna payload
   */
  static validateToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new UnauthorizedError("Token inválido ou expirado");
    }
  }

  /**
   * Decodifica token sem validar assinatura
   * ⚠️ Use apenas para debugging/logging
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}
