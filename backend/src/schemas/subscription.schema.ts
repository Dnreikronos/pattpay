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

