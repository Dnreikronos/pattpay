"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getPhantomProvider, isPhantomInstalled } from "../utils/wallet";
import { WalletStorage } from "../utils/wallet-storage";
import type { WalletError, WalletErrorCode } from "../types/wallet";

interface WalletContextValue {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: WalletError | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * Custom hook to access the wallet context
 * Throws an error if used outside of WalletProvider
 */
export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Wallet Provider that manages Phantom wallet state globally
 * This ensures all components share the same wallet connection state
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError | null>(null);

  /**
   * Create a wallet error object
   */
  const createError = useCallback(
    (code: WalletErrorCode, message: string, details?: string): WalletError => ({
      code,
      message,
      details,
    }),
    []
  );

  /**
   * Connect to Phantom wallet
   */
  const connect = useCallback(async () => {
    console.log("=== WalletProvider.connect called ===");
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Phantom is installed
      console.log("Checking if Phantom is installed...");
      if (!isPhantomInstalled()) {
        console.error("Phantom not installed");
        throw createError(
          "NOT_INSTALLED" as WalletErrorCode,
          "Phantom wallet not found",
          "Please install Phantom from phantom.app"
        );
      }
      console.log("Phantom is installed");

      // Get Phantom provider
      console.log("Getting Phantom provider...");
      const provider = getPhantomProvider();
      if (!provider) {
        console.error("Failed to get provider");
        throw createError(
          "CONNECTION_FAILED" as WalletErrorCode,
          "Failed to get Phantom provider"
        );
      }
      console.log("Phantom provider found:", provider);

      // Request connection
      console.log("Requesting connection to Phantom...");
      const response = await provider.connect();
      const address = response.publicKey.toString();
      console.log("Connection successful, address:", address);

      // Update state
      setPublicKey(address);
      setIsConnected(true);

      // Store in localStorage
      WalletStorage.set(address);

      console.log("Wallet connected:", address);
    } catch (err: unknown) {
      console.error("Failed to connect wallet:", err);

      // Handle specific error cases
      if (err && typeof err === "object" && "code" in err) {
        const errorCode = (err as { code: number }).code;

        if (errorCode === 4001) {
          // User rejected the request
          setError(
            createError(
              "USER_REJECTED" as WalletErrorCode,
              "Connection rejected",
              "You rejected the connection request"
            )
          );
        } else {
          setError(
            createError(
              "CONNECTION_FAILED" as WalletErrorCode,
              "Failed to connect wallet",
              String(err)
            )
          );
        }
      } else if (err && typeof err === "object" && "message" in err) {
        setError(err as WalletError);
      } else {
        setError(
          createError(
            "UNKNOWN" as WalletErrorCode,
            "Unknown error occurred",
            String(err)
          )
        );
      }

      setIsConnected(false);
      setPublicKey(null);
    } finally {
      setIsConnecting(false);
    }
  }, [createError]);

  /**
   * Disconnect from Phantom wallet
   */
  const disconnect = useCallback(async () => {
    try {
      const provider = getPhantomProvider();

      if (provider && provider.isConnected) {
        await provider.disconnect();
      }

      // Clear state
      setPublicKey(null);
      setIsConnected(false);
      setError(null);

      // Remove from localStorage
      WalletStorage.remove();

      console.log("Wallet disconnected");
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
      setError(
        createError(
          "DISCONNECTION_FAILED" as WalletErrorCode,
          "Failed to disconnect wallet",
          String(err)
        )
      );
    }
  }, [createError]);

  /**
   * Attempt to reconnect wallet on page load
   * Uses "onlyIfTrusted" to auto-connect if previously approved
   */
  const reconnect = useCallback(async () => {
    // Only try to reconnect if we have a stored address
    const storedAddress = WalletStorage.get();
    if (!storedAddress) return;

    if (!isPhantomInstalled()) return;

    const provider = getPhantomProvider();
    if (!provider) return;

    try {
      // Try to connect silently (only if previously approved)
      const response = await provider.connect({ onlyIfTrusted: true });
      const address = response.publicKey.toString();

      setPublicKey(address);
      setIsConnected(true);

      console.log("Wallet reconnected:", address);
    } catch (err) {
      // Silent fail - user needs to manually connect
      console.log("Auto-reconnect not available, user needs to manually connect");
      WalletStorage.remove();
    }
  }, []);

  /**
   * Auto-reconnect on mount
   */
  useEffect(() => {
    reconnect();
  }, [reconnect]);

  /**
   * Listen for wallet account changes
   */
  useEffect(() => {
    const provider = getPhantomProvider();
    if (!provider) return;

    const handleAccountChanged = (publicKey: unknown) => {
      if (publicKey) {
        const newAddress = String(publicKey);
        setPublicKey(newAddress);
        WalletStorage.set(newAddress);
        console.log("Wallet account changed:", newAddress);
      } else {
        // Wallet disconnected
        setPublicKey(null);
        setIsConnected(false);
        WalletStorage.remove();
        console.log("Wallet disconnected by user");
      }
    };

    provider.on("accountChanged", handleAccountChanged);

    // Cleanup
    return () => {
      provider.removeListener("accountChanged", handleAccountChanged);
    };
  }, []);

  const value: WalletContextValue = {
    publicKey,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    reconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
