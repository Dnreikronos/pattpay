import { z } from "zod";

export const createPayerSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required").max(255),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional(),
});

export type CreatePayerBody = z.infer<typeof createPayerSchema>;

export const updatePayerSchema = z.object({
  walletAddress: z.string().min(1).max(255).optional(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email("Invalid email").optional(),
});

export type UpdatePayerBody = z.infer<typeof updatePayerSchema>;

export const payerIdParamSchema = z.object({
  id: z.string().uuid("Invalid payer ID format"),
});

export type PayerIdParam = z.infer<typeof payerIdParamSchema>;

export const getPayersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type GetPayersQuery = z.infer<typeof getPayersQuerySchema>;
