/**
 * Payment execution types - aligned with backend schemas
 */

export interface CreatePaymentExecutionRequest {
  planId: string;
  txSignature: string;
  tokenMint: string;
  amount: number;
  executedBy?: string; // Payer wallet address (optional)
}

export interface PaymentExecution {
  id: string;
  planId: string;
  subscriptionId: string | null;
  txSignature: string;
  executedBy: string;
  status: "SUCCESS" | "FAILED";
  executedAt: string;
  tokenMint: string;
  amount: string;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentExecutionResponse {
  message: string;
  paymentExecution: PaymentExecution & {
    plan?: {
      id: string;
      name: string;
      description?: string;
      isRecurring: boolean;
    };
  };
}

/**
 * Custom error for duplicate payment attempts
 */
export class DuplicatePaymentError extends Error {
  constructor(public paymentExecutionId: string) {
    super("Payment already registered");
    this.name = "DuplicatePaymentError";
  }
}
