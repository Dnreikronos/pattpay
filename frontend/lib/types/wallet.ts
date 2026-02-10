import { PublicKey, Transaction } from "@solana/web3.js";

/**
 * Phantom Provider interface
 * Based on Phantom's official API: https://docs.phantom.app/developer-powertools/
 */
export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  on: (event: string, handler: (args: unknown) => void) => void;
  removeListener: (event: string, handler: (args: unknown) => void) => void;
}

/**
 * Extended Window interface to include Phantom provider
 */
export interface PhantomWindow extends Window {
  solana?: PhantomProvider;
  phantom?: {
    solana?: PhantomProvider;
  };
}

/**
 * Wallet connection state
 */
export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: WalletError | null;
}

/**
 * Wallet error types
 */
export enum WalletErrorCode {
  NOT_INSTALLED = "NOT_INSTALLED",
  USER_REJECTED = "USER_REJECTED",
  CONNECTION_FAILED = "CONNECTION_FAILED",
  DISCONNECTION_FAILED = "DISCONNECTION_FAILED",
  UNKNOWN = "UNKNOWN",
}

/**
 * Wallet error interface
 */
export interface WalletError {
  code: WalletErrorCode;
  message: string;
  details?: string;
}
