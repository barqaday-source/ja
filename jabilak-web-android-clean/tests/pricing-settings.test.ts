import { describe, expect, it } from "vitest";

import { getPromotionalPlan } from "@/lib/payment-config";
import { getAdminSettings } from "@/lib/admin-settings";

describe("أسعار الترويج والتوثيق", () => {
  it("uses the sponsored-post price for exactly three days", () => {
    const plan = getPromotionalPlan(3);
    expect(plan.amount).toBe(5_000);
    expect(plan.currency).toBe("IQD");
    expect(plan.days).toBe(3);
    expect(plan.placement).toBe("top_carousel");
    expect(plan.rankingLabel).toContain("أبو العريف");
  });

  it("keeps standalone store verification separate from VIP", () => {
    const plan = getAdminSettings().verificationPlan;
    expect(plan.amount).toBe(10_000);
    expect(plan.period).toBe("مرة واحدة");
    expect(plan.annualAmount).toBe(10_000);
    expect(plan.annualPeriod).toBe("سنوياً");
    expect(plan.badgeColors.primary).toBe("#2563EB");
    expect(plan.badgeColors.secondary).toBe("#CA8A04");
    expect(plan.publicValue).toContain("انتحال");
  });
});
