import { z } from 'zod';

// Signup Schema
export const signupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  email: z.string()
    .email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  description: z.string().optional(),
  walletAddress: z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid Solana address" }),
  tokenAccountUSDT: z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid USDT token account" }),
  tokenAccountUSDC: z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid USDC token account" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Signin Schema
export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
