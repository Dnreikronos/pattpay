import { type FastifyInstance } from "fastify";
import {
  createSubscription,
  getSubscriptions,
  getSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import type {
  CreateSubscriptionBody,
  GetSubscriptionQuery,
  subscriptionIdParam,
  CancelSubscriptionBody,
} from "../schemas/subscription.schema.js";

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // POST /api/subscriptions - Create subscription after on-chain approval
  fastify.post<{ Body: CreateSubscriptionBody }>("/", {
    schema: {
      tags: ["Subscriptions"],
      summary: "Create a subscription",
      description:
        "Create a new subscription after successful on-chain delegate approval. " +
        "Call this AFTER: 1) Payer created via POST /api/payers, and 2) User approved delegation via approve_delegate contract instruction. " +
        "The payer must already exist in the database.",
      body: {
        type: "object",
        required: [
          "planId",
          "payerId",
          "tokenMint",
          "delegateTxSignature",
          "delegateAuthority",
          "delegateApprovedAt",
        ],
        properties: {
          planId: {
            type: "string",
            format: "uuid",
            description: "Payment plan ID (from GET /api/plans)",
          },
          payerId: {
            type: "string",
            format: "uuid",
            description:
              "Payer ID (must be created via POST /api/payers first). Verify payer exists before calling this endpoint.",
          },
          tokenMint: {
            type: "string",
            description:
              "SPL token mint address (e.g., USDC/USDT/SOL) - must be supported by the selected plan",
          },
          delegateTxSignature: {
            type: "string",
            description:
              "Transaction signature from on-chain approve_delegate instruction (proof of delegation)",
          },
          delegateAuthority: {
            type: "string",
            description:
              'PDA address with delegate authority - derived from seeds: ["delegate", subscription_id, payer.publicKey]',
          },
          delegateApprovedAt: {
            type: "string",
            format: "date-time",
            description:
              "ISO timestamp when delegation was approved on-chain (use current time)",
          },
        },
      },
      response: {
        201: {
          description:
            "Subscription created successfully. Status is ACTIVE and relayer will start charging on nextDueAt.",
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Subscription ID",
            },
            planId: { type: "string", format: "uuid" },
            payerId: { type: "string", format: "uuid" },
            tokenMint: { type: "string", description: "Token mint address" },
            status: {
              type: "string",
              enum: ["ACTIVE", "CANCELLED", "EXPIRED"],
            },
            nextDueAt: {
              type: "string",
              format: "date-time",
              description: "When the next payment will be charged by relayer",
            },
            lastPaidAt: {
              type: "string",
              format: "date-time",
              description: "When the last payment was processed",
            },
            delegateAuthority: {
              type: "string",
              description: "PDA with authority for relayer to charge",
            },
            delegateTxSignature: {
              type: "string",
              description: "Proof of delegation on-chain",
            },
            delegateApprovedAt: { type: "string", format: "date-time" },
            tokenDecimals: {
              type: "integer",
              description: "Token decimals for amount calculations",
            },
            totalApprovedAmount: {
              type: "string",
              description:
                "Total amount approved for subscription duration (plan.price * plan.durationMonths)",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        404: {
          description: "Plan not found, payer not found, or plan is inactive",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        400: {
          description: "Validation error or token not supported by plan",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: createSubscription,
  });

  // GET /api/subscriptions - List subscriptions for receiver
  fastify.get<{ Querystring: GetSubscriptionQuery }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Subscriptions"],
      summary: "List all subscriptions",
      description:
        "Get paginated list of subscriptions for the authenticated receiver (merchant). " +
        "Shows all subscriptions across all plans owned by this receiver. " +
        "Supports filtering by status, date range, token type, and plan. " +
        "Useful for dashboard, revenue analytics, and subscriber management.",
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
            enum: ["ACTIVE", "CANCELLED", "EXPIRED", "all"],
            default: "all",
            description:
              "Filter by subscription status (ACTIVE = currently charging, CANCELLED = user unsubscribed, EXPIRED = duration ended)",
          },
          planId: {
            type: "string",
            format: "uuid",
            description: "Filter by specific payment plan ID",
          },
          tokenMint: {
            type: "string",
            description:
              "Filter by token mint address (e.g., filter for USDC subscriptions only)",
          },
          dateFrom: {
            type: "string",
            format: "date-time",
            description:
              "Filter subscriptions created on or after this date (ISO format)",
          },
          dateTo: {
            type: "string",
            format: "date-time",
            description:
              "Filter subscriptions created on or before this date (ISO format)",
          },
          search: {
            type: "string",
            description:
              "Search by payer name, payer wallet address, or plan name (case-insensitive)",
          },
        },
      },
      response: {
        200: {
          description: "List of subscriptions with payer and plan details",
          type: "object",
          properties: {
            data: {
              type: "array",
              description: "Array of subscription objects with relations",
              items: { type: "object" },
            },
            meta: {
              type: "object",
              description: "Pagination metadata",
              properties: {
                page: { type: "integer", description: "Current page number" },
                limit: {
                  type: "integer",
                  description: "Items per page",
                },
                total: {
                  type: "integer",
                  description: "Total matching subscriptions",
                },
                totalPages: {
                  type: "integer",
                  description: "Total number of pages",
                },
              },
            },
          },
        },
      },
    },
    handler: getSubscriptions,
  });

  // GET /api/subscriptions/:id - Get subscription details
  fastify.get<{ Params: subscriptionIdParam }>("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Subscriptions"],
      summary: "Get subscription by ID",
      description:
        "Retrieve detailed subscription information including payer details, plan info, " +
        "and payment execution history (last 10 charges). " +
        "Useful for subscription detail page, debugging payment issues, and viewing charge history.",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Subscription ID",
          },
        },
      },
      response: {
        200: {
          description: "Subscription details with payment history",
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            status: {
              type: "string",
              description: "Current subscription status",
            },
            nextDueAt: {
              type: "string",
              format: "date-time",
              description: "Next scheduled payment date",
            },
            lastPaidAt: {
              type: "string",
              format: "date-time",
              description: "Last successful payment date",
            },
            payer: {
              type: "object",
              description: "Subscriber information (name, wallet, email)",
            },
            plan: {
              type: "object",
              description: "Payment plan details (name, pricing, tokens)",
            },
            paymentExecutions: {
              type: "array",
              description:
                "Last 10 payment attempts with status (SUCCESS/FAILED) and transaction signatures",
              items: { type: "object" },
            },
          },
        },
        404: {
          description:
            "Subscription not found or doesn't belong to this receiver",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: getSubscription,
  });

  // DELETE /api/subscriptions/:id - Cancel subscription after on-chain revoke
  fastify.delete<{ Params: subscriptionIdParam; Body: CancelSubscriptionBody }>(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["Subscriptions"],
        summary: "Cancel subscription",
        description:
          "Cancel an active subscription after revoking delegate authority on-chain. " +
          "Call this AFTER the user has revoked delegation via the revoke_delegate contract instruction. " +
          "Once cancelled, the subscription cannot be reactivated - user must create new subscription. " +
          "The relayer will no longer charge this subscription.",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Subscription ID to cancel",
            },
          },
        },
        body: {
          type: "object",
          required: ["revokeTxSignature"],
          properties: {
            revokeTxSignature: {
              type: "string",
              description:
                "Transaction signature from on-chain revoke_delegate instruction. " +
                "This proves the user actually revoked the delegation on-chain and closed the PDA.",
            },
          },
        },
        response: {
          200: {
            description:
              "Subscription cancelled successfully. Status changed to CANCELLED.",
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              status: {
                type: "string",
                enum: ["CANCELLED"],
                description: "Status is now CANCELLED",
              },
              payer: {
                type: "object",
                description: "Payer information",
              },
              plan: {
                type: "object",
                description: "Plan information",
              },
            },
          },
          404: {
            description:
              "Subscription not found or doesn't belong to this receiver",
            type: "object",
            properties: {
              statusCode: { type: "integer" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Subscription already cancelled or validation error",
            type: "object",
            properties: {
              statusCode: { type: "integer" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      handler: cancelSubscription,
    }
  );
}
