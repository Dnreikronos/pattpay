import z from "zod";

/**
 * Schema for creating a new subscription
 *
 * FRONTEND FLOW:
 * 1. User selects a plan and token to pay with
 * 2. Frontend creates payer first via POST /api/payers (if not exists)
 * 3. Frontend calls the Solana contract's `approve_delegate` instruction with:
 *    - subscription_id: Generated UUID for this subscription
 *    - approved_amount: Total amount to approve (plan.price * plan.durationMonths)
 *    - payer: User's wallet (signer)
 *    - receiver: Plan receiver's wallet
 *    - token accounts and mint
 * 4. User signs the transaction
 * 5. Frontend gets the transaction signature and PDA address
 * 6. Frontend calls POST /api/subscriptions with payerId and delegation details
 * 7. Backend creates the subscription record
 *
 * CONTRACT INTERACTION:
 * The approve_delegate instruction creates a PDA (delegate_approval) that stores:
 * - Approved amount for the subscription
 * - Payer and receiver information
 * - Token mint and accounts
 * This PDA gives the backend's relayer authority to withdraw funds periodically
 */
export const createSubscriptionSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
  payerId: z.string().uuid("Invalid payer ID"),
  tokenMint: z.string().min(1, "Token mint required"),
  delegateTxSignature: z.string().min(1, "Transaction signature required"),
  delegateAuthority: z.string().min(1, "Delegate authority required"),
  delegateApprovedAt: z.string().datetime("Invalid datetime"),
});

export type CreateSubscriptionBody = z.infer<typeof createSubscriptionSchema>;

export const getSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED", "all"]).default("all"),
  planId: z.string().uuid().optional(),
  tokenMint: z.string().optional(), // Filter by token type (USDC/USDT mint address)
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(), // Search by payer name, wallet address, or plan name
});

export type GetSubscriptionQuery = z.infer<typeof getSubscriptionsQuerySchema>;

export const subscriptionIdParamSchema = z.object({
  id: z.uuid("Invalid subscription ID"),
});

export type subscriptionIdParam = z.infer<typeof subscriptionIdParamSchema>;

/**
 * Schema for cancelling a subscription
 *
 * FRONTEND FLOW:
 * 1. User clicks cancel subscription
 * 2. Frontend calls the Solana contract's `revoke_delegate` instruction with:
 *    - subscription_id: The subscription UUID
 *    - payer: User's wallet (must be the original payer)
 * 3. This closes the delegate_approval PDA and revokes authority
 * 4. User signs the transaction
 * 5. Frontend gets the transaction signature
 * 6. Frontend calls DELETE /api/subscriptions/:id with the revoke signature
 * 7. Backend marks subscription as CANCELLED
 *
 * CONTRACT INTERACTION:
 * The revoke_delegate instruction closes the PDA, preventing any further charges
 * The relayer will no longer be able to call charge_subscription for this subscription
 */
