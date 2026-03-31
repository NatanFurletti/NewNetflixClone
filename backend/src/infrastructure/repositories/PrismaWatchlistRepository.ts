// src/infrastructure/repositories/PrismaWatchlistRepository.ts
import { PrismaClient } from '@prisma/client';
import { WatchlistItem } from '@/domain/entities/WatchlistItem';
import { IWatchlistRepository } from '@/domain/repositories/IWatchlistRepository';

export class PrismaWatchlistRepository implements IWatchlistRepository {
  constructor(private prisma: PrismaClient) {}

  async create(item: WatchlistItem): Promise<WatchlistItem> {
    await this.prisma.watchlistItem.create({
      data: {
        id: item.id,
        profileId: item.profileId,
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
      },
    });

    return item;
  }

  async findById(id: string): Promise<WatchlistItem | null> {
    const data = await this.prisma.watchlistItem.findUnique({
      where: { id },
    });

    if (!data) return null;

    return WatchlistItem.create(
      data.id,
      data.profileId,
      data.tmdbId,
      data.mediaType as 'movie' | 'tv',
      data.title,
      data.posterPath
    );
  }

  async findByProfileAndTmdbId(
    profileId: string,
    tmdbId: number,
    mediaType: string
  ): Promise<WatchlistItem | null> {
    const data = await this.prisma.watchlistItem.findUnique({
      where: {
        profileId_tmdbId_mediaType: {
          profileId,
          tmdbId,
          mediaType,
        },
      },
    });

    if (!data) return null;

    return WatchlistItem.create(
      data.id,
      data.profileId,
      data.tmdbId,
      data.mediaType as 'movie' | 'tv',
      data.title,
      data.posterPath
    );
  }

  async findByProfileId(
    profileId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<WatchlistItem[]> {
    const data = await this.prisma.watchlistItem.findMany({
      where: { profileId },
      take: limit,
      skip: offset,
      orderBy: { addedAt: 'desc' },
    });

    return data.map((item: any) =>
      WatchlistItem.create(
        item.id,
        item.profileId,
        item.tmdbId,
        item.mediaType as 'movie' | 'tv',
        item.title,
        item.posterPath
      )
    );
  }

  async count(profileId: string): Promise<number> {
    return this.prisma.watchlistItem.count({
      where: { profileId },
    });
  }

  async update(id: string, item: Partial<WatchlistItem>): Promise<WatchlistItem> {
    const updated = await this.prisma.watchlistItem.update({
      where: { id },
      data: {
        title: item.title,
        posterPath: item.posterPath,
      },
    });

    return WatchlistItem.create(
      updated.id,
      updated.profileId,
      updated.tmdbId,
      updated.mediaType as 'movie' | 'tv',
      updated.title,
      updated.posterPath
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.watchlistItem.delete({
      where: { id },
    });
  }
}
