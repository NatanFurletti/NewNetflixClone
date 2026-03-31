// src/infrastructure/repositories/PrismaProfileRepository.ts
import { PrismaClient } from '@prisma/client';
import { Profile } from '@/domain/entities/Profile';
import { IProfileRepository } from '@/domain/repositories/IProfileRepository';

export class PrismaProfileRepository implements IProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async create(profile: Profile): Promise<Profile> {
    await this.prisma.profile.create({
      data: {
        id: profile.id,
        userId: profile.userId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isKids: profile.isKids,
      },
    });

    return profile;
  }

  async findById(id: string): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Profile.create(data.id, data.userId, data.name, {
      avatarUrl: data.avatarUrl ?? undefined,
      isKids: data.isKids,
    });
  }

  async findByUserId(userId: string): Promise<Profile[]> {
    const data = await this.prisma.profile.findMany({
      where: { userId },
    });

    return data.map((p: any) =>
      Profile.create(p.id, p.userId, p.name, {
        avatarUrl: p.avatarUrl ?? undefined,
        isKids: p.isKids,
      })
    );
  }

  async update(id: string, profile: Partial<Profile>): Promise<Profile> {
    const updated = await this.prisma.profile.update({
      where: { id },
      data: {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        isKids: profile.isKids,
      },
    });

    return Profile.create(updated.id, updated.userId, updated.name, {
      avatarUrl: updated.avatarUrl ?? undefined,
      isKids: updated.isKids,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.profile.delete({
      where: { id },
    });
  }
}
