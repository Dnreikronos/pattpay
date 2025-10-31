/**
 * Wallet Storage Utility
 * Manages connected wallet address persistence in localStorage
 * Pattern: Similar to TokenStorage
 */

const WALLET_ADDRESS_KEY = "phantom_wallet_address";

export const WalletStorage = {
  /**
   * Get stored wallet address
   * @returns Wallet address or null if not found
   */
  get(): string | null {
    if (typeof window === "undefined") return null;

    try {
      return localStorage.getItem(WALLET_ADDRESS_KEY);
    } catch (error) {
      console.error("Failed to get wallet address from storage:", error);
      return null;
    }
  },

  /**
   * Store wallet address
   * @param address - Solana wallet address to store
   */
  set(address: string): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(WALLET_ADDRESS_KEY, address);
    } catch (error) {
      console.error("Failed to store wallet address:", error);
    }
  },

  /**
   * Remove stored wallet address
   */
  remove(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(WALLET_ADDRESS_KEY);
    } catch (error) {
      console.error("Failed to remove wallet address from storage:", error);
    }
  },

  /**
   * Check if wallet address exists in storage
   * @returns True if wallet address is stored
   */
  exists(): boolean {
    return this.get() !== null;
  },
};
