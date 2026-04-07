import { z } from "zod";

/**
 * Schema for the simplified subscribe endpoint
 *
 * This endpoint combines payer creation/retrieval and subscription creation
 * for recurring plans only. One-time payments are handled on the frontend.
 *
 * FRONTEND FLOW:
 * 1. User selects a recurring plan and token to pay with
 * 2. Frontend calls the Solana contract's `approve_delegate` instruction
 * 3. User signs the transaction
 * 4. Frontend calls POST /api/subscribe with all necessary information
 * 5. Backend creates/retrieves payer and creates subscription in one call
 */
export const subscribeSchema = z.object({
  payer: z.object({
    walletAddress: z.string().min(1, "Wallet address is required").max(255),
    name: z.string().min(1, "Name is required").max(255),
    email: z.email("Invalid email").optional(),
  }),

  planId: z.uuid("Invalid plan ID"),
  subscriptionId: z.uuid("Invalid subscription ID"),
  tokenMint: z
    .string()
    .regex(
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      "Token mint must be a valid base58 Solana public key"
    ),

  delegateTxSignature: z.string().min(1, "Transaction signature required"),
  delegateAuthority: z.string().min(1, "Delegate authority required"),
  delegateApprovedAt: z.iso.datetime("Invalid datetime"),
});

export type SubscribeBody = z.infer<typeof subscribeSchema>;
