/**
 * Subscription types - aligned with backend schemas
 */

export interface SubscribeRequest {
  // Payer information
  payer: {
    walletAddress: string;
    name: string;
    email?: string;
  };

  // Subscription details
  planId: string;
  tokenMint: string;

  // On-chain delegation proof
  delegateTxSignature: string;
  delegateAuthority: string;
  delegateApprovedAt: string; // ISO 8601 datetime
}

export interface Subscription {
  id: string;
  planId: string;
  payerId: string;
  tokenMint: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  nextDueAt: string;
  lastPaidAt: string;
  delegateAuthority: string;
  delegateTxSignature: string;
  delegateApprovedAt: string;
  tokenDecimals: number;
  totalApprovedAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payer {
  id: string;
  walletAddress: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeResponse {
  message: string;
  subscription: Subscription & {
    plan?: {
      id: string;
      name: string;
      description?: string;
      isRecurring: boolean;
    };
    payer?: Payer;
  };
  payer: Payer & {
    isNew: boolean;
  };
}
