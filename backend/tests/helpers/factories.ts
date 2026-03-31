// tests/helpers/factories.ts
/**
 * Test Factories
 * Generate realistic test data without hardcoding
 */

export const makeUser = (overrides: Partial<any> = {}) => ({
  id: "user-" + Math.random().toString(36).substr(2, 9),
  email: "user@example.com",
  passwordHash: "$2a$12$...",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makeProfile = (overrides: Partial<any> = {}) => ({
  id: "profile-" + Math.random().toString(36).substr(2, 9),
  name: "Test Profile",
  avatarUrl: null,
  isKids: false,
  userId: "user-123",
  createdAt: new Date(),
  ...overrides,
});

export const makeWatchlistItem = (overrides: Partial<any> = {}) => ({
  id: "item-" + Math.random().toString(36).substr(2, 9),
  tmdbId: 550,
  mediaType: "movie",
  title: "Fight Club",
  posterPath: "/pB8BM7pdSp6B6Ih7QSoOAT5QK2.jpg",
  profileId: "profile-123",
  addedAt: new Date(),
  ...overrides,
});

export const makeTrendingMovie = (overrides: Partial<any> = {}) => ({
  id: 550,
  title: "Fight Club",
  overview:
    "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into much more.",
  poster_path: "/pB8BM7pdSp6B6Ih7QSoOAT5QK2.jpg",
  backdrop_path: "/hZkgoQYus5vegHoetLkWJcn7fJ2.jpg",
  release_date: "1999-10-15",
  vote_average: 8.8,
  genres: [
    { id: 18, name: "Drama" },
    { id: 53, name: "Thriller" },
  ],
  runtime: 139,
  ...overrides,
});

export const generateValidJWT = (payload: any) => {
  // Simplified JWT generation for testing
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = "mock_signature";
  return `${header}.${body}.${signature}`;
};

export const generateExpiredJWT = (payload: any) => {
  return generateValidJWT({
    ...payload,
    exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
  });
};
