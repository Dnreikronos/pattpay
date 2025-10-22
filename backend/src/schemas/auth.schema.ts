import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  description: z.string().optional(),
  walletAddress: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
  tokenAccountUSDT: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid token account format"),
  tokenAccountUSDC: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid token account format"),
});

export const signinSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type SignupBody = z.infer<typeof signupSchema>;
export type SigninBody = z.infer<typeof signinSchema>;
