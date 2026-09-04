import { describe, expect, it } from "vitest";

describe("Supabase products connection", () => {
  function getConfig() {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Supabase environment variables are required for this connection test.");
    return { url, key };
  }

  it("يقبل مفتاح publishable ويستجيب من REST API", async () => {
    const { url, key } = getConfig();
    const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    expect(response.ok, await response.text()).toBe(true);
  }, 15_000);

  it("يكشف حالة جدول products دون إخفاء غيابه قبل تشغيل migration", async () => {
    const { url, key } = getConfig();
    const response = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    expect([200, 404]).toContain(response.status);
    if (response.status === 404) {
      const body = await response.text();
      expect(body).toContain("products");
    }
  }, 15_000);
});
