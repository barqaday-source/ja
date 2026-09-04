import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(), setItem: vi.fn() },
}));

import { toggleBlock, toggleFollow, type SocialState } from "@/lib/social/following";

describe("social following state", () => {
  it("toggles a followed account", async () => {
    const state: SocialState = { followedIds: [], blockedIds: [] };
    const next = await toggleFollow(state, "shop-1");
    expect(next.followedIds).toEqual(["shop-1"]);
    const removed = await toggleFollow(next, "shop-1");
    expect(removed.followedIds).toEqual([]);
  });

  it("blocks an account and removes it from following", async () => {
    const state: SocialState = { followedIds: ["shop-1"], blockedIds: [] };
    const next = await toggleBlock(state, "shop-1");
    expect(next.blockedIds).toEqual(["shop-1"]);
    expect(next.followedIds).toEqual([]);
    const unblocked = await toggleBlock(next, "shop-1");
    expect(unblocked.blockedIds).toEqual([]);
  });
});
