/**
 * Solana configuration for PattPay
 * Contains Program ID, RPC URL, and network settings
 */

import { PublicKey } from "@solana/web3.js";
import idl from "./idl.json";

// Program ID from the deployed contract
export const PROGRAM_ID = new PublicKey(idl.address);

// RPC URL - defaults to devnet
export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Network
export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet") || "devnet";

// Token Program ID
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

// System Program ID
export const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);

// Supported tokens by network
export const TOKENS = {
  devnet: {
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      mint: "EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS",
      decimals: 6,
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      decimals: 6,
    },
  },
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
} as const;

// Get tokens for current network
export const getCurrentTokens = () => TOKENS[SOLANA_NETWORK];
