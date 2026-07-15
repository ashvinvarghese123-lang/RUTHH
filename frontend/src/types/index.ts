export type Mood =
  | "HAPPY" | "SAD" | "EXCITED" | "CALM" | "ANXIOUS" | "GRATEFUL"
  | "ANGRY" | "TIRED" | "LOVED" | "NEUTRAL" | "HOPEFUL" | "NOSTALGIC";

export type AIMode = "KEEP_ORIGINAL" | "DIARY_STYLE" | "STORYTELLING" | "MINIMAL";

export type PermissionLevel = "VIEW_ONLY" | "COMMENT" | "CLOSE_FRIEND" | "FAMILY" | "PARTNER";

export type Visibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export type FriendRelationStatus = "SELF" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "NONE";

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

export interface PublicUser {
  id: string;
  username: string;
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
  isPinned: boolean;
  visibility: Visibility;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  photos: Photo[];
  // Present on feed / single-entry responses; absent on the plain "my journals" list.
  user?: PublicUser;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  user: PublicUser;
}

export interface Friendship {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  requesterId: string;
  addresseeId: string;
  requester?: PublicUser;
  addressee?: PublicUser;
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
  type:
    | "SHARED_JOURNAL" | "NEW_COMMENT" | "MEMORY_REMINDER" | "WRITING_REMINDER"
    | "ACCESS_REVOKED" | "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "NEW_LIKE";
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

export const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: "PUBLIC", label: "Public", description: "Anyone can see this in the feed" },
  { value: "FRIENDS", label: "Friends", description: "Only your friends see this" },
  { value: "PRIVATE", label: "Private", description: "Just you (unless directly shared)" },
];
