import { REAL_IMAGES } from "@/constants/assets";

export type ChatMessageKind = "text" | "image" | "file" | "voice" | "product_results";

export type ChatParticipant = {
  id: string;
  name: string;
  subtitle: string;
  avatar: string;
  online: boolean;
  role: "customer" | "merchant" | "assistant";
};

export type ChatPreview = ChatParticipant & {
  lastMessage: string;
  time: string;
  unread: number;
  pinned?: boolean;
};

export type ChatMessage = {
  id: string;
  sender: "me" | "them";
  kind: ChatMessageKind;
  text?: string;
  uri?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: string;
  products?: import("@/lib/search/product-search").ShoppingProduct[];
  outfits?: import("@/lib/search/product-search").ShoppingOutfit[];
  time: string;
  read?: boolean;
};

export const MOCK_CHATS: ChatPreview[] = [
  { id: "abu-arif", name: "أبو العريف", subtitle: "مساعد التسوق · بحث المنتجات", avatar: REAL_IMAGES.posts.model, online: true, role: "assistant", lastMessage: "اكتب اسم المنتج واللون والحد الأعلى للسعر", time: "الآن", unread: 0, pinned: true },
  { id: "alanaqa", name: "شركة الأناقة للملابس", subtitle: "متجر موثق · بغداد", avatar: REAL_IMAGES.stores.fashion, online: true, role: "merchant", lastMessage: "القميص متوفر الآن، أرسل لك التفاصيل؟", time: "10:42", unread: 2, pinned: true },
  { id: "noor", name: "متجر النور للإلكترونيات", subtitle: "متصل الآن · الكرادة", avatar: REAL_IMAGES.stores.electronics, online: true, role: "merchant", lastMessage: "تم تجهيز طلبك للشحن", time: "أمس", unread: 0 },
  { id: "layan", name: "ليان محمد", subtitle: "زبون · آخر ظهور منذ 8 دقائق", avatar: REAL_IMAGES.posts.model, online: false, role: "customer", lastMessage: "هل يناسبني المقاس M؟", time: "الأحد", unread: 0 },
  { id: "rawan", name: "بوتيك رَوان", subtitle: "متجر أزياء · أربيل", avatar: REAL_IMAGES.stores.boutique, online: false, role: "merchant", lastMessage: "أرسلت لك صور الألوان الجديدة", time: "السبت", unread: 1 },
];

const PERFORMANCE_TEXTS = [
  "هل ما زال المنتج متوفراً؟",
  "أرسل لي تفاصيل المقاسات والألوان المتاحة.",
  "تمام، أراجع الخيارات وأرجع لك بعد قليل.",
  "هل يمكن الحجز حتى نهاية اليوم؟",
  "نعم، حفظت لك الطلب بشكل مؤقت.",
  "شكراً، السعر مناسب جداً.",
];

function formatMockTime(index: number) {
  const totalMinutes = 9 * 60 + index;
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * بيانات اختبار محلية فقط. تُستخدم مع FlatList لاختبار virtualization والتمرير
 * قبل ربط الرسائل الحقيقية بقاعدة البيانات.
 */
export function createPerformanceMessages(count = 240): ChatMessage[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = offset + 1;
    const sender: ChatMessage["sender"] = index % 3 === 0 ? "them" : "me";
    const time = formatMockTime(index);

    if (index % 24 === 0) {
      return {
        id: `perf-image-${index}`,
        sender,
        kind: "image",
        uri: index % 48 === 0 ? REAL_IMAGES.products.shoes : REAL_IMAGES.products.shirt,
        text: "صورة من التشكيلة المتاحة حالياً.",
        time,
        read: sender === "them",
      };
    }

    if (index % 31 === 0) {
      return {
        id: `perf-file-${index}`,
        sender,
        kind: "file",
        fileName: index % 62 === 0 ? "كتالوج_التشكيلة.pdf" : "تفاصيل_الطلب.xlsx",
        fileSize: index % 62 === 0 ? 2_450_000 : 680_000,
        mimeType: index % 62 === 0 ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        text: "هذا الملف مرفق ضمن المحادثة للمراجعة.",
        time,
        read: sender === "them",
      };
    }

    return {
      id: `perf-text-${index}`,
      sender,
      kind: "text",
      text: PERFORMANCE_TEXTS[offset % PERFORMANCE_TEXTS.length],
      time,
      read: sender === "them" || index < count - 4,
    };
  });
}

const INITIAL_ALANAQA_MESSAGES: ChatMessage[] = [
  { id: "a1", sender: "them", kind: "text", text: "أهلاً بك في جَايَبْلَك، كيف أساعدك اليوم؟", time: "10:36", read: true },
  { id: "a2", sender: "me", kind: "text", text: "أبحث عن قميص رسمي بلون هادئ.", time: "10:37", read: true },
  { id: "a3", sender: "them", kind: "image", uri: REAL_IMAGES.products.shirt, time: "10:39", read: true },
  { id: "a4", sender: "them", kind: "text", text: "هذا القميص متوفر حالياً بمقاسات S وM وL.", time: "10:39", read: true },
  { id: "a5", sender: "me", kind: "text", text: "ممتاز، هل يمكن الحجز حتى المساء؟", time: "10:41", read: true },
  { id: "a6", sender: "them", kind: "voice", duration: "0:18", time: "10:42", read: false },
  { id: "a7", sender: "me", kind: "file", fileName: "تفاصيل_الطلب.pdf", fileSize: 1_240_000, mimeType: "application/pdf", time: "10:43", read: false },
];

export const PERFORMANCE_TEST_MESSAGE_COUNT = 240;

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "abu-arif": [
    { id: "abu-1", sender: "them", kind: "text", text: "هلا بيك، أنا أبو العريف. اكتب مثلاً: أريد قميص أسود أقل من 50 ألف، وأبحث لك عن المنتجات المتوفرة.", time: "الآن", read: true },
  ],
  alanaqa: [...INITIAL_ALANAQA_MESSAGES, ...createPerformanceMessages(PERFORMANCE_TEST_MESSAGE_COUNT)],
  noor: [
    { id: "n1", sender: "me", kind: "text", text: "أين وصل طلبي؟", time: "09:12", read: true },
    { id: "n2", sender: "them", kind: "text", text: "تم تجهيز طلبك للشحن وسيصلك رقم التتبع قريباً.", time: "09:16", read: true },
  ],
  layan: [
    { id: "l1", sender: "them", kind: "text", text: "هل يناسبني المقاس M؟", time: "الأحد", read: true },
  ],
  rawan: [
    { id: "r1", sender: "them", kind: "text", text: "أرسلت لك صور الألوان الجديدة.", time: "السبت", read: true },
  ],
};

export const CURRENT_USER = {
  id: "me",
  name: "مستخدم جَايَبْلَك",
  avatar: REAL_IMAGES.posts.model,
};

export function getChatById(id: string) {
  const normalizedId = id === "abu-al-ereef" ? "abu-arif" : id;
  return MOCK_CHATS.find((chat) => chat.id === normalizedId) ?? MOCK_CHATS[0];
}
