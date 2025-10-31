/**
 * Hook for Phantom wallet integration
 *
 * IMPORTANT: This hook now uses WalletProvider context to share state globally.
 * All components calling useWallet() will share the same wallet connection state.
 *
 * This fixes the issue where useContract calling useWallet() would create a
 * separate instance and not see the wallet connection from the main component.
 */

import { useWalletContext } from "../providers/wallet-provider";

export interface UseWalletReturn {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: { code: string; message: string; details?: string } | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
}

/**
 * Custom hook for Phantom wallet integration
 * Consumes the shared WalletContext to ensure state is synchronized across all components
 */
export function useWallet(): UseWalletReturn {
  return useWalletContext();
}
