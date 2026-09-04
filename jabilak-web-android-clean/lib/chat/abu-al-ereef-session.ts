import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChatMessage } from "@/lib/chat/mock";

const STORAGE_KEY = "jabilak.abu-al-ereef.session.v1";
const MAX_SESSION_MESSAGES = 300;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<ChatMessage>;
  return typeof message.id === "string" &&
    (message.sender === "me" || message.sender === "them") &&
    typeof message.kind === "string" &&
    typeof message.time === "string";
}

export async function loadAbuAlEreefSession(): Promise<ChatMessage[] | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    const messages = parsed.filter(isChatMessage).slice(-MAX_SESSION_MESSAGES);
    return messages.length ? messages : null;
  } catch {
    return null;
  }
}

export async function saveAbuAlEreefSession(messages: ChatMessage[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_SESSION_MESSAGES)));
  } catch {
    // Session persistence must never interrupt the assistant experience.
  }
}

export async function clearAbuAlEreefSession() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
