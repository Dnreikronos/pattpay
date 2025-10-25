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
    durationMonths: z.number().int().positive().optional(),
    periodSeconds: z.number().int().positive().optional(),
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
