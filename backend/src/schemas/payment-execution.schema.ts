import { z } from "zod";

/**
 * Schema for creating a payment execution record (one-time payments)
 *
 * This is used when a user makes a one-time payment directly via their wallet.
 * The frontend handles the payment transaction, then calls this endpoint to
 * record the payment in the database.
 *
 * FRONTEND FLOW (One-Time Payments):
 * 1. User selects a non-recurring plan and token
 * 2. Frontend calls Solana to transfer tokens directly from user to receiver
 * 3. User signs and sends the transaction
 * 4. Frontend receives transaction signature
 * 5. Frontend calls POST /api/payment-executions to record the payment
 *
 * NOTE: For recurring subscriptions, payment executions are created automatically
 * by the relayer/processor. This endpoint is ONLY for one-time payments.
 */
export const createPaymentExecutionSchema = z.object({
  planId: z.uuid("Invalid plan ID"),
  txSignature: z.string().min(1, "Transaction signature is required"),
  tokenMint: z.string().min(1, "Token mint address is required"),
  amount: z.number().min(0.000001, "Amount must be positive"), // Changed from .positive() for better OpenAPI compatibility
  executedBy: z.string().optional(), // Payer wallet address (optional for tracking)
});

export type CreatePaymentExecutionBody = z.infer<
  typeof createPaymentExecutionSchema
>;

/**
 * Query parameters for listing payment executions
 */
export const getPaymentExecutionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1), // Changed from .positive() for better OpenAPI compatibility
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["SUCCESS", "FAILED", "all"]).default("all"),
  planId: z.uuid().optional(),
  tokenMint: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(), // Search by transaction signature
});

export type GetPaymentExecutionsQuery = z.infer<
  typeof getPaymentExecutionsQuerySchema
>;

export const paymentExecutionIdParamSchema = z.object({
  id: z.uuid("Invalid payment execution ID"),
});

export type PaymentExecutionIdParam = z.infer<
  typeof paymentExecutionIdParamSchema
>;
