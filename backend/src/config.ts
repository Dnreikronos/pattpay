import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3001"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL is required"),
  SOLANA_NETWORK: z.enum(["mainnet", "devnet"]).default("mainnet"),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

const rawConfig = parseEnv();

// Parse CORS origins from comma-separated FRONTEND_URL
const corsOrigins = rawConfig.FRONTEND_URL.split(",")
  .map((url) => url.trim())
  .filter(Boolean);

export const config = {
  ...rawConfig,
  CORS_ORIGINS: corsOrigins,
};
