import type { PhantomProvider, PhantomWindow } from "../types/wallet";

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const phantomWindow = window as PhantomWindow;
  return !!(phantomWindow.solana?.isPhantom || phantomWindow.phantom?.solana?.isPhantom);
}

/**
 * Get Phantom provider instance
 * @returns Phantom provider or null if not installed
 */
export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;

  const phantomWindow = window as PhantomWindow;

  // Try window.solana first (Phantom injected directly)
  if (phantomWindow.solana?.isPhantom) {
    return phantomWindow.solana;
  }

  // Try window.phantom.solana (newer Phantom versions)
  if (phantomWindow.phantom?.solana?.isPhantom) {
    return phantomWindow.phantom.solana;
  }

  return null;
}

/**
 * Format wallet address for display
 * @param address - Full Solana address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Formatted address like "7xKX...gAsU"
 */
export function formatWalletAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2) return address;

  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validate if a string is a valid Solana address
 * @param address - Address to validate
 * @returns True if valid Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address) return false;

  // Solana addresses are base58 encoded, 32-44 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}

/**
 * Get Phantom installation URL
 */
export function getPhantomInstallUrl(): string {
  return "https://phantom.app/download";
}
