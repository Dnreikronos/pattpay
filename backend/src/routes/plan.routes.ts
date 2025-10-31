import { type FastifyInstance } from "fastify";
import {
  createPlanController,
  getAllPlansController,
  getPlanByIdController,
  getPublicPlanByIdController,
  updatePlanController,
} from "../controllers/plan.controller.js";
import type {
  CreatePlanBody,
  GetLinksQuery,
  PlanIdParam,
  UpdatePlanBody,
} from "../schemas/plan.schema.js";

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

  // GET /api/links - List all payment links with pagination and filters
  fastify.get<{ Querystring: GetLinksQuery }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Links"],
      summary: "List all payment links",
      description:
        "Get paginated list of payment links with filtering and statistics",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            minimum: 1,
            default: 1,
            description: "Page number",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
            description: "Items per page",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "all"],
            default: "all",
            description: "Filter by status",
          },
          isRecurring: {
            type: "string",
            description: "Filter by recurring type (true, false, or 'all')",
          },
          search: {
            type: "string",
            description: "Search by name",
          },
          datePreset: {
            type: "string",
            enum: ["last-7-days", "last-30-days", "last-90-days", "custom"],
            description: "Filter by creation date",
          },
        },
      },
      response: {
        200: {
          description: "List of payment links with pagination and stats",
          type: "object",
          properties: {
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  amountUSDC: { type: "number" },
                  amountUSDT: { type: "number" },
                  status: { type: "string", enum: ["active", "inactive"] },
                  url: { type: "string" },
                  isRecurring: { type: "boolean" },
                  redirectUrl: { type: "string" },
                  description: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  totalPayments: { type: "integer" },
                  conversions: { type: "integer" },
                  views: { type: "integer" },
                  tokenPrices: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        token: { type: "string" },
                        tokenMint: { type: "string" },
                        tokenDecimals: { type: "integer" },
                        price: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
            stats: {
              type: "object",
              properties: {
                totalActive: { type: "integer" },
                totalCreated: { type: "integer" },
                averageConversion: { type: "number" },
                totalRevenue: { type: "number" },
                totalRevenueUSD: { type: "number" },
              },
            },
          },
        },
      },
    },
    handler: getAllPlansController,
  });

  // GET /api/links/public/:id - Get payment link by ID (PUBLIC - No authentication)
  fastify.get<{ Params: PlanIdParam }>("/public/:id", {
    schema: {
      tags: ["Payment Links"],
      summary: "Get payment link by ID (Public)",
      description: "Retrieve a specific payment link for public checkout pages. No authentication required. Only returns active, non-expired links.",
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Payment link ID",
          },
        },
      },
      response: {
        200: {
          description: "Payment link details",
          type: "object",
          properties: {
            link: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                amountUSDC: { type: "number" },
                amountUSDT: { type: "number" },
                status: { type: "string", enum: ["active", "inactive"] },
                url: { type: "string" },
                isRecurring: { type: "boolean" },
                redirectUrl: { type: "string" },
                description: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                totalPayments: { type: "integer" },
                conversions: { type: "integer" },
                views: { type: "integer" },
                expiresAt: { type: "string", format: "date-time" },
                durationMonths: { type: "integer" },
                periodSeconds: { type: "integer" },
                tokenPrices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      token: { type: "string" },
                      tokenMint: { type: "string" },
                      tokenDecimals: { type: "integer" },
                      price: { type: "string" },
                    },
                  },
                },
                receiver: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    walletAddress: { type: "string" },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Payment link not found, inactive, or expired",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: getPublicPlanByIdController,
  });

  // GET /api/links/:id - Get payment link by ID
  fastify.get<{ Params: PlanIdParam }>("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Links"],
      summary: "Get payment link by ID",
      description: "Retrieve a specific payment link with full details",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Payment link ID",
          },
        },
      },
      response: {
        200: {
          description: "Payment link details",
          type: "object",
          properties: {
            link: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                amountUSDC: { type: "number" },
                amountUSDT: { type: "number" },
                status: { type: "string", enum: ["active", "inactive"] },
                url: { type: "string" },
                isRecurring: { type: "boolean" },
                redirectUrl: { type: "string" },
                description: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
                totalPayments: { type: "integer" },
                conversions: { type: "integer" },
                views: { type: "integer" },
                expiresAt: { type: "string", format: "date-time" },
                durationMonths: { type: "integer" },
                periodSeconds: { type: "integer" },
                tokenPrices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      token: { type: "string" },
                      tokenMint: { type: "string" },
                      tokenDecimals: { type: "integer" },
                      price: { type: "string" },
                    },
                  },
                },
                receiver: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    walletAddress: { type: "string" },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Payment link not found",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: getPlanByIdController,
  });

  // PUT /api/links/:id - Update payment link
  fastify.put<{ Params: PlanIdParam; Body: UpdatePlanBody }>("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payment Links"],
      summary: "Update payment link",
      description:
        "Update payment link details including name, description, status, redirect URL, expiration, and token prices",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Payment link ID",
          },
        },
      },
      body: {
        type: "object",
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
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE"],
            description: "Link status",
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
        200: {
          description: "Payment link updated successfully",
          type: "object",
          properties: {
            link: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                status: { type: "string" },
                url: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        404: {
          description: "Payment link not found",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: updatePlanController,
  });
}
