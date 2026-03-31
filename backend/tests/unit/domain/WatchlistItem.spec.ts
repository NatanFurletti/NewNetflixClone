// tests/unit/domain/WatchlistItem.spec.ts
/**
 * UNIT TEST: WatchlistItem Entity
 */
import { WatchlistItem } from "@/domain/entities/WatchlistItem";
import { InvalidMediaTypeError } from "@/domain/errors/DomainError";

describe("WatchlistItem Entity", () => {
  describe("createWatchlistItem", () => {
    it("should create watchlist item with required fields", () => {
      // ARRANGE
      const watchlistItemId = "item-123";
      const profileId = "profile-456";
      const tmdbId = 550; // Fight Club
      const mediaType = "movie";
      const title = "Fight Club";
      const posterPath = "/pB8BM7pdSp6B6Ih7QSoOAT5QK2.jpg";

      // ACT
      const item = WatchlistItem.create(
        watchlistItemId,
        profileId,
        tmdbId,
        mediaType as "movie" | "tv",
        title,
        posterPath,
      );

      // ASSERT
      expect(item.tmdbId).toBe(tmdbId);
      expect(item.mediaType).toBe(mediaType);
      expect(item.title).toBe(title);
    });

    it('should only allow media types: "movie" or "tv"', () => {
      expect(() => {
        WatchlistItem.create(
          "item-123",
          "profile-456",
          550,
          "series" as any,
          "Test",
          "/path",
        );
      }).toThrow(InvalidMediaTypeError);
    });

    it("should set addedAt to current date", () => {
      const beforeCreation = new Date();
      const item = WatchlistItem.create(
        "item-123",
        "profile-456",
        550,
        "movie",
        "Fight Club",
        "/path",
      );
      expect(item.addedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
    });
  });
});
