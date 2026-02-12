/**
 * Hook to transfer tokens for one-time payments
 * Uses SPL Token transfer (supports both Token and Token-2022)
 */

import { useState, useCallback } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useContract } from "./useContract";

export interface TransferTokensParams {
  receiverWallet: string; // Receiver's wallet address
  tokenMint: string; // Token mint address
  amount: number; // Amount in token units (will be converted with decimals)
  tokenDecimals: number; // Token decimals for conversion
}

export interface TransferTokensResult {
  txSignature: string;
}

export function useTransferTokens() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useContract();

  const transferTokens = useCallback(
    async (params: TransferTokensParams): Promise<TransferTokensResult> => {
      console.log("=== transferTokens called ===");
      console.log("connection:", !!connection);
      console.log("params:", params);

      if (!connection) {
        const error = `Connection not available`;
        console.error(error);
        throw new Error(error);
      }

      const phantomProvider = (
        window as typeof window & {
          phantom?: {
            solana?: {
              publicKey?: { toString: () => string };
              signAndSendTransaction: (transaction: Transaction) => Promise<{
                signature: string;
              }>;
            };
          };
        }
      ).phantom?.solana;

      if (!phantomProvider) {
        throw new Error("Phantom wallet not found");
      }

      // Get wallet address from Phantom provider directly
      const walletAddress = phantomProvider.publicKey?.toString();
      console.log("walletAddress from Phantom:", walletAddress);

      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const { receiverWallet, tokenMint, amount, tokenDecimals } = params;
        console.log("Step 1: Preparing transaction...");

        // Convert addresses to PublicKey
        const fromPubkey = new PublicKey(walletAddress);
        const toPubkey = new PublicKey(receiverWallet);
        const tokenMintPubkey = new PublicKey(tokenMint);
        console.log("Step 2: Addresses converted to PublicKey");

        // Detect which token program owns this mint (Token or Token-2022)
        console.log("Step 3: Detecting token program...");
        const mintAccountInfo =
          await connection.getAccountInfo(tokenMintPubkey);
        if (!mintAccountInfo) {
          throw new Error("Mint account not found");
        }
        // Use string comparison to avoid PublicKey class mismatch across package versions
        const tokenProgramId =
          mintAccountInfo.owner.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;
        console.log("Detected token program:", tokenProgramId.toString());

        // Get Associated Token Accounts (using the correct token program)
        console.log("Step 4: Getting token accounts...");
        const fromTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          fromPubkey,
          false,
          tokenProgramId
        );

        const toTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          toPubkey,
          false,
          tokenProgramId
        );
        console.log("Token accounts:", {
          from: fromTokenAccount.toString(),
          to: toTokenAccount.toString(),
        });

        // Convert amount to smallest unit (with decimals)
        const amountInSmallestUnit = Math.floor(
          amount * Math.pow(10, tokenDecimals)
        );
        console.log("Step 5: Amount converted:", amountInSmallestUnit);

        // Build transaction
        console.log("Step 6: Creating transaction...");
        const transaction = new Transaction();

        // Create receiver ATA if it doesn't exist
        const toAtaInfo = await connection.getAccountInfo(toTokenAccount);
        if (!toAtaInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey,
              toTokenAccount,
              toPubkey,
              tokenMintPubkey,
              tokenProgramId
            )
          );
        }

        // Use transferChecked for Token-2022 compatibility
        transaction.add(
          createTransferCheckedInstruction(
            fromTokenAccount,
            tokenMintPubkey,
            toTokenAccount,
            fromPubkey,
            amountInSmallestUnit,
            tokenDecimals,
            [],
            tokenProgramId
          )
        );
        console.log("Step 7: Transaction created");

        // Get recent blockhash
        console.log("Step 8: Getting recent blockhash...");
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;
        console.log("Step 9: Blockhash set");

        console.log("Step 10: Sending transaction to Phantom for signing...");

        // Sign and send transaction via Phantom
        const signed = await phantomProvider.signAndSendTransaction(
          transaction
        );

        console.log("Step 11: Transaction signed, signature:", signed.signature);

        // Wait for confirmation
        console.log("Step 12: Waiting for confirmation...");
        await connection.confirmTransaction(
          {
            signature: signed.signature,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        console.log("Step 13: Transaction confirmed!");

        setIsLoading(false);

        return {
          txSignature: signed.signature,
        };
      } catch (err) {
        console.error("Transfer error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to transfer tokens";
        setError(errorMessage);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
    },
    [connection]
  );

  return {
    transferTokens,
    isLoading,
    error,
  };
}
