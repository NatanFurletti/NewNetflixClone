// tests/helpers/mocks.ts
/**
 * Mock Services and Repositories
 */

export const createMockUserRepository = () => ({
  users: new Map(),
  create: jest.fn(async (user) => {
    const id = "user-" + Math.random().toString(36).substr(2, 9);
    const newUser = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }),
  findById: jest.fn(async (id) => this.users.get(id) || null),
  findByEmail: jest.fn(async (email) => {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }),
  update: jest.fn(async (id, data) => {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }),
  getLastSaved: function () {
    return Array.from(this.users.values()).pop();
  },
  setExisting: function (user) {
    this.users.set(user.id || "existing-user", user);
  },
  setUser: function (user) {
    this.users.set(user.id, user);
  },
});

export const createMockWatchlistRepository = () => ({
  items: new Map(),
  create: jest.fn(async (item) => {
    const id = "item-" + Math.random().toString(36).substr(2, 9);
    const newItem = { id, ...item };
    this.items.set(id, newItem);
    return newItem;
  }),
  findByProfileAndTmdbId: jest.fn(async (profileId, tmdbId) => {
    for (const item of this.items.values()) {
      if (item.profileId === profileId && item.tmdbId === tmdbId) {
        return item;
      }
    }
    return null;
  }),
  delete: jest.fn(async (id) => {
    this.items.delete(id);
  }),
  getLastSaved: function () {
    return Array.from(this.items.values()).pop();
  },
  setExisting: function (item) {
    this.items.set(item.id || "existing-item", item);
  },
});

export const createMockCacheService = () => ({
  cache: new Map(),
  getCalls: [],
  setCalls: [],
  get: jest.fn(async function (key) {
    this.getCalls.push(key);
    return this.cache.get(key) || null;
  }),
  set: jest.fn(async function (key, value, ttl) {
    this.setCalls.push({ key, value, ttl });
    this.cache.set(key, value);
  }),
  delete: jest.fn(async function (key) {
    this.cache.delete(key);
  }),
  setCached: function (key, value) {
    this.cache.set(key, value);
  },
  setStaleData: function (key, value) {
    this.cache.set(key, { ...value, meta: { cacheStatus: "STALE_FALLBACK" } });
  },
  setError: function (error) {
    this.error = error;
  },
  lastSet: function () {
    return this.setCalls[this.setCalls.length - 1] || {};
  },
  setWasCalled: function () {
    return this.setCalls.length > 0;
  },
});

export const createMockTmdbClient = () => ({
  response: null,
  error: null,
  requestCount: 0,
  getTrending: jest.fn(async function () {
    this.requestCount++;
    if (this.error) throw new Error(this.error);
    return this.response;
  }),
  getMovieDetails: jest.fn(async function (id) {
    if (this.error) throw new Error(this.error);
    return this.response;
  }),
  setResponse: function (data) {
    this.response = data;
  },
  setError: function (error) {
    this.error = error;
  },
});

export const createMockTokenService = () => ({
  generateAccessToken: jest.fn(async (userId) => {
    const exp = Math.floor(Date.now() / 1000) + 15 * 60; // 15 min
    return `access_${userId}_${exp}`;
  }),
  generateRefreshToken: jest.fn(async (userId) => {
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    return `refresh_${userId}_${exp}`;
  }),
  validateToken: jest.fn(async (token) => {
    if (!token) throw new Error("Invalid token");
    return { sub: "user-123" };
  }),
  tokenData: function (token) {
    // Parse mock token format
    const parts = token.split("_");
    return { exp: parseInt(parts[2] || 0) };
  },
});

export const createMockFailureTracker = () => ({
  failures: new Map(),
  recordFailure: jest.fn(function (email) {
    const count = (this.failures.get(email) || 0) + 1;
    this.failures.set(email, count);
  }),
  getFailureCount: jest.fn(function (email) {
    return this.failures.get(email) || 0;
  }),
  reset: jest.fn(function (email) {
    this.failures.delete(email);
  }),
});
