/**
 * Contracts for the future Supabase + Agora integration.
 * The app reads live Supabase data only; these interfaces keep UI code provider-agnostic.
 */

export type ProfileRole = "customer" | "merchant" | "admin";

export type ProfileRecord = {
  id: string;
  displayName: string;
  role: ProfileRole;
  avatarUrl?: string;
  isOnline?: boolean;
  updatedAt?: string;
};

export type ConversationRecord = {
  id: string;
  participantIds: string[];
  lastMessageId?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

export type MessageKind = "text" | "image" | "voice";

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: MessageKind;
  body?: string;
  attachmentUrl?: string;
  attachmentPath?: string;
  durationSeconds?: number;
  createdAt: string;
  readAt?: string;
};

export type MediaUploadInput = {
  uri: string;
  fileName: string;
  contentType: string;
  sizeBytes?: number;
  bucket: "avatars" | "chat-media";
  folder: string;
};

export type UploadedMedia = {
  bucket: MediaUploadInput["bucket"];
  path: string;
  publicUrl?: string;
};

export type RealtimeSubscription = { unsubscribe: () => void };

export interface ProfileMediaRepository {
  uploadAvatar(input: MediaUploadInput): Promise<UploadedMedia>;
  removeAvatar(profileId: string, storagePath: string): Promise<void>;
  updateAvatar(profileId: string, avatarUrl: string, storagePath?: string): Promise<ProfileRecord>;
}

export interface ContentRepository {
  deletePost(postId: string, ownerId: string): Promise<void>;
}

export interface NotificationRepository {
  deleteNotification(notificationId: string, userId: string): Promise<void>;
  deleteAllNotifications(userId: string): Promise<void>;
}

export interface AccountRepository {
  deleteAccount(userId: string, confirmationPhrase: string): Promise<void>;
}

export interface ChatRepository {
  listConversations(userId: string): Promise<ConversationRecord[]>;
  listMessages(conversationId: string, limit?: number): Promise<MessageRecord[]>;
  sendMessage(input: Omit<MessageRecord, "id" | "createdAt">): Promise<MessageRecord>;
  markConversationRead(conversationId: string, userId: string): Promise<void>;
  deleteMessage(messageId: string, requesterId: string): Promise<void>;
  deleteConversation(conversationId: string, requesterId: string): Promise<void>;
  subscribeToMessages(conversationId: string, onMessage: (message: MessageRecord) => void): RealtimeSubscription;
  subscribeToPresence(conversationId: string, onPresence: (profiles: ProfileRecord[]) => void): RealtimeSubscription;
  setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void>;
}

export type VoiceCallStatus = "idle" | "ringing" | "connecting" | "connected" | "ended";

export type VoiceCallState = {
  callId: string;
  channelName: string;
  status: VoiceCallStatus;
  remoteUserId: string;
  muted: boolean;
  speakerOn: boolean;
  elapsedSeconds: number;
};

export interface VoiceCallProvider {
  requestSession(input: { callerId: string; calleeId: string }): Promise<{ callId: string; channelName: string; token: string }>;
  join(state: { channelName: string; token: string; uid: string }): Promise<void>;
  leave(): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setSpeakerEnabled(enabled: boolean): Promise<void>;
  subscribe(onState: (state: VoiceCallState) => void): RealtimeSubscription;
}

export type SupabaseRealtimeBinding = {
  chat: ChatRepository;
  profiles: ProfileMediaRepository;
  content: ContentRepository;
  notifications: NotificationRepository;
  account: AccountRepository;
};

export type AgoraBinding = {
  voice: VoiceCallProvider;
};

/**
 * Runtime wiring is intentionally left to a future integration module.
 * Screens should depend on these contracts rather than importing Supabase or Agora directly.
 */
export type SocialBackend = {
  supabase: SupabaseRealtimeBinding;
  agora: AgoraBinding;
};
