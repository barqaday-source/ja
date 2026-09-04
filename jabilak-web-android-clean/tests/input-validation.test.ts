import { describe, expect, it } from "vitest";

import { normalizeArabicDigits, parseLocalizedNumber, validateLocalizedNumber } from "@/lib/input-validation";

describe("localized numeric input", () => {
  it("normalizes Arabic and Eastern Arabic digits", () => {
    expect(normalizeArabicDigits("١٢٬٥٠٠")).toBe("12,500");
    expect(normalizeArabicDigits("۱۲٫۵")).toBe("12.5");
  });

  it("parses localized numbers", () => {
    expect(parseLocalizedNumber("١٢٬٥٠٠")).toBe(12500);
    expect(parseLocalizedNumber("سعر غير معروف")).toBeNull();
  });

  it("returns a friendly validation message for invalid or out-of-range values", () => {
    expect(validateLocalizedNumber("abc", { label: "السعر", min: 1, integer: true }).message).toContain("بالأرقام فقط");
    expect(validateLocalizedNumber("٠", { label: "السعر", min: 1, integer: true }).message).toContain("ألا يقل");
    expect(validateLocalizedNumber("١٢", { label: "الكمية", min: 0, integer: true })).toEqual({ value: 12, message: null });
  });
});
