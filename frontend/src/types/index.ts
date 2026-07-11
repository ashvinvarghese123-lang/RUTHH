export type Mood =
  | "HAPPY" | "SAD" | "EXCITED" | "CALM" | "ANXIOUS" | "GRATEFUL"
  | "ANGRY" | "TIRED" | "LOVED" | "NEUTRAL" | "HOPEFUL" | "NOSTALGIC";

export type AIMode = "KEEP_ORIGINAL" | "DIARY_STYLE" | "STORYTELLING" | "MINIMAL";

export type PermissionLevel = "VIEW_ONLY" | "COMMENT" | "CLOSE_FRIEND" | "FAMILY" | "PARTNER";

export interface Profile {
  displayName: string;
  bio?: string | null;
  profilePhoto?: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
  profile: Profile;
}

export interface Photo {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  position: number;
  paragraphAnchor?: number | null;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  rawContent: string;
  content: string;
  aiMode?: AIMode | null;
  suggestedTitle?: string | null;
  suggestedQuote?: string | null;
  reflection?: string | null;
  gratitude?: string | null;
  mood: Mood;
  location?: string | null;
  weather?: string | null;
  tags: string[];
  isFavorite: boolean;
  isPrivate: boolean;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  photos: Photo[];
}

export interface SharedEntrySummary {
  id: string;
  permission: PermissionLevel;
  createdAt: string;
  journalEntry: JournalEntry;
  owner: { username: string; profile: Profile };
}

export interface Notification {
  id: string;
  type: "SHARED_JOURNAL" | "NEW_COMMENT" | "MEMORY_REMINDER" | "WRITING_REMINDER" | "ACCESS_REVOKED";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "HAPPY", label: "Happy", emoji: "🙂" },
  { value: "EXCITED", label: "Excited", emoji: "✨" },
  { value: "CALM", label: "Calm", emoji: "🍃" },
  { value: "GRATEFUL", label: "Grateful", emoji: "🤍" },
  { value: "LOVED", label: "Loved", emoji: "💫" },
  { value: "HOPEFUL", label: "Hopeful", emoji: "🌤" },
  { value: "NOSTALGIC", label: "Nostalgic", emoji: "🕊" },
  { value: "TIRED", label: "Tired", emoji: "🌙" },
  { value: "ANXIOUS", label: "Anxious", emoji: "🌫" },
  { value: "SAD", label: "Sad", emoji: "🌧" },
  { value: "ANGRY", label: "Angry", emoji: "🔥" },
  { value: "NEUTRAL", label: "Neutral", emoji: "⚪" },
];

export const AI_MODES: { value: AIMode; label: string; description: string }[] = [
  { value: "KEEP_ORIGINAL", label: "Keep Original", description: "Only fix grammar" },
  { value: "DIARY_STYLE", label: "Diary Style", description: "Beautiful journal writing" },
  { value: "STORYTELLING", label: "Storytelling", description: "Cinematic writing" },
  { value: "MINIMAL", label: "Minimal", description: "Short version" },
];
