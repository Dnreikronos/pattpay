export interface TokenConfig {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
}

// Get network from environment (mainnet or devnet)
const NETWORK = process.env.SOLANA_NETWORK || "mainnet";

const TOKEN_CONFIGS: Record<string, Record<string, TokenConfig>> = {
  mainnet: {
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      decimals: 6,
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
    },
  },
  devnet: {
    USDT: {
      symbol: "USDT",
      name: "Tether USD (Devnet)",
      mint: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS", // Devnet USDT
      decimals: 6,
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin (Devnet)",
      mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
      decimals: 6,
    },
  },
};

export const SUPPORTED_TOKENS = TOKEN_CONFIGS[NETWORK] as Record<
  string,
  TokenConfig
>;

export function getTokenConfig(symbol: string): TokenConfig | null {
  return SUPPORTED_TOKENS[symbol] || null;
}

export function getSupportedTokenSymbols(): string[] {
  return Object.keys(SUPPORTED_TOKENS);
}
