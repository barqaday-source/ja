import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionStore = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => sessionStore.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { sessionStore.set(key, value); }),
    removeItem: vi.fn(async (key: string) => { sessionStore.delete(key); }),
  },
}));

import { loadAbuAlEreefSession, saveAbuAlEreefSession } from "@/lib/chat/abu-al-ereef-session";
import { buildOutfitSuggestions, type ParsedShoppingQuery, type ShoppingProduct } from "@/lib/search/product-search";
import type { ChatMessage } from "@/lib/chat/mock";

const products: ShoppingProduct[] = [
  { id: "top-1", name: "قميص كلاسيك", category: "ملابس وأزياء", price: 45_000, quantity: 4, companyName: "متجر 1", companyId: "store-1", imageUrl: "https://example.com/top.jpg" },
  { id: "accessory-1", name: "حزام جلدي", category: "إكسسوارات", price: 28_000, quantity: 6, companyName: "متجر 2", companyId: "store-2", imageUrl: "https://example.com/accessory.jpg" },
  { id: "shoe-1", name: "أحذية رياضية بيضاء", category: "أحذية", price: 75_000, quantity: 3, companyName: "متجر 3", companyId: "store-3", imageUrl: "https://example.com/shoes.jpg" },
  { id: "top-2", name: "جاكيت رسمي", category: "ملابس وأزياء", price: 85_000, quantity: 2, companyName: "متجر 4", companyId: "store-4", imageUrl: "https://example.com/jacket.jpg" },
];

const outfitQuery: ParsedShoppingQuery = {
  raw: "أريد تنسيق رسمي",
  productName: "",
  keywords: [],
  style: "رسمي",
  isOutfitRequest: true,
};

const message: ChatMessage = { id: "m1", sender: "me", kind: "text", text: "أريد تنسيق رسمي", time: "الآن" };

describe("أبو العريف: التنسيقات والجلسة", () => {
  beforeEach(() => sessionStore.clear());

  it("يبني تنسيقين مختلفين من منتجات متعددة ويحسب الإجمالي", () => {
    const outfits = buildOutfitSuggestions(products, outfitQuery);
    expect(outfits.length).toBeGreaterThanOrEqual(2);
    expect(outfits[0].products.length).toBeGreaterThanOrEqual(2);
    expect(outfits[0].totalPrice).toBe(outfits[0].products.reduce((sum, product) => sum + product.price, 0));
    expect(new Set(outfits.map((outfit) => outfit.id)).size).toBe(outfits.length);
  });

  it("يحافظ على صورة ومعرّف المتجر داخل كل تنسيق", () => {
    const outfits = buildOutfitSuggestions(products, outfitQuery);
    expect(outfits[0].products.every((product) => product.imageUrl && product.companyId)).toBe(true);
  });

  it("لا يقترح تنسيقاً عندما لا يطلب المستخدم تنسيقاً", () => {
    expect(buildOutfitSuggestions(products, { ...outfitQuery, isOutfitRequest: false })).toEqual([]);
  });

  it("يحافظ على سقف الميزانية الإجمالية للتنسيق", () => {
    const outfits = buildOutfitSuggestions(products, { ...outfitQuery, maxPrice: 150_000 });
    expect(outfits.every((outfit) => outfit.totalPrice <= 150_000)).toBe(true);
  });

  it("يحفظ الجلسة ويستعيدها بعد إعادة التحميل", async () => {
    await saveAbuAlEreefSession([message]);
    await expect(loadAbuAlEreefSession()).resolves.toEqual([message]);
  });

  it("يحد الجلسة إلى آخر 300 رسالة", async () => {
    const manyMessages = Array.from({ length: 320 }, (_, index) => ({ ...message, id: `m-${index}` }));
    await saveAbuAlEreefSession(manyMessages);
    const restored = await loadAbuAlEreefSession();
    expect(restored).toHaveLength(300);
    expect(restored?.[0].id).toBe("m-20");
  });
});
