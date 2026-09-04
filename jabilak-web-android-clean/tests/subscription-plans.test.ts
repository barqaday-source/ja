import { describe, expect, it } from "vitest";

import { getAdminSettings } from "@/lib/admin-settings";

describe("باقات اشتراك جايبلك", () => {
  it("contains the three configured plans and their prices", () => {
    const plans = getAdminSettings().subscriptionPlans;
    expect(plans.map((plan) => plan.id)).toEqual(["free", "standard", "vip"]);
    expect(plans.map((plan) => plan.price)).toEqual([0, 15_000, 35_000]);
    expect(plans.map((plan) => plan.period)).toEqual(["14 يوماً", "شهرياً", "شهرياً"]);
  });

  it("exposes the promised core features", () => {
    const plans = getAdminSettings().subscriptionPlans;
    expect(plans[0].features).toContain("إدارة 15 منتجاً");
    expect(plans[0].features).toContain("دفتر ديون مصغر حتى 5 زبائن");
    expect(plans[1].features).toContain("ظهور في بحث أبو العريف");
    expect(plans[2].features).toContain("علامة التوثيق ✔");
    expect(plans[2].features).toContain("ترويج منشورين في التوب سلايدر شهرياً");
  });
});
