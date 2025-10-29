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

  // GET /api/payers - List all payers with pagination and search
  fastify.get<{ Querystring: GetPayersQuery }>("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payers"],
      summary: "List all payers",
      description:
        "Get paginated list of payers with optional search by name, email, or wallet address. Includes subscription count for each payer.",
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
          search: {
            type: "string",
            description:
              "Search term to filter by name, email, or wallet address (case-insensitive)",
          },
        },
      },
      response: {
        200: {
          description: "List of payers with pagination metadata",
          type: "object",
          properties: {
            data: {
              type: "array",
              description: "Array of payer objects",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  walletAddress: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                  subscriptions: {
                    type: "array",
                    description: "List of active subscriptions",
                    items: { type: "object" },
                  },
                },
              },
            },
            meta: {
              type: "object",
              description: "Pagination metadata",
              properties: {
                page: {
                  type: "integer",
                  description: "Current page number",
                },
                limit: {
                  type: "integer",
                  description: "Items per page",
                },
                total: {
                  type: "integer",
                  description: "Total number of payers",
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
    handler: getPayers,
  });

  // GET /api/payers/:id - Get payer by ID
  fastify.get<{ Params: PayerIdParam }>("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Payers"],
      summary: "Get payer by ID",
      description:
        "Retrieve detailed information about a specific payer including all their subscriptions",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Unique payer ID",
          },
        },
      },
      response: {
        200: {
          description: "Payer details with subscriptions",
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            walletAddress: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            subscriptions: {
              type: "array",
              description: "All subscriptions associated with this payer",
              items: { type: "object" },
            },
          },
        },
        404: {
          description: "Payer not found",
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: getPayer,
  });

