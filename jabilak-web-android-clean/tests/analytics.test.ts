import { describe, expect, it } from "vitest";
import { createAnalyticsEvent } from "@/lib/analytics";

describe("privacy-safe analytics", () => {
  it("removes identifying fields from event properties", () => {
    const event = createAnalyticsEvent("checkout_started", {
      screen: "cart",
      name: "محمد",
      phone: "07700000000",
      email: "user@example.com",
      itemCount: 2,
    });

    expect(event.name).toBe("checkout_started");
    expect(event.properties).toEqual({ screen: "cart", itemCount: 2 });
  });

  it("creates a timestamped event with a stable id", () => {
    const event = createAnalyticsEvent("screen_view", { path: "/explore" });
    expect(event.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(event.timestamp))).toBe(false);
    expect(event.properties.path).toBe("/explore");
  });
});
