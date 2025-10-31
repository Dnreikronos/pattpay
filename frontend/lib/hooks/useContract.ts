/**
 * Hook to initialize Anchor program with user's wallet
 * Provides access to the PattPay contract
 *
 * IMPORTANT: This hook uses useWallet() which now shares state globally via WalletProvider.
 * This ensures that when the user connects their wallet in one component, all other
 * components (including this one) see the connected state immediately.
 */

import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { RPC_URL } from "@/lib/solana/config";
import idl from "@/lib/solana/idl.json";
import { useWallet } from "./useWallet";

export function useContract() {
  // Now uses shared wallet context - will see updates from any component that calls connect()
  const { publicKey: walletAddress } = useWallet();

  // Connection is always available
  const connection = useMemo(() => {
    return new Connection(RPC_URL, "confirmed");
  }, []);

  // Program only available when wallet is connected
  const { program, isReady } = useMemo(() => {
    // Wallet not connected yet
    if (!walletAddress) {
      return {
        program: null,
        isReady: false,
      };
    }

    try {
      // Get the Phantom provider from window
      const phantomProvider = (
        window as typeof window & {
          phantom?: { solana?: unknown };
        }
      ).phantom?.solana;

      if (!phantomProvider) {
        console.warn("Phantom provider not found");
        return {
          program: null,
          isReady: false,
        };
      }

      // Create Anchor provider with Phantom wallet
      const provider = new AnchorProvider(
        connection,
        phantomProvider as never,
        {
          commitment: "confirmed",
        }
      );

      // Initialize the program (same as backend)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = new Program(idl as any, provider);

      console.log("Contract initialized successfully", {
        programId: program.programId.toString(),
      });

      return {
        program,
        isReady: true,
      };
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      return {
        program: null,
        isReady: false,
      };
    }
  }, [walletAddress, connection]);

  return {
    connection,
    program,
    isReady,
  };
}
