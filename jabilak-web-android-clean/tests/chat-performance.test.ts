import { describe, expect, it } from "vitest";

import { createPerformanceMessages, PERFORMANCE_TEST_MESSAGE_COUNT } from "@/lib/chat/mock";

describe("chat performance fixtures", () => {
  it("creates the configured large fixture with unique message ids", () => {
    const messages = createPerformanceMessages(PERFORMANCE_TEST_MESSAGE_COUNT);
    const ids = new Set(messages.map((message) => message.id));

    expect(messages).toHaveLength(PERFORMANCE_TEST_MESSAGE_COUNT);
    expect(ids.size).toBe(PERFORMANCE_TEST_MESSAGE_COUNT);
  });

  it("includes text, image, and file messages for realistic virtualization", () => {
    const messages = createPerformanceMessages(240);
    const kinds = new Set(messages.map((message) => message.kind));

    expect(kinds).toEqual(new Set(["text", "image", "file"]));
    expect(messages.some((message) => message.kind === "image" && message.uri)).toBe(true);
    expect(messages.some((message) => message.kind === "file" && message.fileName && message.fileSize)).toBe(true);
  });

  it("handles a small requested count without leaking extra records", () => {
    const messages = createPerformanceMessages(3);

    expect(messages).toHaveLength(3);
    expect(messages.every((message) => message.id.startsWith("perf-"))).toBe(true);
  });
});
