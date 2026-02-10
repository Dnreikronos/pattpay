/**
 * Payment Executions API client
 * Handles one-time payment recording
 */

import {
  CreatePaymentExecutionRequest,
  CreatePaymentExecutionResponse,
  DuplicatePaymentError,
} from "@/lib/types/payment";

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

export const paymentExecutionsApi = {
  /**
   * Record a one-time payment execution
   * Called after user transfers tokens directly
   */
  async create(
    data: CreatePaymentExecutionRequest
  ): Promise<CreatePaymentExecutionResponse> {
    const response = await fetch(`${API_URL}/api/payment-executions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      // Handle duplicate payment (409 Conflict)
      if (response.status === 409) {
        throw new DuplicatePaymentError(json.paymentExecutionId);
      }

      throw new ApiError(
        json.statusCode || response.status,
        json.error || "Error",
        json.message || "Failed to create payment execution",
        json.details
      );
    }

    return json;
  },
};
