/**
 * Hook to approve delegation for recurring payments
 * Calls the approve_delegate instruction on the PattPay contract
 */

import { useState, useCallback, useRef } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
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

/**
 * Detect which token program owns a mint by checking the account's owner
 */
async function getTokenProgramForMint(
  connection: anchor.web3.Connection,
  mintPubkey: PublicKey
): Promise<PublicKey> {
  const mintAccountInfo = await connection.getAccountInfo(mintPubkey);
  if (!mintAccountInfo) {
    throw new Error("Mint account not found");
  }
  if (mintAccountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }
  return TOKEN_PROGRAM_ID;
}

export function useApproveDelegation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { program, connection, isReady } = useContract();
  const isExecutingRef = useRef(false);

  const approveDelegation = useCallback(
    async (
      params: ApproveDelegationParams
    ): Promise<ApproveDelegationResult> => {
      // Prevent double execution
      if (isExecutingRef.current) {
        throw new Error("Transaction already in progress");
      }
      isExecutingRef.current = true;

      console.log("=== approveDelegation called ===");
      console.log("isReady:", isReady);
      console.log("program:", !!program);
      console.log("connection:", !!connection);

      if (!isReady || !program || !connection) {
        isExecutingRef.current = false;
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

        // Detect which token program owns this mint (Token or Token-2022)
        const tokenProgramId = await getTokenProgramForMint(
          connection,
          tokenMintPubkey
        );
        console.log("Detected token program:", tokenProgramId.toString());

        // Strip hyphens from UUID to fit within Solana's 32-byte seed limit
        const seedId = subscriptionId.replace(/-/g, "");

        // Derive PDAs (same as backend)
        console.log("Program ID:", program.programId.toString());

        const [delegateApprovalPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("delegate"),
            Buffer.from(seedId),
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

        // Get Associated Token Accounts (using the correct token program)
        const payerTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          payerPubkey,
          false,
          tokenProgramId
        );

        const receiverTokenAccount = await getAssociatedTokenAddress(
          tokenMintPubkey,
          receiverPubkey,
          false,
          tokenProgramId
        );

        // Convert amount to smallest unit (with decimals)
        const amountInSmallestUnit = Math.floor(
          approvedAmount * Math.pow(10, tokenDecimals)
        );

        // Build pre-instructions to create ATAs if they don't exist
        const preInstructions = [];

        const payerAtaInfo = await connection.getAccountInfo(payerTokenAccount);
        if (!payerAtaInfo) {
          preInstructions.push(
            createAssociatedTokenAccountInstruction(
              payerPubkey,
              payerTokenAccount,
              payerPubkey,
              tokenMintPubkey,
              tokenProgramId
            )
          );
        }

        const receiverAtaInfo = await connection.getAccountInfo(
          receiverTokenAccount
        );
        if (!receiverAtaInfo) {
          preInstructions.push(
            createAssociatedTokenAccountInstruction(
              payerPubkey,
              receiverTokenAccount,
              receiverPubkey,
              tokenMintPubkey,
              tokenProgramId
            )
          );
        }

        // Call approve_delegate instruction
        const programMethods = program.methods as unknown as {
          approveDelegate: (
            subscriptionId: string,
            approvedAmount: anchor.BN
          ) => {
            accounts: (accounts: Record<string, unknown>) => {
              preInstructions: (
                ixs: anchor.web3.TransactionInstruction[]
              ) => {
                rpc: () => Promise<string>;
              };
              rpc: () => Promise<string>;
            };
          };
        };

        const tx = await programMethods
          .approveDelegate(seedId, new anchor.BN(amountInSmallestUnit))
          .accounts({
            delegateApproval: delegateApprovalPDA,
            delegatePda: delegatePDA,
            payer: payerPubkey,
            receiver: receiverPubkey,
            payerTokenAccount: payerTokenAccount,
            receiverTokenAccount: receiverTokenAccount,
            tokenMint: tokenMintPubkey,
            tokenProgram: tokenProgramId,
            systemProgram: SystemProgram.programId,
          })
          .preInstructions(preInstructions)
          .rpc();

        // Wait for confirmation
        await connection.confirmTransaction(tx, "confirmed");

        // Capture approval timestamp
        const delegateApprovedAt = new Date().toISOString();

        setIsLoading(false);
        isExecutingRef.current = false;

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
        isExecutingRef.current = false;
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
