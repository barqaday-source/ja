import { requireSupabase, requireUser } from "./client";

export type LiveChatParticipant = { id: string; name: string; avatar: string; role: "customer" | "merchant" | "assistant"; online: boolean };
export type LiveChatPreview = LiveChatParticipant & { lastMessage: string; time: string; unread: number; pinned?: boolean };
export type LiveChatMessage = { id: string; sender: "me" | "them"; senderId: string; kind: "text" | "image" | "file" | "voice" | "product_results"; text?: string; uri?: string; fileName?: string; fileSize?: number; mimeType?: string; duration?: string; time: string; read?: boolean; products?: any[]; outfits?: any[] };

type MemberRow = { conversation_id: string; user_id: string; last_read_at: string | null; is_muted: boolean; conversations?: { id: string; updated_at: string } | null };
type ProfileRow = { id: string; display_name: string; avatar_url: string | null; role: string };
type MessageRow = { id: string; conversation_id: string; sender_id: string; kind: "text" | "image" | "file" | "voice"; body: string | null; attachment_path: string | null; attachment_url: string | null; file_name: string | null; mime_type: string | null; file_size_bytes: number | null; duration_seconds: number | null; created_at: string; deleted_at: string | null };

const client = () => requireSupabase() as any;
const formatTime = (value: string) => new Date(value).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
const avatar = (url: string | null) => url || "https://ui-avatars.com/api/?name=%D8%AA%D8%A7%D8%AC%D8%B1&background=E8F0F7&color=2B516E";

async function signedAttachment(path: string | null) {
  if (!path) return undefined;
  const { data } = await client().storage.from("chat-media").createSignedUrl(path, 60 * 60);
  return data?.signedUrl;
}

export async function listConversations(): Promise<LiveChatPreview[]> {
  const user = await requireUser();
  const db = client();
  const { data: memberRows, error } = await db.from("conversation_members").select("conversation_id,user_id,last_read_at,is_muted,conversations:conversation_id(id,updated_at)").eq("user_id", user.id).order("joined_at", { ascending: false });
  if (error) throw error;
  const rows = (memberRows ?? []) as MemberRow[];
  if (!rows.length) return [];
  const ids = rows.map((row) => row.conversation_id);
  const { data: allMembers, error: membersError } = await db.from("conversation_members").select("conversation_id,user_id").in("conversation_id", ids).neq("user_id", user.id);
  if (membersError) throw membersError;
  const otherIds = [...new Set((allMembers ?? []).map((row: any) => row.user_id))];
  const { data: profiles, error: profilesError } = otherIds.length ? await db.from("profiles").select("id,display_name,avatar_url,role").in("id", otherIds) : { data: [], error: null };
  if (profilesError) throw profilesError;
  const profileMap = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
  const previews = await Promise.all(rows.map(async (row) => {
    const otherId = (allMembers ?? []).find((member: any) => member.conversation_id === row.conversation_id)?.user_id;
    const profile = otherId ? profileMap.get(otherId) : undefined;
    const { data: latest, error: latestError } = await db.from("messages").select("body,kind,created_at").eq("conversation_id", row.conversation_id).is("deleted_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (latestError) throw latestError;
    const { count, error: unreadError } = await db.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", row.conversation_id).neq("sender_id", user.id).is("deleted_at", null).gt("created_at", row.last_read_at ?? "1970-01-01T00:00:00.000Z");
    if (unreadError) throw unreadError;
    return { id: row.conversation_id, name: profile?.display_name ?? "مستخدم", subtitle: profile?.role === "merchant" ? "متجر" : "عميل", avatar: avatar(profile?.avatar_url ?? null), online: false, role: profile?.role === "merchant" ? "merchant" : "customer", lastMessage: latest?.body ?? (latest?.kind === "image" ? "صورة مرفقة" : latest?.kind === "file" ? "مستند مرفق" : latest?.kind === "voice" ? "رسالة صوتية" : "لا توجد رسائل"), time: latest?.created_at ? formatTime(latest.created_at) : "", unread: count ?? 0 } as LiveChatPreview;
  }));
  return previews;
}

export async function getConversation(conversationId: string) {
  const user = await requireUser();
  const db = client();
  const { data: members, error } = await db.from("conversation_members").select("user_id").eq("conversation_id", conversationId);
  if (error) throw error;
  const otherId = (members ?? []).find((member: any) => member.user_id !== user.id)?.user_id;
  const { data: profile } = otherId ? await db.from("profiles").select("id,display_name,avatar_url,role").eq("id", otherId).maybeSingle() : { data: null };
  return { id: conversationId, name: profile?.display_name ?? "مستخدم", subtitle: profile?.role === "merchant" ? "متجر" : "عميل", avatar: avatar(profile?.avatar_url ?? null), online: false, role: profile?.role === "merchant" ? "merchant" : "customer" } as LiveChatParticipant & { subtitle: string };
}

export async function listMessages(conversationId: string): Promise<LiveChatMessage[]> {
  const user = await requireUser();
  const { data, error } = await client().from("messages").select("id,conversation_id,sender_id,kind,body,attachment_path,attachment_url,file_name,mime_type,file_size_bytes,duration_seconds,created_at,deleted_at").eq("conversation_id", conversationId).is("deleted_at", null).order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all(((data ?? []) as MessageRow[]).map(async (row) => ({ id: row.id, sender: row.sender_id === user.id ? "me" : "them", senderId: row.sender_id, kind: row.kind, text: row.body ?? undefined, uri: row.attachment_url ?? await signedAttachment(row.attachment_path), fileName: row.file_name ?? undefined, mimeType: row.mime_type ?? undefined, fileSize: row.file_size_bytes ?? undefined, duration: row.duration_seconds ? `0:${String(row.duration_seconds).padStart(2, "0")}` : undefined, time: formatTime(row.created_at), read: row.sender_id === user.id })));
}

export function subscribeToMessages(conversationId: string, onChange: () => void) {
  const channel = client().channel(`messages:${conversationId}`).on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, onChange).subscribe();
  return () => { void client().removeChannel(channel); };
}

export async function sendChatMessage(input: { conversationId: string; kind: "text" | "image" | "file" | "voice"; body?: string; localUri?: string; mimeType?: string; fileName?: string; fileSize?: number; durationSeconds?: number }) {
  const user = await requireUser();
  const db = client();
  let attachmentPath: string | null = null;
  if (input.localUri) {
    const response = await fetch(input.localUri);
    const blob = await response.blob();
    if (input.fileSize && input.fileSize > 25 * 1024 * 1024) throw new Error("حجم الملف يتجاوز الحد المسموح وهو 25 ميجابايت.");
    const extension = input.fileName?.split(".").pop() || input.mimeType?.split("/")[1] || "bin";
    attachmentPath = `${input.conversationId}/${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await db.storage.from("chat-media").upload(attachmentPath, blob, { contentType: input.mimeType || "image/jpeg", upsert: false });
    if (error) throw error;
  }
    const { error } = await db.from("messages").insert({ conversation_id: input.conversationId, sender_id: user.id, kind: input.kind, body: input.body?.trim() || null, attachment_path: attachmentPath, file_name: input.fileName ?? null, mime_type: input.mimeType ?? null, file_size_bytes: input.fileSize ?? null, duration_seconds: input.durationSeconds ?? null });
  if (error) throw error;
}

export async function updateChatMessage(id: string, body: string) {
  const { error } = await client().from("messages").update({ body: body.trim() || null }).eq("id", id);
  if (error) throw error;
}
export async function deleteChatMessage(id: string) {
  const { error } = await client().from("messages").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
export async function markConversationRead(conversationId: string) {
  const user = await requireUser();
  const { error } = await client().from("conversation_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", user.id);
  if (error) throw error;
}
export async function deleteConversation(conversationId: string) {
  const user = await requireUser();
  const { error } = await client().from("conversations").delete().eq("id", conversationId).eq("created_by", user.id);
  if (error) throw error;
}

export function createConversationRepository() { return { listConversations, getConversation, listMessages, subscribeToMessages, sendChatMessage, updateChatMessage, deleteChatMessage, markConversationRead, deleteConversation }; }
export const chatRepository = createConversationRepository();
