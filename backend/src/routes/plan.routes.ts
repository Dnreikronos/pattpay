import { type FastifyInstance } from "fastify";
import { createPlanController } from "../controllers/plan.controller.js";
import type { CreatePlanBody } from "../schemas/plan.schema.js";

export async function planRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreatePlanBody }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Links"],
      summary: "Create a payment link",
      description:
        "Create a one-time or recurring payment link with multiple token options",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["name", "isRecurring", "tokenPrices"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Payment link name",
          },
          description: {
            type: "string",
            maxLength: 1000,
            description: "Optional description",
          },
          redirectUrl: {
            type: "string",
            format: "uri",
            description: "URL to redirect after payment",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
            description: "Expiration date for the payment link",
          },
          isRecurring: {
            type: "boolean",
            description:
              "Whether this is a subscription (recurring) or one-time payment",
          },
          durationMonths: {
            type: "integer",
            minimum: 1,
            description:
              "Subscription duration in months (required for recurring)",
          },
          periodSeconds: {
            type: "integer",
            minimum: 1,
            description:
              "Billing period in seconds (required for recurring, e.g., 2592000 = 30 days)",
          },
          tokenPrices: {
            type: "array",
            minItems: 1,
            maxItems: 10,
            description: "Accepted tokens and their prices",
            items: {
              type: "object",
              required: ["token", "price"],
              properties: {
                token: {
                  type: "string",
                  enum: ["USDC", "USDT", "SOL"],
                  description: "Token symbol",
                },
                price: {
                  type: "number",
                  exclusiveMinimum: 0,
                  description: "Price in the specified token",
                },
              },
            },
          },
        },
      },
      response: {
        201: {
          description: "Payment link created successfully",
          type: "object",
          properties: {
            link: {
              type: "object",
              properties: {
                id: { type: "string", description: "Payment link ID" },
                name: { type: "string" },
                description: { type: "string" },
                url: { type: "string", description: "Generated payment URL" },
                redirectUrl: { type: "string" },
                expiresAt: { type: "string", format: "date-time" },
                isRecurring: { type: "boolean" },
                status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                durationMonths: { type: "integer" },
                periodSeconds: { type: "integer" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                receiver: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    walletAddress: { type: "string" },
                  },
                },
                tokenPrices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      token: { type: "string" },
                      tokenMint: {
                        type: "string",
                        description: "Token mint address",
                      },
                      tokenDecimals: { type: "integer" },
                      price: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    handler: createPlanController,
  });
}
