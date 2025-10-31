/**
 * Subscriptions API client
 * Handles subscription creation for recurring payments
 */

import {
  SubscribeRequest,
  SubscribeResponse,
} from "@/lib/types/subscription";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const subscriptionsApi = {
  /**
   * Create a new subscription (recurring payment)
   * Called after user approves delegate on-chain
   */
  async subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    const response = await fetch(`${API_URL}/api/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new ApiError(
        json.statusCode || response.status,
        json.error || "Error",
        json.message || "Failed to create subscription",
        json.details
      );
    }

    return json;
  },
};
