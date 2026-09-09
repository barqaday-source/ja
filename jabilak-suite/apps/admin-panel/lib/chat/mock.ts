export type ChatMessageKind = "text" | "image" | "file" | "voice" | "product_results";
export type ChatParticipant = {
  id: string; name: string; subtitle: string; avatar: string; online: boolean;
  role: "customer" | "merchant" | "assistant";
};
export type ChatPreview = ChatParticipant & {
  lastMessage: string; time: string; unread: number; pinned?: boolean;
};
export type ChatMessage = {
  id: string; sender: "me" | "them"; kind: ChatMessageKind; text?: string; uri?: string;
  fileName?: string; fileSize?: number; mimeType?: string; duration?: string;
  products?: import("@/lib/search/product-search").ShoppingProduct[];
  outfits?: import("@/lib/search/product-search").ShoppingOutfit[]; time: string; read?: boolean;
};

// Production source only. The authenticated API supplies participants and messages.
export const MOCK_CHATS: ChatPreview[] = [];
export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {};
export const CURRENT_USER = { id: "", name: "", avatar: "" };
export const PERFORMANCE_TEST_MESSAGE_COUNT = 0;
export function createPerformanceMessages(_count = 0): ChatMessage[] { return []; }
export function getChatById(id: string): ChatPreview {
  return { id, name: "", subtitle: "", avatar: "", online: false, role: "customer", lastMessage: "", time: "", unread: 0 };
}
