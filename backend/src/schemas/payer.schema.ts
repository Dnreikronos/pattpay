import { z } from "zod";

export const createPayerSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required").max(255),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").optional(),
});
