export async function payerRoutes(fastify: FastifyInstance) {
  // POST /api/payers - Create a new payer
  fastify.post<{ Body: CreatePayerBody }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payers"],
      summary: "Create a payer",
      description:
        "Create a new payer with wallet address, name, and optional email. Wallet address must be unique.",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["walletAddress", "name"],
        properties: {
          walletAddress: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Unique Solana wallet address",
          },
          name: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            description: "Payer's full name or display name",
          },
          email: {
            type: "string",
            format: "email",
            description: "Optional email address for notifications",
          },
        },
      },
      response: {
        201: {
          description: "Payer created successfully",
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "Payer ID" },
            walletAddress: { type: "string", description: "Wallet address" },
            name: { type: "string", description: "Payer name" },
            email: { type: "string", description: "Email address" },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        400: {
          description: "Validation error or duplicate wallet address",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: createPayer,
  });

