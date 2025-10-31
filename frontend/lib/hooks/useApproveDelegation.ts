/**
 * Hook to approve delegation for recurring payments
 * Calls the approve_delegate instruction on the PattPay contract
 */

import { useState, useCallback } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { useContract } from "./useContract";

export interface ApproveDelegationParams {
  subscriptionId: string; // UUID generated client-side
  approvedAmount: number; // Total amount to approve (price * duration)
  receiverWallet: string; // Receiver's wallet address
  tokenMint: string; // Token mint address
  tokenDecimals: number; // Token decimals for conversion
}

export interface ApproveDelegationResult {
  txSignature: string;
  delegateAuthority: string; // PDA address
  delegateApprovedAt: string; // ISO 8601 timestamp
}

export function useApproveDelegation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { program, connection, isReady } = useContract();

  const approveDelegation = useCallback(
    async (
      params: ApproveDelegationParams
    ): Promise<ApproveDelegationResult> => {
      console.log("=== approveDelegation called ===");
      console.log("isReady:", isReady);
      console.log("program:", !!program);
      console.log("connection:", !!connection);

      if (!isReady || !program || !connection) {
        const error = `Contract not ready. isReady: ${isReady}, program: ${!!program}, connection: ${!!connection}`;
        console.error(error);
        throw new Error(error);
      }

      // Get wallet address from Phantom provider directly
      const phantomProvider = (
        window as typeof window & {
          phantom?: { solana?: { publicKey?: { toString: () => string } } };
        }
      ).phantom?.solana;

      const walletAddress = phantomProvider?.publicKey?.toString();
      console.log("walletAddress from Phantom:", walletAddress);

      if (!walletAddress) {
        const error = "Wallet not connected";
        console.error(error);
        throw new Error(error);
      }

      setIsLoading(true);
      setError(null);

      try {
        const {
          subscriptionId,
          approvedAmount,
          receiverWallet,
          tokenMint,
          tokenDecimals,
        } = params;

        // Convert addresses to PublicKey
        const payerPubkey = new PublicKey(walletAddress);
        const receiverPubkey = new PublicKey(receiverWallet);
        const tokenMintPubkey = new PublicKey(tokenMint);

        // Derive PDAs (same as backend)
        console.log("Program ID:", program.programId.toString());

        const [delegateApprovalPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("delegate"),
            Buffer.from(subscriptionId),
            payerPubkey.toBuffer(),
          ],
          program.programId
        );

        const [delegatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("delegate_pda")],
          program.programId
        );

        console.log("Derived PDAs:", {
          delegateApprovalPDA: delegateApprovalPDA.toString(),
          delegatePDA: delegatePDA.toString(),
        });

        // Get Associated Token Accounts
        const payerTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          payerPubkey
        );

        const receiverTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          receiverPubkey
        );

        // Convert amount to smallest unit (with decimals)
        const amountInSmallestUnit = Math.floor(
          approvedAmount * Math.pow(10, tokenDecimals)
        );

        // Call approve_delegate instruction
        const programMethods = program.methods as unknown as {
          approveDelegate: (
            subscriptionId: string,
            approvedAmount: anchor.BN
          ) => {
            accounts: (accounts: Record<string, unknown>) => {
              rpc: () => Promise<string>;
            };
          };
        };

        const tx = await programMethods
          .approveDelegate(subscriptionId, new anchor.BN(amountInSmallestUnit))
          .accounts({
            delegateApproval: delegateApprovalPDA,
            delegatePda: delegatePDA,
            payer: payerPubkey,
            receiver: receiverPubkey,
            payerTokenAccount: payerTokenAccount,
            receiverTokenAccount: receiverTokenAccount,
            tokenMint: tokenMintPubkey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        // Wait for confirmation
        await connection.confirmTransaction(tx, "confirmed");

        // Capture approval timestamp
        const delegateApprovedAt = new Date().toISOString();

        setIsLoading(false);

        return {
          txSignature: tx,
          delegateAuthority: delegateApprovalPDA.toBase58(),
          delegateApprovedAt,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to approve delegation";
        setError(errorMessage);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
    },
    [isReady, program, connection]
  );

  return {
    approveDelegation,
    isLoading,
    error,
  };
}
