// src/domain/repositories/IRefreshTokenRepository.ts

export interface IRefreshTokenRepository {
  create(data: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  findByToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; revokedAt: Date | null } | null>;
  revokeByToken(token: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
