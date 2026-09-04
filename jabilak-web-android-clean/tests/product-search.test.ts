import { describe, expect, it } from "vitest";

import { buildWhatsAppBookingUrl, parseShoppingQuery, searchShoppingProducts } from "@/lib/search/product-search";

describe("أبو العريف — product search", () => {
  it("extracts product, Arabic color, and maximum price", () => {
    const parsed = parseShoppingQuery("أريد قميص أسود أقل من ٥٠ ألف دينار");
    expect(parsed.productName).toBe("قميص");
    expect(parsed.color).toBe("أسود");
    expect(parsed.maxPrice).toBe(50_000);
  });

  it("normalizes alternative Arabic spellings", () => {
    const parsed = parseShoppingQuery("ابحث عن احذية بيضاء بحدود ٨٠ الف");
    expect(parsed.productName).toBe("احذيه");
    expect(parsed.color).toBe("أبيض");
    expect(parsed.maxPrice).toBe(80_000);
  });

  it("filters the preview catalog by stock and price", async () => {
    const result = await searchShoppingProducts("أريد قميص أقل من ٥٠ ألف");
    expect(["local-preview", "supabase", "supabase-table", "local-fallback"]).toContain(result.source);
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product: { quantity: number; price: number }) => product.quantity > 0 && product.price <= 50_000)).toBe(true);
  });

  it("extracts a location and prioritizes sponsored local results", async () => {
    const parsed = parseShoppingQuery("أريد قميص في الكرادة أقل من ٥٠ ألف");
    expect(parsed.location).toBe("الكرادة");
    const result = await searchShoppingProducts("أريد قميص في الكرادة أقل من ٥٠ ألف");
    expect(result.products[0]?.isSponsored).toBe(true);
    expect(result.products[0]?.location).toContain("الكرادة");
  });

  it("creates a WhatsApp booking link", () => {
    const result = buildWhatsAppBookingUrl({ id: "p-1", name: "قميص كلاسيك", price: 45_000, quantity: 4, companyName: "شركة الأناقة", companyWhatsapp: "9647700000000" });
    expect(result).toContain("https://wa.me/9647700000000?text=");
    expect(result).toContain(encodeURIComponent("قميص كلاسيك"));
  });
});
