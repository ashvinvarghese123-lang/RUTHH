import { z } from "zod";

export const signupFormSchema = z.object({
  displayName: z.string().min(1, "Tell us what to call you."),
  username: z
    .string()
    .min(3, "At least 3 characters.")
    .max(24)
    .regex(/^[a-zA-Z0-9_.]+$/, "Letters, numbers, dots and underscores only."),
  email: z.string().email("Enter a valid email."),
  password: z
    .string()
    .min(8, "At least 8 characters.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[0-9]/, "Include a number."),
});
export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const loginFormSchema = z.object({
  identifier: z.string().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Enter a valid email."),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const journalFormSchema = z.object({
  title: z.string().min(1, "Give your entry a title."),
  rawContent: z.string().min(1, "Write something before saving."),
  location: z.string().optional(),
  weather: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type JournalFormValues = z.infer<typeof journalFormSchema>;
