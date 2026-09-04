import { describe, expect, it } from "vitest";

import { ACCOUNT_DELETE_PHRASE, matchesConfirmationPhrase, removeAll, removeById } from "../lib/data/delete-helpers";

describe("safe delete helpers", () => {
  it("requires the exact account confirmation phrase", () => {
    expect(matchesConfirmationPhrase(`  ${ACCOUNT_DELETE_PHRASE} `)).toBe(true);
    expect(matchesConfirmationPhrase("احذف الحساب")).toBe(false);
    expect(matchesConfirmationPhrase("")).toBe(false);
  });

  it("removes only the requested item", () => {
    const items = [{ id: "post-1" }, { id: "post-2" }, { id: "post-3" }];
    expect(removeById(items, "post-2")).toEqual([{ id: "post-1" }, { id: "post-3" }]);
    expect(removeById(items, "missing")).toEqual(items);
  });

  it("clears all items without mutating the original list", () => {
    const items = [{ id: "notice-1" }, { id: "notice-2" }];
    expect(removeAll(items)).toEqual([]);
    expect(items).toHaveLength(2);
  });
});
