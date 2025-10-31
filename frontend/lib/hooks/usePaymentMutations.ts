/**
 * TanStack Query mutations for payment operations
 * Orchestrates on-chain transactions + backend API calls
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { paymentExecutionsApi } from "@/lib/api/payment-executions";
import { useApproveDelegation } from "./useApproveDelegation";
import { useTransferTokens } from "./useTransferTokens";
import type { SubscribeRequest } from "@/lib/types/subscription";
import type { CreatePaymentExecutionRequest } from "@/lib/types/payment";

/**
 * Data needed to create a subscription
 */
export interface CreateSubscriptionData {
  // User info
  name: string;
  email?: string;

  // Plan and token info
  planId: string;
  tokenMint: string;
  tokenDecimals: number;

  // On-chain approval params
  subscriptionId: string; // UUID
  approvedAmount: number; // price * durationMonths
  receiverWallet: string;
}

/**
 * Hook to create a recurring subscription
 * Steps:
 * 1. Call approve_delegate on-chain
 * 2. Register subscription in backend
 */
export function useSubscribe() {
  const queryClient = useQueryClient();
  const { approveDelegation } = useApproveDelegation();

  return useMutation({
    mutationFn: async (data: CreateSubscriptionData) => {
      // Step 1: Approve delegation on-chain
      const approvalResult = await approveDelegation({
        subscriptionId: data.subscriptionId,
        approvedAmount: data.approvedAmount,
        receiverWallet: data.receiverWallet,
        tokenMint: data.tokenMint,
        tokenDecimals: data.tokenDecimals,
      });

      // Step 2: Register subscription in backend
      const walletPublicKey = (
        window as typeof window & {
          phantom?: { solana?: { publicKey?: { toString: () => string } } };
        }
      ).phantom?.solana?.publicKey?.toString();

      const subscribeRequest: SubscribeRequest = {
        payer: {
          walletAddress: walletPublicKey || "",
          name: data.name,
          email: data.email,
        },
        planId: data.planId,
        tokenMint: data.tokenMint,
        delegateTxSignature: approvalResult.txSignature,
        delegateAuthority: approvalResult.delegateAuthority,
        delegateApprovedAt: approvalResult.delegateApprovedAt,
      };

      const backendResult = await subscriptionsApi.subscribe(subscribeRequest);

      return {
        ...backendResult,
        onChainResult: approvalResult,
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["publicLink"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

/**
 * Data needed to create a one-time payment execution
 */
export interface CreatePaymentExecutionData {
  // Plan and token info
  planId: string;
  tokenMint: string;
  tokenDecimals: number;
  amount: number;

  // Transfer params
  receiverWallet: string;

  // Optional
  executedBy?: string; // Wallet address
}

/**
 * Hook to create a one-time payment execution
 * Steps:
 * 1. Transfer tokens on-chain
 * 2. Register payment in backend
 */
export function useCreatePaymentExecution() {
  const queryClient = useQueryClient();
  const { transferTokens } = useTransferTokens();

  return useMutation({
    mutationFn: async (data: CreatePaymentExecutionData) => {
      // Step 1: Transfer tokens on-chain
      const transferResult = await transferTokens({
        receiverWallet: data.receiverWallet,
        tokenMint: data.tokenMint,
        amount: data.amount,
        tokenDecimals: data.tokenDecimals,
      });

      // Step 2: Register payment execution in backend
      const createRequest: CreatePaymentExecutionRequest = {
        planId: data.planId,
        txSignature: transferResult.txSignature,
        tokenMint: data.tokenMint,
        amount: data.amount,
        executedBy: data.executedBy,
      };

      const backendResult = await paymentExecutionsApi.create(createRequest);

      return {
        ...backendResult,
        onChainResult: transferResult,
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["publicLink"] });
      queryClient.invalidateQueries({ queryKey: ["paymentExecutions"] });
    },
  });
}
