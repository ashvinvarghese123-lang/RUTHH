/**
 * Shared type contracts between the Ruth frontend and backend.
 * The backend's Prisma-generated types are the source of truth for
 * persistence; this file documents the wire-format (API) shapes so
 * both sides can be kept in sync by hand until a codegen step is added.
 *
 * Mirrors: backend/prisma/schema.prisma enums + frontend/src/types/index.ts
 */

export type Mood =
  | "HAPPY" | "SAD" | "EXCITED" | "CALM" | "ANXIOUS" | "GRATEFUL"
  | "ANGRY" | "TIRED" | "LOVED" | "NEUTRAL" | "HOPEFUL" | "NOSTALGIC";

export type AIMode = "KEEP_ORIGINAL" | "DIARY_STYLE" | "STORYTELLING" | "MINIMAL";

export type PermissionLevel = "VIEW_ONLY" | "COMMENT" | "CLOSE_FRIEND" | "FAMILY" | "PARTNER";

export type NotificationType =
  | "SHARED_JOURNAL" | "NEW_COMMENT" | "MEMORY_REMINDER" | "WRITING_REMINDER" | "ACCESS_REVOKED";
