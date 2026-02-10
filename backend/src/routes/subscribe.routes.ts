import { type FastifyInstance } from "fastify";
import { subscribe } from "../controllers/subscribe.controller.js";
import type { SubscribeBody } from "../schemas/subscribe.schema.js";

export async function subscribeRoutes(fastify: FastifyInstance) {
  // POST /api/subscribe - Simplified subscription creation for recurring plans
  fastify.post<{ Body: SubscribeBody }>("/", {
    schema: {
      tags: ["Subscribe"],
      summary: "Subscribe to a recurring plan (simplified workflow)",
      description:
        "Simplified endpoint that handles the complete subscription workflow:\n\n" +
        "1. **Checks if payer exists** by wallet address (creates new payer if not found)\n" +
        "2. **Verifies the plan is recurring** (one-time plans should use frontend payment + payment_executions)\n" +
        "3. **Creates the subscription** with on-chain delegation proof\n\n" +
        "**⚠️ IMPORTANT:** This endpoint is ONLY for recurring subscriptions.\n" +
        "For one-time payments:\n" +
        "- User pays directly via their wallet on the frontend\n" +
        "- Frontend sends transaction details to create a payment_execution record\n\n" +
        "**FRONTEND FLOW:**\n" +
        "1. User selects a recurring plan and token\n" +
        "2. Frontend calls Solana contract's `approve_delegate` instruction\n" +
        "3. User signs the transaction\n" +
        "4. Frontend calls POST /api/subscribe with all information in ONE request\n" +
        "5. Backend handles payer creation/retrieval and subscription creation automatically",
      body: {
        type: "object",
        required: [
          "payer",
          "planId",
          "tokenMint",
          "delegateTxSignature",
          "delegateAuthority",
          "delegateApprovedAt",
        ],
        properties: {
          payer: {
            type: "object",
            required: ["walletAddress", "name"],
            description: "Payer information (will be created if doesn't exist)",
            properties: {
              walletAddress: {
                type: "string",
                minLength: 1,
                maxLength: 255,
                description: "Solana wallet address of the subscriber",
              },
              name: {
                type: "string",
                minLength: 1,
                maxLength: 255,
                description: "Subscriber's full name or display name",
              },
              email: {
                type: "string",
                format: "email",
                description: "Optional email for notifications",
              },
            },
          },
          planId: {
            type: "string",
            format: "uuid",
            description: "ID of the recurring payment plan to subscribe to",
          },
          tokenMint: {
            type: "string",
            description:
              "SPL token mint address (e.g., USDC/USDT/SOL) - must be supported by the plan",
          },
          delegateTxSignature: {
            type: "string",
            description:
              "Transaction signature from on-chain approve_delegate instruction",
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
              "ISO timestamp when delegation was approved on-chain",
          },
        },
      },
      response: {
        201: {
          description: "Subscription created successfully",
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Subscription created successfully",
            },
            subscription: {
              type: "object",
              description: "Created subscription with plan and payer details",
              properties: {
                id: { type: "string", format: "uuid" },
                planId: { type: "string", format: "uuid" },
                payerId: { type: "string", format: "uuid" },
                tokenMint: { type: "string" },
                status: {
                  type: "string",
                  enum: ["ACTIVE"],
                  description: "Subscription is active and will be charged by relayer",
                },
                nextDueAt: {
                  type: "string",
                  format: "date-time",
                  description: "When the next payment will be charged",
                },
                lastPaidAt: {
                  type: "string",
                  format: "date-time",
                  description: "Last payment timestamp (initial approval time)",
                },
                delegateAuthority: { type: "string" },
                delegateTxSignature: { type: "string" },
                delegateApprovedAt: { type: "string", format: "date-time" },
                tokenDecimals: { type: "integer" },
                totalApprovedAmount: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                plan: {
                  type: "object",
                  description: "Plan details with receiver information",
                },
                payer: {
                  type: "object",
                  description: "Payer details",
                },
              },
            },
            payer: {
              type: "object",
              description: "Payer information and creation status",
              properties: {
                id: { type: "string", format: "uuid" },
                walletAddress: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                isNew: {
                  type: "boolean",
                  description: "Whether a new payer was created (true) or existing one used (false)",
                },
              },
            },
          },
        },
        400: {
          description:
            "Validation error, token not supported, or plan is not recurring",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: {
              type: "string",
              example: "This endpoint is only for recurring plans. One-time payments should be handled on the frontend.",
            },
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
          description: "Active subscription already exists for this payer and plan",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
            subscriptionId: {
              type: "string",
              format: "uuid",
              description: "ID of the existing active subscription",
            },
          },
        },
      },
    },
    handler: subscribe,
  });
}

