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
  // Payer information (will be used to create or find payer)
  payer: z.object({
    walletAddress: z.string().min(1, "Wallet address is required").max(255),
    name: z.string().min(1, "Name is required").max(255),
    email: z.email("Invalid email").optional(),
  }),

  // Subscription details
  planId: z.uuid("Invalid plan ID"),
  tokenMint: z.string().min(1, "Token mint required"),

  // On-chain delegation proof
  delegateTxSignature: z.string().min(1, "Transaction signature required"),
  delegateAuthority: z.string().min(1, "Delegate authority required"),
  delegateApprovedAt: z.iso.datetime("Invalid datetime"),
});

export type SubscribeBody = z.infer<typeof subscribeSchema>;
