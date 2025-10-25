import { config } from "dotenv";
import { afterAll, beforeAll } from "vitest";

config();

// Mock environment variables for testing
process.env.JWT_SECRET = "test-jwt-secret-with-at-least-32-characters-long";
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.FRONTEND_URL = "https://test.pattpay.com";
process.env.SOLANA_NETWORK = "devnet";

// Setup and teardown
beforeAll(async () => {
  // You can add global setup here (e.g., database seeding)
});

afterAll(async () => {
  // Cleanup after all tests
});
