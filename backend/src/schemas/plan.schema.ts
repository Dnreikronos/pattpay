import { z } from "zod";
import { getSupportedTokenSymbols } from "../constants/tokens.js";

// Token pricing schema - frontend only sends symbol and price
const tokenPriceSchema = z.object({
  token: z.enum(getSupportedTokenSymbols() as [string, ...string[]], {
    message: `Token must be one of: ${getSupportedTokenSymbols().join(", ")}`,
  }),
  price: z.number().positive("Price must be positive"),
});

export const createPlanSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().max(1000).optional(),
    redirectUrl: z.string().url("Invalid redirect URL").optional(),
    expiresAt: z.string().datetime().optional(), // Optional expiration for one-time links
    isRecurring: z.boolean(),
    tokenPrices: z
      .array(tokenPriceSchema)
      .min(1, "At least one token price is required")
      .max(10, "Maximum 10 token prices allowed"),
    durationMonths: z.number().int().min(1).optional(),
    periodSeconds: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => {
      // If recurring, duration and period are required
      if (data.isRecurring) {
        return data.durationMonths != null && data.periodSeconds != null;
      }
      return true;
    },
    {
      message:
        "durationMonths and periodSeconds are required for recurring payments",
      path: ["isRecurring"],
    }
  )
  .refine(
    (data) => {
      // Check for duplicate token symbols
      const symbols = data.tokenPrices.map((tp) => tp.token);
      const uniqueSymbols = new Set(symbols);
      return symbols.length === uniqueSymbols.size;
    },
    {
      message: "Duplicate token symbols are not allowed",
      path: ["tokenPrices"],
    }
  );

export type CreatePlanBody = z.infer<typeof createPlanSchema>;

// Query parameters for GET /api/links
export const getLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["ACTIVE", "INACTIVE", "all"]).default("all"),
  isRecurring: z.enum(["true", "false", "all"]).default("all"),
  search: z.string().optional(),
});

export type GetLinksQuery = z.infer<typeof getLinksQuerySchema>;

// Request body for PUT /api/links/:id
export const updatePlanSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    redirectUrl: z.url("Invalid redirect URL").optional(),
    expiresAt: z.iso.datetime().optional(),
    tokenPrices: z
      .array(tokenPriceSchema)
      .min(1, "At least one token price is required")
      .max(10, "Maximum 10 token prices allowed")
      .optional(),
  })
  .refine(
    (data) => {
      // Check for duplicate token symbols if tokenPrices is provided
      if (data.tokenPrices) {
        const symbols = data.tokenPrices.map((tp) => tp.token);
        const uniqueSymbols = new Set(symbols);
        return symbols.length === uniqueSymbols.size;
      }
      return true;
    },
    {
      message: "Duplicate token symbols are not allowed",
      path: ["tokenPrices"],
    }
  );

export type UpdatePlanBody = z.infer<typeof updatePlanSchema>;

// URL parameter validation
export const planIdParamSchema = z.object({
  id: z.uuid("Invalid plan ID format"),
});

export type PlanIdParam = z.infer<typeof planIdParamSchema>;
