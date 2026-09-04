import { describe, expect, it } from "vitest";

import { inferProductType, isProductType } from "../lib/product-taxonomy";

describe("product taxonomy", () => {
  it("recognizes clothing from product text", () => {
    expect(inferProductType({ name: "قميص كلاسيك", description: "قصة عصرية", category: "ملابس وأزياء" })).toBe("ملابس");
  });

  it("recognizes shoes from product text", () => {
    expect(inferProductType({ name: "أحذية رياضية بيضاء", description: "مريحة للمشي" })).toBe("أحذية");
  });

  it("recognizes accessories before falling back", () => {
    expect(inferProductType({ name: "حزام جلدي", description: "طبيعي", category: "ملابس وأزياء" })).toBe("إكسسوارات");
    expect(inferProductType({ name: "منتج جديد", description: "وصف عام" })).toBe("أخرى");
  });

  it("validates filter values", () => {
    expect(isProductType("أحذية")).toBe(true);
    expect(isProductType("غير موجود")).toBe(false);
  });
});
