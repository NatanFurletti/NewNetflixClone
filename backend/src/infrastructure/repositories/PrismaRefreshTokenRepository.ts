// src/infrastructure/repositories/PrismaRefreshTokenRepository.ts
import { PrismaClient } from '@prisma/client';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { userId: string; token: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<{
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      select: { id: true, userId: true, token: true, expiresAt: true, revokedAt: true },
    });
  }

  async revokeByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
