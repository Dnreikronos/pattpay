import { type FastifyInstance } from "fastify";
import {
  getMeController,
  signinController,
  signupController,
} from "../controllers/auth.controller.js";

export async function authRoutes(fastify: FastifyInstance) {
  // Signup
  fastify.post("/signup", {
    schema: {
      tags: ["Authentication"],
      summary: "Register a new receiver account",
      description:
        "Create a receiver account with email/password or Solana wallet",
      body: {
        type: "object",
        required: [
          "name",
          "authMethod",
          "walletAddress",
          "tokenAccountUSDC",
          "tokenAccountUSDT",
        ],
        properties: {
          name: { type: "string", description: "Receiver name" },
          authMethod: {
            type: "string",
            enum: ["EMAIL_PASSWORD", "SOLANA_WALLET"],
            description: "Authentication method",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email (required for EMAIL_PASSWORD)",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "Password (required for EMAIL_PASSWORD)",
          },
          walletAddress: {
            type: "string",
            description: "Solana wallet address",
          },
          tokenAccountUSDC: {
            type: "string",
            description: "USDC token account address",
          },
          tokenAccountUSDT: {
            type: "string",
            description: "USDT token account address",
          },
          description: {
            type: "string",
            description: "Optional receiver description",
          },
        },
      },
      response: {
        201: {
          description: "Account created successfully",
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                authMethod: { type: "string" },
                walletAddress: { type: "string" },
                tokenAccountUSDC: { type: "string" },
                tokenAccountUSDT: { type: "string" },
                description: { type: "string", nullable: true },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
            token: { type: "string", description: "JWT token" },
          },
        },
      },
    },
    handler: signupController,
  });

  // Signin
  fastify.post("/signin", {
    schema: {
      tags: ["Authentication"],
      summary: "Login to receiver account",
      description: "Authenticate using email/password or wallet signature",
      body: {
        type: "object",
        required: ["authMethod"],
        properties: {
          authMethod: {
            type: "string",
            enum: ["EMAIL_PASSWORD", "SOLANA_WALLET"],
          },
          email: {
            type: "string",
            format: "email",
            description: "Email (for EMAIL_PASSWORD)",
          },
          password: {
            type: "string",
            description: "Password (for EMAIL_PASSWORD)",
          },
          walletAddress: {
            type: "string",
            description: "Wallet address (for SOLANA_WALLET)",
          },
          signature: {
            type: "string",
            description: "Signed message (for SOLANA_WALLET)",
          },
          message: {
            type: "string",
            description: "Original message (for SOLANA_WALLET)",
          },
        },
      },
      response: {
        200: {
          description: "Login successful",
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                authMethod: { type: "string" },
                walletAddress: { type: "string" },
                tokenAccountUSDC: { type: "string" },
                tokenAccountUSDT: { type: "string" },
                description: { type: "string", nullable: true },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
            token: { type: "string", description: "JWT token" },
          },
        },
      },
    },
    handler: signinController,
  });

  // Get current user
  fastify.get("/me", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Authentication"],
      summary: "Get current authenticated receiver",
      description: "Retrieve authenticated receiver's information",
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: "User information",
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                authMethod: { type: "string" },
                walletAddress: { type: "string" },
                tokenAccountUSDC: { type: "string" },
                tokenAccountUSDT: { type: "string" },
                description: { type: "string", nullable: true },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    handler: getMeController,
  });
}
