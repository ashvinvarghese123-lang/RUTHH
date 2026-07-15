import { z } from "zod";

const username = z
  .string()
  .min(3, "Username must be at least 3 characters.")
  .max(24, "Username must be at most 24 characters.")
  .regex(/^[a-zA-Z0-9_.]+$/, "Username can only contain letters, numbers, dots and underscores.");

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(60).optional(),
    bio: z.string().max(280).optional(),
    username: username.optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const profileJournalsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }),
  params: z.object({ username: z.string().min(1) }),
});

export const profilePhotosSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    year: z.string().optional(),
    month: z.string().optional(),
  }),
  params: z.object({ username: z.string().min(1) }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "At least 8 characters.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[0-9]/, "Include a number."),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const changeEmailSchema = z.object({
  body: z.object({
    newEmail: z.string().email("Enter a valid email address."),
    password: z.string().min(1, "Enter your password to confirm."),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Enter your password to confirm."),
    reason: z.string().max(500).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
