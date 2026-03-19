import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  university: z.string().optional(),
  major: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["GIG", "INTERNSHIP", "PART_TIME", "FULL_TIME", "VOLUNTEER", "RESEARCH"]),
  paymentType: z.enum(["FREE", "CRYPTO", "NEGOTIABLE"]),
  compensationAmount: z.number().optional(),
  compensationCurrency: z.string().optional(),
  cryptoNetworkChain: z.string().optional(),
  isRemote: z.boolean().default(true),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  walletAddress: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
