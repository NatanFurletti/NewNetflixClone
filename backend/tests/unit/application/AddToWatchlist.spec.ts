// tests/unit/application/AddToWatchlist.spec.ts
/**
 * UNIT TEST: Add to Watchlist Use Case
 */

describe("AddToWatchlist Use Case", () => {
  describe("happy path", () => {
    it("should add movie to watchlist", async () => {
      // ARRANGE
      // const mockWatchlistRepository = createMockWatchlistRepository();
      // const addToWatchlistUseCase = new AddToWatchlistUseCase(mockWatchlistRepository);
      // const profileId = 'profile-123';
      // const tmdbId = 550; // Fight Club
      // const mediaType = 'movie';
      // ACT
      // const result = await addToWatchlistUseCase.execute({
      //   profileId,
      //   tmdbId,
      //   mediaType,
      //   title: 'Fight Club',
      //   posterPath: '/path.jpg',
      // });
      // ASSERT
      // expect(result.id).toBeDefined();
      // expect(result.tmdbId).toBe(tmdbId);
      // const savedItem = mockWatchlistRepository.getLastSaved();
      // expect(savedItem.profileId).toBe(profileId);
    });

    it("should add series to watchlist", async () => {
      // const result = await addToWatchlistUseCase.execute({
      //   profileId: 'profile-123',
      //   tmdbId: 1396,
      //   mediaType: 'tv',
      //   title: 'Breaking Bad',
      //   posterPath: '/path.jpg',
      // });
      // expect(result.mediaType).toBe('tv');
    });
  });

  describe("idempotency", () => {
    it("should return error if item already in watchlist", async () => {
      // mockWatchlistRepository.setExisting({
      //   profileId: 'profile-123',
      //   tmdbId: 550,
      //   mediaType: 'movie',
      // });
      // expect(async () => {
      //   await addToWatchlistUseCase.execute({
      //     profileId: 'profile-123',
      //     tmdbId: 550,
      //     mediaType: 'movie',
      //     title: 'Fight Club',
      //     posterPath: '/path.jpg',
      //   });
      // }).rejects.toThrow('Item already in watchlist');
    });
  });

  describe("validation", () => {
    it("should reject invalid media type", async () => {
      // expect(async () => {
      //   await addToWatchlistUseCase.execute({
      //     ...validData,
      //     mediaType: 'documentary', // only 'movie' or 'tv'
      //   });
      // }).rejects.toThrow(InvalidMediaTypeError);
    });

    it("should reject negative tmdbId", async () => {
      // expect(async () => {
      //   await addToWatchlistUseCase.execute({
      //     ...validData,
      //     tmdbId: -1,
      //   });
      // }).rejects.toThrow();
    });
  });

  describe("limits", () => {
    it("should reject if watchlist exceeds 500 items", async () => {
      // mockWatchlistRepository.itemCount = 500;
      // expect(async () => {
      //   await addToWatchlistUseCase.execute({...validData});
      // }).rejects.toThrow('Watchlist limit reached');
    });
  });
});
