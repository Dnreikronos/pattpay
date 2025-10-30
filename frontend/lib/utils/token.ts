/**
 * Token Storage Utility
 * Simple wrapper around localStorage for JWT token management
 */

const TOKEN_KEY = 'pattpay_auth_token';

export const TokenStorage = {
  /**
   * Get token from localStorage
   */
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Save token to localStorage
   */
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove token from localStorage
   */
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if token exists
   */
  exists: (): boolean => {
    return !!TokenStorage.get();
  },
};
