import { z } from "zod";

const permissionEnum = z.enum(["VIEW_ONLY", "COMMENT", "CLOSE_FRIEND", "FAMILY", "PARTNER"]);

export const createShareSchema = z.object({
  body: z
    .object({
      journalEntryId: z.string().uuid(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      generateLink: z.boolean().optional(),
      permission: permissionEnum.default("VIEW_ONLY"),
    })
    .refine((v) => v.username || v.email || v.generateLink, {
      message: "Provide a username, an email, or request a private link.",
    }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const revokeShareSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ shareId: z.string().uuid() }),
});
