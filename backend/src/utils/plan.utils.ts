import type { Plan, PlanToken, Receiver } from "@prisma/client";

// Type for Plan with relations needed for transformation
export type PlanWithRelations = Plan & {
  receiver: Receiver;
  planTokens: PlanToken[];
  _count?: {
    paymentExecutions: number;
  };
};

// Frontend CheckoutLink type
export interface CheckoutLink {
  id: string;
  name: string;
  amountUSDC?: number;
  amountUSDT?: number;
  status: "active" | "inactive";
  url: string;
  isRecurring: boolean;
  redirectUrl?: string;
  description?: string;
  createdAt: string;
  totalPayments: number;
  conversions: number;
  views: number;
  tokenPrices: Array<{
    id: string;
    token: string;
    tokenMint: string;
    tokenDecimals: number;
    price: string;
  }>;
  receiver?: {
    id: string;
    name: string;
    walletAddress: string;
  };
  expiresAt?: string;
  durationMonths?: number;
  periodSeconds?: number;
}

/**
 * Transforms a Plan from database format to frontend CheckoutLink format
 */
export function transformPlanToCheckoutLink(
  plan: PlanWithRelations
): CheckoutLink {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Extract USDC and USDT amounts from planTokens
  const usdcToken = plan.planTokens.find((t) => t.symbol === "USDC");
  const usdtToken = plan.planTokens.find((t) => t.symbol === "USDT");

  // Map status to lowercase
  const status = plan.status === "ACTIVE" ? "active" : "inactive";

  // Get totalPayments from count or default to 0
  const totalPayments = plan._count?.paymentExecutions ?? 0;

  return {
    id: plan.id,
    name: plan.name,
    ...(usdcToken && { amountUSDC: parseFloat(usdcToken.price.toString()) }),
    ...(usdtToken && { amountUSDT: parseFloat(usdtToken.price.toString()) }),
    status,
    url: `${frontendUrl}/payment/${plan.id}`,
    isRecurring: plan.isRecurring,
    ...(plan.redirectUrl && { redirectUrl: plan.redirectUrl }),
    ...(plan.description && { description: plan.description }),
    createdAt: plan.createdAt.toISOString(),
    totalPayments,
    conversions: 0, // Not tracked yet
    views: 0, // Not tracked yet
    tokenPrices: plan.planTokens.map((token) => ({
      id: token.id,
      token: token.symbol,
      tokenMint: token.tokenMint,
      tokenDecimals: token.tokenDecimals,
      price: token.price.toString(),
    })),
    receiver: {
      id: plan.receiver.id,
      name: plan.receiver.name,
      walletAddress: plan.receiver.walletAddress,
    },
    ...(plan.expiresAt && { expiresAt: plan.expiresAt.toISOString() }),
    ...(plan.durationMonths && { durationMonths: plan.durationMonths }),
    ...(plan.periodSeconds && { periodSeconds: plan.periodSeconds }),
  };
}

/**
 * Calculates the date range based on datePreset filter
 */
export function getDateRangeFromPreset(
  preset: "last-7-days" | "last-30-days" | "last-90-days"
): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date();

  switch (preset) {
    case "last-7-days":
      from.setDate(now.getDate() - 7);
      break;
    case "last-30-days":
      from.setDate(now.getDate() - 30);
      break;
    case "last-90-days":
      from.setDate(now.getDate() - 90);
      break;
  }

  return { from, to: now };
}
