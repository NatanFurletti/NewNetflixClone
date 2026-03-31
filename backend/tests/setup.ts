// tests/setup.ts
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Mock Redis
jest.mock("redis", () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
  }),
}));

// Global test utilities
declare global {
  var testTimeout: number;
}

globalThis.testTimeout = 30000;
