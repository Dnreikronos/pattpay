import { type FastifyInstance } from "fastify";
import {
  createPaymentExecution,
  getPaymentExecution,
  getPaymentExecutions,
} from "../controllers/payment-execution.controller.js";
import type {
  CreatePaymentExecutionBody,
  GetPaymentExecutionsQuery,
  PaymentExecutionIdParam,
} from "../schemas/payment-execution.schema.js";

export async function paymentExecutionRoutes(fastify: FastifyInstance) {
  // POST /api/payment-executions - Record a one-time payment (PUBLIC - no auth)
  fastify.post<{ Body: CreatePaymentExecutionBody }>("/", {
    schema: {
      tags: ["Payment Executions"],
      summary: "Record a one-time payment execution (public endpoint)",
      description:
        "Record a payment execution after a successful one-time payment made directly via the user's wallet.\n\n" +
        "**⚠️ IMPORTANT:** This endpoint is ONLY for one-time (non-recurring) payments.\n\n" +
        "**🔓 PUBLIC ENDPOINT:** No authentication required. Called by payers who may not have accounts.\n\n" +
        "**FRONTEND FLOW:**\n" +
        "1. User selects a one-time plan and token\n" +
        "2. Frontend calls Solana to transfer tokens directly from user to receiver\n" +
        "3. User signs and confirms the transaction\n" +
        "4. Frontend receives transaction signature\n" +
        "5. Frontend calls POST /api/payment-executions to record the payment\n\n" +
        "**For recurring subscriptions:** Payment executions are created automatically by the relayer. " +
        "Use POST /api/subscribe instead.",
      body: {
        type: "object",
        required: ["planId", "txSignature", "tokenMint", "amount"],
        properties: {
          planId: {
            type: "string",
            format: "uuid",
            description: "ID of the one-time payment plan",
          },
          txSignature: {
            type: "string",
            description:
              "Transaction signature from the successful Solana payment transaction",
          },
          tokenMint: {
            type: "string",
            description:
              "SPL token mint address used for payment (e.g., USDC/USDT/SOL)",
          },
          amount: {
            type: "number",
            exclusiveMinimum: 0,
            minimum: 0.000001,
            description: "Amount paid (in token units, e.g., 10.5 USDC)",
          },
          executedBy: {
            type: "string",
            description:
              "Optional: Wallet address of the payer for tracking purposes",
          },
        },
      },
      response: {
        201: {
          description: "Payment execution recorded successfully",
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Payment execution recorded successfully",
            },
            paymentExecution: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                planId: { type: "string", format: "uuid" },
                subscriptionId: {
                  type: "null",
                  description: "Always null for one-time payments",
                },
                txSignature: { type: "string" },
                executedBy: { type: "string" },
                status: {
                  type: "string",
                  enum: ["SUCCESS", "FAILED"],
                },
                executedAt: { type: "string", format: "date-time" },
                tokenMint: { type: "string" },
                amount: { type: "string" },
                errorMessage: { type: "null" },
                plan: {
                  type: "object",
                  description: "Plan details with receiver information",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error, token not supported, or plan is recurring",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        404: {
          description: "Plan not found",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        409: {
          description:
            "Payment with this transaction signature already exists (duplicate)",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
            paymentExecutionId: {
              type: "string",
              format: "uuid",
              description: "ID of the existing payment execution",
            },
          },
        },
      },
    },
    handler: createPaymentExecution,
  });

  // GET /api/payment-executions - List all payment executions
  fastify.get<{ Querystring: GetPaymentExecutionsQuery }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Executions"],
      summary: "List all payment executions",
      description:
        "Get paginated list of all payment executions (both one-time and recurring) " +
        "for the authenticated receiver. Useful for viewing payment history, " +
        "analytics, and reconciliation.",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            minimum: 1,
            default: 1,
            description: "Page number for pagination",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
            description: "Number of items per page",
          },
          status: {
            type: "string",
            enum: ["SUCCESS", "FAILED", "all"],
            default: "all",
            description: "Filter by payment status",
          },
          planId: {
            type: "string",
            format: "uuid",
            description: "Filter by specific plan ID",
          },
          tokenMint: {
            type: "string",
            description: "Filter by token mint address (e.g., USDC only)",
          },
          dateFrom: {
            type: "string",
            format: "date-time",
            description: "Filter payments executed on or after this date",
          },
          dateTo: {
            type: "string",
            format: "date-time",
            description: "Filter payments executed on or before this date",
          },
          search: {
            type: "string",
            description: "Search by transaction signature",
          },
        },
      },
      response: {
        200: {
          description: "List of payment executions",
          type: "object",
          properties: {
            data: {
              type: "array",
              description: "Array of payment execution records",
              items: { type: "object" },
            },
            meta: {
              type: "object",
              description: "Pagination metadata",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          },
        },
      },
    },
    handler: getPaymentExecutions,
  });

  // GET /api/payment-executions/:id - Get payment execution details
  fastify.get<{ Params: PaymentExecutionIdParam }>("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Executions"],
      summary: "Get payment execution by ID",
      description:
        "Retrieve detailed information about a specific payment execution, " +
        "including plan details, subscription info (if recurring), and transaction data.",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Payment execution ID",
          },
        },
      },
      response: {
        200: {
          description: "Payment execution details",
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            planId: { type: "string", format: "uuid" },
            subscriptionId: {
              type: "string",
              format: "uuid",
              description: "Present only for recurring payments",
            },
            txSignature: { type: "string" },
            executedBy: { type: "string" },
            status: { type: "string" },
            executedAt: { type: "string", format: "date-time" },
            tokenMint: { type: "string" },
            amount: { type: "string" },
            plan: { type: "object" },
            subscription: { type: "object" },
          },
        },
        403: {
          description:
            "You do not have permission to view this payment execution",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        404: {
          description: "Payment execution not found",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: getPaymentExecution,
  });
}
